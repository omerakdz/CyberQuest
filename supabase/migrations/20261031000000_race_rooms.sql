create table if not exists public.race_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^CQ-[0-9]{4}$'),
  host_id uuid not null references auth.users(id) on delete cascade,
  host_name text not null,
  mode text not null check (mode in ('class', 'play')),
  status text not null default 'waiting' check (status in ('waiting', 'running', 'finished', 'closed')),
  current_round integer not null default 1 check (current_round between 1 and 20),
  started_at timestamptz,
  created_at timestamptz not null default now(),
  max_players integer not null default 8 check (max_players between 2 and 8)
);

create table if not exists public.race_room_players (
  room_id uuid not null references public.race_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('host', 'player')),
  is_playing boolean not null,
  ready boolean not null default true,
  score integer not null default 0,
  streak integer not null default 0,
  correct integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (room_id, user_id),
  check (char_length(name) between 1 and 24)
);

create table if not exists public.race_room_answers (
  room_id uuid not null references public.race_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  round integer not null check (round between 1 and 20),
  answered_at timestamptz not null default clock_timestamp(),
  points integer not null,
  primary key (room_id, user_id, round)
);

create index if not exists race_room_players_room_id_idx
  on public.race_room_players (room_id);
create index if not exists race_room_answers_round_idx
  on public.race_room_answers (room_id, round, answered_at);

alter table public.race_rooms enable row level security;
alter table public.race_room_players enable row level security;
alter table public.race_room_answers enable row level security;

create or replace function public.is_race_room_member(p_room_id uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.race_room_players
    where room_id = p_room_id and user_id = auth.uid()
  );
$$;
revoke all on function public.is_race_room_member(uuid) from public, anon;
grant execute on function public.is_race_room_member(uuid) to authenticated;

drop policy if exists "Room members can read their room" on public.race_rooms;
create policy "Room members can read their room"
  on public.race_rooms for select to authenticated
  using (public.is_race_room_member(id));

drop policy if exists "Room members can read their players" on public.race_room_players;
create policy "Room members can read their players"
  on public.race_room_players for select to authenticated
  using (public.is_race_room_member(room_id));

drop policy if exists "Room members can read their answers" on public.race_room_answers;
create policy "Room members can read their answers"
  on public.race_room_answers for select to authenticated
  using (public.is_race_room_member(room_id));

revoke all on public.race_rooms, public.race_room_players, public.race_room_answers from anon, authenticated;
grant select on public.race_rooms, public.race_room_players, public.race_room_answers to authenticated;

