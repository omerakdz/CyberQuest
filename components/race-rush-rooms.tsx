"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Check,
  Clipboard,
  Crown,
  Flame,
  Gamepad2,
  Keyboard,
  Lightbulb,
  LoaderCircle,
  LogOut,
  Play,
  Radio,
  Shield,
  Sparkles,
  Trophy,
  UserMinus,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react"
import {
  createRaceRoom,
  ensureRaceIdentity,
  finishingOrder,
  getRaceRoomSnapshot,
  joinRaceRoom,
  RACE_WORDS,
  roomErrorMessage,
  type Room,
  type RoomPlayer,
  type RoomSnapshot,
} from "@/lib/race-rooms"
import { RaceTrack } from "@/components/race-track"
import { tipForRound } from "@/lib/typing-tips"
import { playCorrectSound, playErrorSound, playPopupSound, setMusicTrack } from "@/lib/race-audio"
import type { TrackState } from "@/game/race/race-scene"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

type Props = {
  playerName: string
  onBack: () => void
  onSolo: () => void
}

export function RaceRushRooms({ playerName, onBack, onSolo }: Props) {
  const [view, setView] = useState<"home" | "create" | "join" | "room">("home")
  const [name, setName] = useState(playerName)
  const [code, setCode] = useState("")
  const [roomId, setRoomId] = useState("")
  const [userId, setUserId] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const createRoom = async (mode: "class" | "play") => {
    setBusy(true)
    setError("")
    try {
      const identity = await ensureRaceIdentity()
      const id = await createRaceRoom(identity.client, name.trim(), mode)
      setRoomId(id)
      setUserId(identity.userId)
      setView("room")
    } catch (reason) {
      setError(roomErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  const joinRoom = async () => {
    setBusy(true)
    setError("")
    try {
      const identity = await ensureRaceIdentity()
      const id = await joinRaceRoom(identity.client, code.trim().toUpperCase(), name.trim())
      setRoomId(id)
      setUserId(identity.userId)
      setView("room")
    } catch (reason) {
      setError(roomErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  if (view === "room") {
    return (
      <RoomSession
        key={roomId}
        roomId={roomId}
        userId={userId}
        onExit={() => {
          setRoomId("")
          setView("home")
        }}
      />
    )
  }

  return (
    <main className="race-arena race-room-shell">
      <button className="corner-back" onClick={view === "home" ? onBack : () => { setError(""); setView("home") }}>
        <ArrowLeft /> {view === "home" ? "TYPE BATTLE" : "TERUG"}
      </button>
      <div className="race-room-heading">
        <div className="season"><Keyboard /> TYPE BATTLE · RACE RUSH</div>
        <h2>{view === "home" ? <>RACE <span>RUSH</span></> : view === "create" ? <>CREATE <span>ROOM</span></> : <>JOIN <span>ROOM</span></>}</h2>
        <p>{view === "home" ? "Speel alleen, of nodig vrienden uit voor een echte race." : "Maak verbinding met je Race Rush-team."}</p>
      </div>

      {!isSupabaseConfigured() && (
        <div className="race-setup-alert" role="status">
          <Shield />
          <div>
            <strong>Online rooms zijn nog niet geconfigureerd</strong>
            <span>Voeg de Supabase-gegevens toe en voer de Race Rush-migratie uit. Solo spelen blijft beschikbaar.</span>
          </div>
        </div>
      )}

      {view === "home" && (
        <section className="race-room-actions">
          <button className="race-room-action" onClick={() => { setError(""); setView("create") }}>
            <span className="room-action-icon"><Users /></span>
            <strong>CREATE ROOM</strong>
            <small>Start een multiplayerroom en kies of je meespeelt.</small>
            <b>NEW ROOM <Play /></b>
          </button>
          <button className="race-room-action" onClick={() => { setError(""); setView("join") }}>
            <span className="room-action-icon join"><Radio /></span>
            <strong>JOIN ROOM</strong>
            <small>Voer een roomcode in om naar de lobby te gaan.</small>
            <b>ENTER CODE <Play /></b>
          </button>
          <button className="race-room-action solo" onClick={onSolo}>
            <span className="room-action-icon solo-icon"><Gamepad2 /></span>
            <strong>SOLO RACE</strong>
            <small>Speel direct de bestaande Race Rush-game tegen bots.</small>
            <b>PLAY SOLO <Zap /></b>
          </button>
        </section>
      )}

      {view === "create" && (
        <section className="race-room-form">
          <label className="race-room-label">
            JOUW SPELERSNAAM
            <input maxLength={24} value={name} onChange={(event) => setName(event.target.value)} placeholder="Bijvoorbeeld Nova" />
          </label>
          <div className="race-mode-prompt">
            <span>HOE WIL JE DE ROOM-EIGENAAR ZIJN?</span>
            <p>Deze keuze bepaalt of jij tijdens de wedstrijd meespeelt.</p>
          </div>
          <div className="race-mode-options">
            <button disabled={busy || !isSupabaseConfigured()} onClick={() => void createRoom("class")}>
              <span><Shield /></span>
              <strong>KLASMODUS</strong>
              <small>Ik begeleid, maar speel niet mee. Jij blijft host en spectator.</small>
              <b>{busy ? <LoaderCircle className="spin" /> : "CREATE AS HOST"}</b>
            </button>
            <button disabled={busy || !isSupabaseConfigured()} onClick={() => void createRoom("play")}>
              <span><Gamepad2 /></span>
              <strong>SPEELMODUS</strong>
              <small>Ik speel alle rondes mee en kan zelf de race winnen.</small>
              <b>{busy ? <LoaderCircle className="spin" /> : "CREATE & PLAY"}</b>
            </button>
          </div>
        </section>
      )}

      {view === "join" && (
        <form className="race-room-form join-form" onSubmit={(event) => { event.preventDefault(); void joinRoom() }}>
          <label className="race-room-label">
            JOUW SPELERSNAAM
            <input maxLength={24} value={name} onChange={(event) => setName(event.target.value)} placeholder="Bijvoorbeeld Nova" />
          </label>
          <label className="race-room-label code-label">
            ROOMCODE
            <input
              autoCapitalize="characters"
              maxLength={7}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="CQ-4821"
            />
          </label>
          <button className="arcade-button primary join-submit" disabled={busy || !isSupabaseConfigured() || !name.trim() || !code.trim()} type="submit">
            {busy ? <LoaderCircle className="spin" /> : <Play />} JOIN ROOM
          </button>
        </form>
      )}

      {error && <div className="race-room-error" role="alert"><X /> {error}</div>}
      {view === "home" && (
        <div className="race-room-footnote">
          <Sparkles /> Rooms gebruiken gedeelde Supabase-data; andere spelers worden niet lokaal gesimuleerd.
        </div>
      )}
    </main>
  )
}

function RoomSession({ roomId, userId, onExit }: { roomId: string; userId: string; onExit: () => void }) {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(() => new Set())
  const [connection, setConnection] = useState<"connecting" | "connected" | "reconnecting">("connecting")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [clockOffset, setClockOffset] = useState(0)
  const [actionBusy, setActionBusy] = useState(false)
  const previousPlayers = useRef<Set<string> | null>(null)
  const previousPlayerNames = useRef<Map<string, string>>(new Map())
  const client = useMemo(() => createClient(), [])

  const refresh = useCallback(async () => {
    const requestStartedAt = Date.now()
    const [nextSnapshot, timeResult] = await Promise.all([
      getRaceRoomSnapshot(client, roomId),
      client.rpc("race_server_now"),
    ])
    if (timeResult.error) throw timeResult.error
    const requestFinishedAt = Date.now()
    const serverTime = Date.parse(String(timeResult.data))
    if (Number.isFinite(serverTime)) {
      setClockOffset(serverTime - (requestStartedAt + requestFinishedAt) / 2)
    }

    const currentPlayers = new Set(nextSnapshot.players.map((player) => player.user_id))
    const previous = previousPlayers.current
    if (previous) {
      const joined = nextSnapshot.players.find((player) => !previous.has(player.user_id))
      const departedId = [...previous].find((id) => !currentPlayers.has(id))
      const departedName = departedId ? previousPlayerNames.current.get(departedId) : undefined
      if (joined && joined.user_id !== userId) setNotice(`${joined.name} is de room binnengekomen.`)
      else if (departedName) setNotice(`${departedName} heeft de room verlaten.`)
    }
    previousPlayers.current = currentPlayers
    previousPlayerNames.current = new Map(nextSnapshot.players.map((player) => [player.user_id, player.name]))
    setSnapshot(nextSnapshot)
    setError("")
  }, [client, roomId, userId])

  useEffect(() => {
    let active = true
    let channel: ReturnType<typeof client.channel> | undefined
    const loadSnapshot = async () => {
      try {
        await refresh()
      } catch (reason) {
        if (active) setError(roomErrorMessage(reason))
      }
    }
    const syncPresence = () => {
      if (!channel || !active) return
      const state = channel.presenceState() as Record<string, Array<{ user_id?: string }>>
      const ids = new Set<string>()
      for (const entries of Object.values(state)) {
        for (const entry of entries) {
          if (entry.user_id) ids.add(entry.user_id)
        }
      }
      setOnlineUsers(ids)
    }

    let retryTimer: number | undefined
    let attempts = 0
    let connected = false

    const connect = async () => {
      if (!active) return
      try {
        // Private channels need the user's JWT on the realtime socket before joining.
        await client.realtime.setAuth()
      } catch {
        // The channel join reports auth problems through its status callback.
      }
      if (!active) return

      const next = client
        .channel(`race-room:${roomId}`, { config: { private: true, presence: { key: userId } } })
        .on("postgres_changes", { event: "*", schema: "public", table: "race_rooms", filter: `id=eq.${roomId}` }, () => { void loadSnapshot() })
        .on("postgres_changes", { event: "*", schema: "public", table: "race_room_players", filter: `room_id=eq.${roomId}` }, () => { void loadSnapshot() })
        .on("presence", { event: "sync" }, syncPresence)
        .on("presence", { event: "join" }, syncPresence)
        .on("presence", { event: "leave" }, syncPresence)
      channel = next
      next.subscribe((status: string) => {
        if (!active || channel !== next) return
        if (status === "SUBSCRIBED") {
          connected = true
          attempts = 0
          setConnection("connected")
          setError("")
          void next.track({ user_id: userId }).then((result: string) => {
            if (result !== "ok" && active) setError(`Realtime-presence kon niet worden bijgewerkt (${result}).`)
          }).catch((reason: unknown) => {
            if (active) setError(roomErrorMessage(reason))
          })
          void loadSnapshot()
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          connected = false
          setConnection("reconnecting")
          window.clearTimeout(retryTimer)
          const delay = Math.min(1500 * 2 ** attempts, 10000)
          attempts += 1
          retryTimer = window.setTimeout(() => {
            if (!active) return
            const stale = channel
            channel = undefined
            if (stale) void client.removeChannel(stale)
            void connect()
          }, delay)
        }
      })
    }

    // The snapshot comes straight from the database, so the lobby must not depend on realtime.
    void loadSnapshot()
    void connect()
    // Polling fallback keeps the lobby in sync while realtime is unavailable.
    const poll = window.setInterval(() => {
      if (!connected) void loadSnapshot()
    }, 2500)

    return () => {
      active = false
      window.clearTimeout(retryTimer)
      window.clearInterval(poll)
      if (channel) void client.removeChannel(channel)
    }
  }, [client, refresh, roomId, userId])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(""), 3000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const isHost = snapshot?.room.host_id === userId
  const myPlayer = snapshot?.players.find((player) => player.user_id === userId)
  const invoke = async (name: string, args: Record<string, unknown> = {}) => {
    setActionBusy(true)
    setError("")
    try {
      const { error: rpcError } = await client.rpc(name, args)
      if (rpcError) throw rpcError
      await refresh()
      return true
    } catch (reason) {
      setError(roomErrorMessage(reason))
      return false
    } finally {
      setActionBusy(false)
    }
  }

  const exitRoom = async () => {
    const left = await invoke("leave_race_room", { p_room_id: roomId })
    if (left) onExit()
  }

  if (!snapshot) {
    return <main className="race-arena race-room-shell"><div className="race-room-loading"><LoaderCircle className="spin" /> LOBBY VERBINDEN...</div>{error && <div className="race-room-error" role="alert">{error}</div>}</main>
  }

  if (snapshot.room.status === "running" || snapshot.room.status === "finished") {
    return (
      <MultiplayerRace
        snapshot={snapshot}
        userId={userId}
        onlineUsers={onlineUsers}
        clockOffset={clockOffset}
        error={error}
        actionBusy={actionBusy}
        onAction={invoke}
        onRefresh={refresh}
        onExit={exitRoom}
      />
    )
  }

  if (snapshot.room.status === "closed") {
    return (
      <main className="race-arena race-room-shell">
        <div className="race-room-closed">
          <X />
          <h2>ROOM <span>GESLOTEN</span></h2>
          <p>De host heeft deze room veilig beëindigd.</p>
          <button className="arcade-button primary" onClick={onExit}>TERUG NAAR RACE RUSH</button>
        </div>
      </main>
    )
  }

  const participating = snapshot.players.filter((player) => player.is_playing)
  const room = snapshot.room

  return (
    <main className="race-arena race-room-shell">
      <div className="race-lobby-top">
        <button className="corner-back" onClick={() => void exitRoom()} disabled={actionBusy}><ArrowLeft /> ROOM VERLATEN</button>
        <div className={connection === "connected" ? "race-lobby-status online" : "race-lobby-status"}><i /> {connection === "connected" ? "LIVE LOBBY" : "OPNIEUW VERBINDEN"}</div>
      </div>
      <section className="race-lobby-card">
        <div className="race-lobby-heading">
          <div>
            <div className="season"><Users /> MULTIPLAYER LOBBY · {room.mode === "class" ? "KLASMODUS" : "SPEELMODUS"}</div>
            <h2>ROOM <span>{room.code}</span></h2>
            <p>Host: <strong>{room.host_name}</strong> · {participating.length}/{room.max_players} deelnemende spelers</p>
          </div>
          <button className="race-copy-code" onClick={() => {
            if (!navigator.clipboard) {
              setError("Kopiëren is niet beschikbaar in deze browser.")
              return
            }
            void navigator.clipboard.writeText(room.code).then(() => setNotice("Roomcode gekopieerd!")).catch(() => setError("Kopiëren is niet beschikbaar in deze browser."))
          }}><Clipboard /> KOPIEER CODE</button>
        </div>
        <div className="race-lobby-list-heading"><span>DEELNEMERS</span><span>ROL · STATUS</span></div>
        <div className="race-lobby-list">
          {snapshot.players.map((player) => {
            const connected = onlineUsers.has(player.user_id)
            const host = player.role === "host"
            return (
              <div className={isHost && !host ? "race-lobby-player removable" : "race-lobby-player"} key={player.user_id}>
                <span className="race-player-avatar" style={{ background: host ? "#ffc84a" : "#2874ff" }}>{player.name[0]?.toUpperCase()}</span>
                <div className="race-lobby-player-name">
                  <strong>{player.name}{player.user_id === userId && <small> JIJ</small>}</strong>
                  <span>{host ? "ROOM HOST" : player.is_playing ? "DEELNEMENDE SPELER" : "SPECTATOR"}</span>
                </div>
                <span className={connected ? "race-player-status online" : "race-player-status"}>
                  {connected ? <Wifi /> : <WifiOff />} {connected ? "CONNECTED" : "DISCONNECTED"}
                </span>
                {player.is_playing && <span className={player.ready ? "race-ready ready" : "race-ready"}>{player.ready ? <Check /> : null}{player.ready ? "READY" : "NOT READY"}</span>}
                {isHost && !host && <button className="race-kick" title={`${player.name} verwijderen`} onClick={() => void invoke("kick_race_room_player", { p_room_id: room.id, p_user_id: player.user_id })}><UserMinus /></button>}
              </div>
            )
          })}
        </div>
        {room.mode === "class" && <div className="race-host-note"><Shield /> Je begeleidt de wedstrijd en doet niet mee aan rondes of scores.</div>}
        {notice && <div className="race-room-notice" role="status"><Radio /> {notice}</div>}
        {error && <div className="race-room-error" role="alert"><X /> {error}</div>}
        <div className="race-lobby-actions">
          {!isHost && myPlayer?.is_playing && (
            <button className={myPlayer.ready ? "arcade-button race-ready-button" : "arcade-button primary"} disabled={actionBusy} onClick={() => void invoke("set_race_room_ready", { p_room_id: room.id, p_ready: !myPlayer.ready })}>
              {myPlayer.ready ? "CANCEL READY" : "I'M READY"}
            </button>
          )}
          {isHost && (
            <button className="arcade-button primary" disabled={actionBusy || participating.length < 2} onClick={() => void invoke("start_race_room", { p_room_id: room.id })}>
              {actionBusy ? <LoaderCircle className="spin" /> : <Play />} START GAME <small>{participating.length < 2 ? "NEED 2 PLAYERS" : `${participating.length} PLAYERS`}</small>
            </button>
          )}
          {isHost && <button className="arcade-button close-room-button" disabled={actionBusy} onClick={() => void invoke("close_race_room", { p_room_id: room.id })}><X /> CLOSE ROOM</button>}
        </div>
      </section>
      {notice && <div className="race-room-toast"><Radio /> {notice}</div>}
      <div className="race-room-footnote"><Sparkles /> De deelnemerslijst en online status worden live bijgewerkt.</div>
    </main>
  )
}

function MultiplayerRace({
  snapshot,
  userId,
  onlineUsers,
  clockOffset,
  error,
  actionBusy,
  onAction,
  onRefresh,
  onExit,
}: {
  snapshot: RoomSnapshot
  userId: string
  onlineUsers: Set<string>
  clockOffset: number
  error: string
  actionBusy: boolean
  onAction: (name: string, args?: Record<string, unknown>) => Promise<boolean>
  onRefresh: () => Promise<void>
  onExit: () => void
}) {
  const [now, setNow] = useState(Date.now())
  const [typed, setTyped] = useState("")
  const [submittedRound, setSubmittedRound] = useState(0)
  const [notice, setNotice] = useState("")
  const [popup, setPopup] =   useState<{ text: string; kind: "lead" | "streak" | "fast" | "broken" } | null>(null)
    const prevEvents = useRef<{ leader: string; streaks: Record<string, number>; correct: Record<string, number>; fastRound: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const lastAdvance = useRef("")
  const inputRef = useRef<HTMLInputElement>(null)
  const room = snapshot.room
  const me = snapshot.players.find((player) => player.user_id === userId)
  const isSpectator = !me?.is_playing
  const isHost = room.host_id === userId
  const sortedPlayers = useMemo(
    () => snapshot.players.filter((player) => player.is_playing).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [snapshot.players],
  )
  const finishOrder = useMemo(() => finishingOrder(snapshot.players), [snapshot.players])
  const startedAt = room.started_at ? Date.parse(room.started_at) : now
  const elapsed = now + clockOffset - startedAt - 3000
  const finished = room.status === "finished"
  const trackCountdown = !finished && elapsed < 0 ? Math.max(1, Math.ceil(-elapsed / 1000)) : null
  const trackGo = !finished && elapsed >= 0 && elapsed < 900
  const trackState = useMemo<TrackState>(() => ({
    cars: snapshot.players.filter((player) => player.is_playing).map((player) => ({
      id: player.user_id,
      name: player.name,
      progress: player.correct / room.finish_words,
      isYou: player.user_id === userId,
      online: onlineUsers.has(player.user_id),
    })),
    countdown: trackCountdown,
    goFlash: trackGo,
    winnerId: finished ? finishOrder[0]?.user_id ?? null : null,
  }), [snapshot.players, room.finish_words, userId, onlineUsers, finished, trackCountdown, trackGo, finishOrder])
  const elapsedRound = Math.max(0, elapsed)
  const round = Math.min(20, Math.floor(elapsedRound / 11300) + 1)
  const roundProgress = elapsed < 0 ? 0 : elapsedRound % 11300
  const timeLeft = elapsed < 0 ? 10 : Math.max(0, Math.ceil(10 - roundProgress / 1000))
  const countdown = Math.max(1, Math.ceil(-elapsed / 1000))
  const phase = elapsed < 0 ? "countdown" : roundProgress < 10000 ? "typing" : "results"
  const word = RACE_WORDS[(round - 1) % RACE_WORDS.length]

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setTyped("")
    setSubmittedRound(0)
  }, [round])

  useEffect(() => {
    if (finished) return
    setMusicTrack("race")
    return () => setMusicTrack("home")
  }, [finished])

  const canType = phase === "typing" && submittedRound !== round && !submitting
  useEffect(() => {
    const prev = prevEvents.current
    const top = sortedPlayers[0]
    const leader = top && top.score > 0 ? top.name : ""
    const fastRound = prev?.fastRound ?? 0
    const scorer = prev ? sortedPlayers.find((p) => p.correct > (prev.correct[p.user_id] ?? 0)) : undefined
    let nextFast = fastRound
    let text = ""
    let kind: "lead" | "streak" | "fast" | "broken" = "lead"
    if (prev && !finished) {
      if (scorer && fastRound !== round) { nextFast = round; text = `${scorer.name.toUpperCase()} IS DE SNELSTE DEZE RONDE!`; kind = "fast" }
      const broken = sortedPlayers.find((p) => p.streak === 0 && (prev.streaks[p.user_id] ?? 0) >= 3)
      if (broken) { text = `${broken.name.toUpperCase()} · COMBO VERBROKEN!`; kind = "broken" }
    }
    prevEvents.current = { leader, streaks: Object.fromEntries(sortedPlayers.map((p) => [p.user_id, p.streak])), correct: Object.fromEntries(sortedPlayers.map((p) => [p.user_id, p.correct])), fastRound: nextFast }
    if (!prev || finished) return
    if (leader && leader !== prev.leader) { text = `${leader.toUpperCase()} TAKES THE LEAD!`; kind = "lead" }
    for (const p of sortedPlayers) if ((p.streak === 3 || p.streak === 5 || p.streak === 8) && prev.streaks[p.user_id] !== p.streak) { text = `${p.name.toUpperCase()} · COMBO x${p.streak}!`; kind = "streak" }
    if (!text) return
    setPopup({ text, kind }); playPopupSound()
    const t = window.setTimeout(() => setPopup(null), 1800)
    return () => window.clearTimeout(t)
  }, [sortedPlayers, finished, round])
  useEffect(() => {
    if (canType) inputRef.current?.focus()
  }, [canType, round])

  useEffect(() => {
    if (room.status !== "running" || !room.started_at) return
    if (elapsed < 0) return
    const shouldFinish = elapsed >= 20 * 11300
    if (!shouldFinish && round <= room.current_round) return
    const requestKey = shouldFinish ? "finished" : String(round)
    if (lastAdvance.current === requestKey) return
    lastAdvance.current = requestKey
    void onAction("advance_race_room", { p_room_id: room.id }).then((success) => {
      if (!success) lastAdvance.current = ""
    })
  }, [elapsed, onAction, room.current_round, room.id, room.started_at, room.status, round])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(""), 1800)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const submit = async () => {
    if (submitting || submittedRound === round || phase !== "typing") return
    if (typed.trim().toLowerCase() !== word) {
      playErrorSound()
      setNotice("FOUT WOORD · BLIJF FOCUSSEN")
      return
    }
    setSubmitting(true)
    try {
      const client = createClient()
      const { data, error: submitError } = await client.rpc("submit_race_answer", {
        p_room_id: room.id,
        p_round: round,
        p_answer: typed.trim(),
      })
      if (submitError) throw submitError
      const result = data as { correct?: boolean; points?: number; place?: number } | null
      if (!result?.correct) {
        setNotice("ANTWOORD NIET GOEDGEKEURD")
        return
      }
      setSubmittedRound(round)
      playCorrectSound()
      setNotice(`+${result.points ?? 0} PUNTEN · PLAATS ${result.place ?? "-"}`)
      await onRefresh()
    } catch (reason) {
      setNotice(roomErrorMessage(reason))
    } finally {
      setSubmitting(false)
    }
  }

  const exit = async () => {
    if (await onAction("leave_race_room", { p_room_id: room.id })) onExit()
  }

  if (finished) {
    return (
      <main className="race-arena race-room-shell race-multiplayer-game">
        <div className="race-arena-top">
          <button className="corner-back" onClick={() => void exit()} disabled={actionBusy}><ArrowLeft /> {isHost ? "ROOM SLUITEN" : "ROOM VERLATEN"}</button>
          <div><div className="season"><Trophy /> RACE COMPLETE · {room.code}</div><h2>FINAL <span>RESULTS</span></h2></div>
          <div className="race-status"><i /> FINISHED</div>
        </div>
        <RaceTrack state={trackState} />
        <div className="race-finish-heading"><p>{finishOrder[0]?.name ?? "Geen winnaar"} is de kampioen.</p></div>
        <div className="final-leaderboard">
          {finishOrder.map((player, index) => (
            <div className={player.user_id === userId ? "final-row you" : "final-row"} key={player.user_id}>
              <strong>0{index + 1}</strong><span>{player.name}{player.user_id === userId ? " · JIJ" : ""}</span>
              <b>{player.score}</b><small>{player.finished_at ? "FINISHED" : `${player.correct}/${room.finish_words} woorden`} · streak {player.streak}</small>
            </div>
          ))}
        </div>
        {error && <div className="race-room-error" role="alert">{error}</div>}
        {isHost ? (
          <button className="arcade-button primary" onClick={() => void onAction("reset_race_room", { p_room_id: room.id })} disabled={actionBusy}><Zap /> RACE AGAIN · TERUG NAAR LOBBY</button>
        ) : (
          <div className="race-host-note"><Shield /> Wacht tot de host een nieuwe race start of terug naar de lobby gaat.</div>
        )}
      </main>
    )
  }

  return (
    <main className="race-arena race-room-shell race-multiplayer-game">
      <div className="race-arena-top">
        <button className="corner-back" onClick={() => void exit()} disabled={actionBusy}><LogOut /> EXIT ROOM</button>
        <div><div className="season"><Keyboard /> {isSpectator ? "HOST SPECTATOR" : "TYPE BATTLE"} · {room.code}</div><h2>ROUND <span>{String(round).padStart(2, "0")} / 20</span></h2></div>
        <div className="race-status"><i /> {connectionLabel(onlineUsers, snapshot.players.length)}</div>
      </div>
      <RaceTrack state={trackState} />
      <div className="race-grid">
        <section className="race-center">
          <div className="race-popup-slot">{popup ? <div key={popup.text} className={`race-popup ${popup.kind}`}><Flame /> {popup.text}</div> : notice ? <div className="race-popup notice"><Flame /> {notice}</div> : phase !== "typing" ? <div key={`tip-${round}-${phase}`} className="race-popup tip"><Lightbulb /> TIP: {tipForRound(round)}</div> : null}</div>
          <div className={`reveal-stage ${phase}`}>
            <div className="round-state">{phase === "countdown" ? String(countdown) : phase === "typing" ? "TYPE NOW" : "ROUND OVER"}</div>
            {phase === "typing" || phase === "results" ? <div className="race-word">{word}</div> : <div className="race-hidden-word">???</div>}
            <div className="race-timer">{phase === "typing" ? `${timeLeft}s` : phase === "results" ? "SCORED" : "10s ROUND"}</div>
          </div>
          {isSpectator ? (
            <div className="race-host-spectator">
              <Shield />
              <div><strong>HOST SPECTATOR · {room.mode === "class" ? "KLASMODUS" : "SPECTATOR"}</strong><span>Je speelt niet mee. Volg hier de voortgang van alle deelnemers.</span></div>
            </div>
          ) : (
            <div className="race-input-panel">
              <span>TYPE THE WORD</span>
              <input
                ref={inputRef}
                autoFocus
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") void submit() }}
                disabled={phase !== "typing" || submittedRound === round || submitting}
                placeholder={phase === "typing" ? "Type the revealed word..." : "Get ready..."}
              />
              <button className="arcade-button primary" disabled={phase !== "typing" || submittedRound === round || submitting} onClick={() => void submit()}>
                {submitting ? <LoaderCircle className="spin" /> : <Check />} SUBMIT <span>ENTER</span>
              </button>
            </div>
          )}
          {error && <div className="race-room-error" role="alert"><X /> {error}</div>}
          <div className="race-rules"><span><Zap /> FASTEST CORRECT WINS</span><span><span className="clock-icon">◷</span> 10 SECOND ROUND</span><span><Sparkles /> SAME WORD FOR EVERYONE</span></div>
        </section>
        <aside className="race-leaderboard race-live-host-board">
          <div className="leaderboard-heading"><div><span>{isSpectator ? "SPECTATOR VIEW" : "LIVE RANKING"}</span><h3>LEADERBOARD</h3></div><Trophy /></div>
          {sortedPlayers.map((player, index) => (
            <div className={player.user_id === userId ? "leader-row you" : "leader-row"} key={player.user_id}>
              <strong>{index + 1}</strong>
              <span className="leader-avatar" style={{ background: player.user_id === room.host_id ? "#ffc84a" : "#2874ff" }}>{player.name[0]?.toUpperCase()}</span>
              <div><b>{player.name}{player.user_id === userId && <small> YOU</small>}</b><span>{player.streak >= 3 ? `COMBO x${player.streak}` : onlineUsers.has(player.user_id) ? "ACTIVE" : "DISCONNECTED"}</span></div>
              <em>{player.score.toLocaleString()}</em>
              {index === 0 && <Crown className="leader-crown" />}
            </div>
          ))}
          <div className="race-host-progress"><span>ROUND PROGRESS</span><b>{Math.min(100, Math.floor((Math.max(elapsed, 0) / (20 * 11300)) * 100))}%</b><i><em style={{ width: `${Math.min(100, Math.max(0, (elapsed / (20 * 11300)) * 100))}%` }} /></i></div>
        </aside>
      </div>
    </main>
  )
}

function connectionLabel(onlineUsers: Set<string>, playerCount: number) {
  return onlineUsers.size >= playerCount ? "LIVE" : "LIVE · RECONNECTING"
}
