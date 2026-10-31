alter table public.race_rooms
  add column if not exists finish_words integer not null default 10 check (finish_words between 3 and 20);
alter table public.race_room_players
  add column if not exists finished_at timestamptz;

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
  v_correct integer;
  v_finished boolean := false;
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
  returning streak, correct into v_streak, v_correct;

  if v_correct >= v_room.finish_words then
    v_finished := true;
    update public.race_room_players set finished_at = clock_timestamp()
    where room_id = p_room_id and user_id = auth.uid();
    update public.race_rooms set status = 'finished' where id = p_room_id;
  end if;

  return jsonb_build_object('correct', true, 'points', v_points, 'place', v_place, 'streak', v_streak, 'finished', v_finished);
end;
$$;

-- Host-only: return a finished race to the lobby with fresh scores.
create or replace function public.reset_race_room(p_room_id uuid)
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
  if v_room.status <> 'finished' then raise exception 'ROOM_NOT_FINISHED'; end if;

  delete from public.race_room_answers where room_id = p_room_id;
  update public.race_room_players
  set score = 0, streak = 0, correct = 0, finished_at = null, ready = true
  where room_id = p_room_id;
  update public.race_rooms
  set status = 'waiting', current_round = 1, started_at = null
  where id = p_room_id;
end;
$$;

revoke all on function public.submit_race_answer(uuid, integer, text) from public, anon;
revoke all on function public.reset_race_room(uuid) from public, anon;
grant execute on function public.submit_race_answer(uuid, integer, text) to authenticated;
grant execute on function public.reset_race_room(uuid) to authenticated;