create or replace function public.create_race_room(p_name text, p_mode text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_room_id uuid;
  v_code text;
  v_name text := btrim(p_name);
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if v_name is null or char_length(v_name) not between 1 and 24 then raise exception 'INVALID_PLAYER_NAME'; end if;
  if p_mode is null or p_mode not in ('class', 'play') then raise exception 'INVALID_ROOM_MODE'; end if;

  for attempt in 1..20 loop
    v_code := 'CQ-' || lpad((floor(random() * 9000) + 1000)::integer::text, 4, '0');
    insert into public.race_rooms (code, host_id, host_name, mode)
    values (v_code, auth.uid(), v_name, p_mode)
    on conflict (code) do nothing
    returning id into v_room_id;
    exit when v_room_id is not null;
  end loop;

  if v_room_id is null then raise exception 'ROOM_CODE_GENERATION_FAILED'; end if;

  insert into public.race_room_players (room_id, user_id, name, role, is_playing)
  values (v_room_id, auth.uid(), v_name, 'host', p_mode = 'play');
  return v_room_id;
end;
$$;

create or replace function public.join_race_room(p_code text, p_name text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_room public.race_rooms%rowtype;
  v_name text := btrim(p_name);
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if v_name is null or char_length(v_name) not between 1 and 24 then raise exception 'INVALID_PLAYER_NAME'; end if;

  select * into v_room
  from public.race_rooms
  where code = upper(btrim(p_code))
  for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;

  if exists (
    select 1 from public.race_room_players
    where room_id = v_room.id and user_id = auth.uid()
  ) then
    return v_room.id;
  end if;

  if v_room.status <> 'waiting' then raise exception 'ROOM_ALREADY_STARTED'; end if;
  if (select count(*) from public.race_room_players
      where room_id = v_room.id and is_playing) >= v_room.max_players then
    raise exception 'ROOM_FULL';
  end if;

  insert into public.race_room_players (room_id, user_id, name, role, is_playing)
  values (v_room.id, auth.uid(), v_name, 'player', true);
  return v_room.id;
end;
$$;

create or replace function public.set_race_room_ready(p_room_id uuid, p_ready boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.race_room_players
  set ready = p_ready
  where room_id = p_room_id and user_id = auth.uid() and is_playing;
  if not found then raise exception 'PLAYER_NOT_FOUND'; end if;
end;
$$;

create or replace function public.start_race_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_room public.race_rooms%rowtype;
begin
  select * into v_room from public.race_rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.host_id <> auth.uid() then raise exception 'HOST_ONLY'; end if;
  if v_room.status <> 'waiting' then raise exception 'ROOM_NOT_WAITING'; end if;
  if (select count(*) from public.race_room_players
      where room_id = p_room_id and is_playing) < 2 then
    raise exception 'NEED_TWO_PLAYERS';
  end if;

  update public.race_rooms
  set status = 'running', current_round = 1, started_at = clock_timestamp()
  where id = p_room_id;
end;
$$;

create or replace function public.submit_race_answer(p_room_id uuid, p_round integer, p_answer text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_room public.race_rooms%rowtype;
  v_round integer;
  v_elapsed numeric;
  v_answered_at timestamptz;
  v_place integer;
  v_points integer;
  v_streak integer;
  v_word text;
  v_words text[] := array[
    'cyber', 'pixel', 'veiligheid', 'toetsenbord', 'internet',
    'kampioen', 'precisie', 'avontuur', 'samenwerken', 'doorzetten'
  ];
begin
  select * into v_room from public.race_rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.status <> 'running' then raise exception 'ROOM_NOT_RUNNING'; end if;
  if not exists (
    select 1 from public.race_room_players
    where room_id = p_room_id and user_id = auth.uid() and is_playing
  ) then raise exception 'PLAYER_NOT_IN_GAME'; end if;

  v_elapsed := extract(epoch from (clock_timestamp() - v_room.started_at - interval '3 seconds'));
  if v_elapsed < 0 then raise exception 'ROUND_NOT_STARTED'; end if;
  v_round := floor(v_elapsed / 11.3)::integer + 1;
  if v_round > 20 then raise exception 'GAME_FINISHED'; end if;
  if p_round is null or p_round <> v_round then raise exception 'ROUND_OUT_OF_SYNC'; end if;
  if mod(v_elapsed, 11.3) >= 10 then raise exception 'ROUND_TIME_EXPIRED'; end if;

  v_word := v_words[((v_round - 1) % array_length(v_words, 1)) + 1];
  if p_answer is null or lower(btrim(p_answer)) <> v_word then
    return jsonb_build_object('correct', false, 'points', 0);
  end if;

  insert into public.race_room_answers (room_id, user_id, round, points)
  values (p_room_id, auth.uid(), v_round, 0)
  on conflict (room_id, user_id, round) do nothing
  returning answered_at into v_answered_at;
  if v_answered_at is null then raise exception 'ANSWER_ALREADY_SCORED'; end if;

  select count(*)::integer + 1 into v_place
  from public.race_room_answers
  where room_id = p_room_id and round = v_round and
    (answered_at, user_id) < (v_answered_at, auth.uid());
  v_points := case v_place when 1 then 100 when 2 then 80 when 3 then 60 when 4 then 40 else 20 end;

  update public.race_room_answers set points = v_points
  where room_id = p_room_id and user_id = auth.uid() and round = v_round;
  update public.race_room_players
  set score = score + v_points,
      streak = case
        when v_round = 1 or exists (
          select 1 from public.race_room_answers previous
          where previous.room_id = p_room_id
            and previous.user_id = auth.uid()
            and previous.round = v_round - 1
        ) then streak + 1
        else 1
      end,
      correct = correct + 1
  where room_id = p_room_id and user_id = auth.uid()
  returning streak into v_streak;

  return jsonb_build_object('correct', true, 'points', v_points, 'place', v_place, 'streak', v_streak);
end;
$$;

create or replace function public.advance_race_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_room public.race_rooms%rowtype;
  v_elapsed numeric;
  v_round integer;
begin
  select * into v_room from public.race_rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if not exists (
    select 1 from public.race_room_players
    where room_id = p_room_id and user_id = auth.uid()
  ) then raise exception 'PLAYER_NOT_IN_ROOM'; end if;
  if v_room.status <> 'running' then return; end if;

  v_elapsed := extract(epoch from (clock_timestamp() - v_room.started_at - interval '3 seconds'));
  if v_elapsed >= 20 * 11.3 then
    update public.race_rooms set status = 'finished', current_round = 20 where id = p_room_id;
  else
    v_round := greatest(1, floor(greatest(v_elapsed, 0) / 11.3)::integer + 1);
    update public.race_rooms set current_round = v_round
    where id = p_room_id and current_round < v_round;
  end if;
end;
$$;

create or replace function public.race_server_now()
returns timestamptz
language sql
security definer
set search_path = public, pg_temp
as $$
  select clock_timestamp();
$$;

create or replace function public.leave_race_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_room public.race_rooms%rowtype;
begin
  select * into v_room from public.race_rooms where id = p_room_id for update;
  if not found then return; end if;

  if v_room.host_id = auth.uid() then
    update public.race_rooms set status = 'closed' where id = p_room_id;
  else
    delete from public.race_room_players
    where room_id = p_room_id and user_id = auth.uid();
  end if;
end;
$$;

create or replace function public.close_race_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.race_rooms set status = 'closed'
  where id = p_room_id and host_id = auth.uid();
  if not found then raise exception 'HOST_ONLY'; end if;
end;
$$;

create or replace function public.kick_race_room_player(p_room_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_room public.race_rooms%rowtype;
begin
  select * into v_room from public.race_rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.host_id <> auth.uid() then raise exception 'HOST_ONLY'; end if;
  if v_room.status <> 'waiting' then raise exception 'ROOM_NOT_WAITING'; end if;
  if p_user_id = v_room.host_id then raise exception 'CANNOT_KICK_HOST'; end if;

  delete from public.race_room_players where room_id = p_room_id and user_id = p_user_id;
  if not found then raise exception 'PLAYER_NOT_FOUND'; end if;
end;
$$;

revoke all on function public.create_race_room(text, text) from public, anon;
revoke all on function public.join_race_room(text, text) from public, anon;
revoke all on function public.set_race_room_ready(uuid, boolean) from public, anon;
revoke all on function public.start_race_room(uuid) from public, anon;
revoke all on function public.submit_race_answer(uuid, integer, text) from public, anon;
revoke all on function public.advance_race_room(uuid) from public, anon;
revoke all on function public.race_server_now() from public, anon;
revoke all on function public.leave_race_room(uuid) from public, anon;
revoke all on function public.close_race_room(uuid) from public, anon;
revoke all on function public.kick_race_room_player(uuid, uuid) from public, anon;

grant execute on function public.create_race_room(text, text) to authenticated;
grant execute on function public.join_race_room(text, text) to authenticated;
grant execute on function public.set_race_room_ready(uuid, boolean) to authenticated;
grant execute on function public.start_race_room(uuid) to authenticated;
grant execute on function public.submit_race_answer(uuid, integer, text) to authenticated;
grant execute on function public.advance_race_room(uuid) to authenticated;
grant execute on function public.race_server_now() to authenticated;
grant execute on function public.leave_race_room(uuid) to authenticated;
grant execute on function public.close_race_room(uuid) to authenticated;
grant execute on function public.kick_race_room_player(uuid, uuid) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'race_rooms'
  ) then
    alter publication supabase_realtime add table public.race_rooms;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'race_room_players'
  ) then
    alter publication supabase_realtime add table public.race_room_players;
  end if;
end;
$$;

drop policy if exists "Room members can subscribe" on realtime.messages;
create policy "Room members can subscribe"
  on realtime.messages for select to authenticated
  using (
    case
      when realtime.topic() ~ '^race-room:[0-9a-f-]+$'
        then public.is_race_room_member(substring(realtime.topic() from 11)::uuid)
      else false
    end
  );

drop policy if exists "Room members can publish presence" on realtime.messages;
create policy "Room members can publish presence"
  on realtime.messages for insert to authenticated
  with check (
    case
      when realtime.topic() ~ '^race-room:[0-9a-f-]+$'
        then public.is_race_room_member(substring(realtime.topic() from 11)::uuid)
      else false
    end
  );
