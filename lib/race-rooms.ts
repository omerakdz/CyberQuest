import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export type RoomMode = "class" | "play"
export type RoomStatus = "waiting" | "running" | "finished" | "closed"

export type Room = {
  id: string
  code: string
  host_id: string
  host_name: string
  mode: RoomMode
  status: RoomStatus
  current_round: number
  started_at: string | null
  max_players: number
  finish_words: number
}

export type RoomPlayer = {
  room_id: string
  user_id: string
  name: string
  role: "host" | "player"
  is_playing: boolean
  ready: boolean
  score: number
  streak: number
  correct: number
  finished_at: string | null
}

export type RoomSnapshot = {
  room: Room
  players: RoomPlayer[]
}

export const RACE_WORDS = [
  "cyber",
  "pixel",
  "veiligheid",
  "toetsenbord",
  "internet",
  "kampioen",
  "precisie",
  "avontuur",
  "samenwerken",
  "doorzetten",
]

export async function ensureRaceIdentity() {
  const client = createClient()
  const { data: sessionData, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw sessionError
  if (sessionData.session) return { client, userId: sessionData.session.user.id }

  const { data, error } = await client.auth.signInAnonymously()
  if (error) {
    if (error.message.toLowerCase().includes("anonymous")) {
      throw new Error("Gastaccounts zijn niet ingeschakeld in Supabase Auth.")
    }
    throw error
  }
  if (!data.user) throw new Error("Supabase heeft geen spelersidentiteit teruggegeven.")
  return { client, userId: data.user.id }
}

export async function createRaceRoom(client: SupabaseClient, name: string, mode: RoomMode) {
  const { data, error } = await client.rpc("create_race_room", { p_name: name, p_mode: mode })
  if (error) throw error
  if (typeof data !== "string") throw new Error("De server heeft geen room-ID teruggegeven.")
  return data
}

export async function joinRaceRoom(client: SupabaseClient, code: string, name: string) {
  const { data, error } = await client.rpc("join_race_room", { p_code: code, p_name: name })
  if (error) throw error
  if (typeof data !== "string") throw new Error("De server heeft geen room-ID teruggegeven.")
  return data
}

export async function getRaceRoomSnapshot(client: SupabaseClient, roomId: string): Promise<RoomSnapshot> {
  const [roomResult, playersResult] = await Promise.all([
    client
      .from("race_rooms")
      .select("id,code,host_id,host_name,mode,status,current_round,started_at,max_players,finish_words")
      .eq("id", roomId)
      .single(),
    client
      .from("race_room_players")
      .select("room_id,user_id,name,role,is_playing,ready,score,streak,correct,finished_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true }),
  ])
  if (roomResult.error) throw roomResult.error
  if (playersResult.error) throw playersResult.error
  return {
    room: roomResult.data as Room,
    players: playersResult.data as RoomPlayer[],
  }
}

// Finishers first (by finish time), then everyone else by score.
export function finishingOrder(players: RoomPlayer[]) {
  return players
    .filter((player) => player.is_playing)
    .sort((a, b) => {
      if (a.finished_at && b.finished_at) return Date.parse(a.finished_at) - Date.parse(b.finished_at)
      if (a.finished_at) return -1
      if (b.finished_at) return 1
      return b.correct - a.correct || b.score - a.score || a.name.localeCompare(b.name)
    })
}

export function roomErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const code = message.toUpperCase()

  if (code.includes("ROOM_NOT_FOUND")) return "Deze roomcode bestaat niet. Controleer de code en probeer opnieuw."
  if (code.includes("ROOM_ALREADY_STARTED") || code.includes("ROOM_NOT_WAITING")) return "Deze wedstrijd is al gestart en neemt geen nieuwe spelers meer aan."
  if (code.includes("ROOM_NOT_RUNNING")) return "De race is al afgelopen."
  if (code.includes("ROOM_FULL")) return "Deze room zit vol. Vraag de host om een andere room te openen."
  if (code.includes("NEED_TWO_PLAYERS")) return "Er zijn minstens twee deelnemende spelers nodig om te starten."
  if (code.includes("HOST_ONLY")) return "Alleen de room-host kan deze actie uitvoeren."
  if (code.includes("PLAYER_NOT_FOUND") || code.includes("PLAYER_NOT_IN_ROOM")) return "Je bent niet langer deelnemer van deze room."
  if (code.includes("PLAYER_NOT_IN_GAME")) return "Alleen deelnemende spelers kunnen antwoorden insturen."
  if (code.includes("ROUND_OUT_OF_SYNC")) return "De ronde is bijgewerkt. Probeer je antwoord opnieuw."
  if (code.includes("ROUND_TIME_EXPIRED")) return "De tijd voor deze ronde is voorbij."
  if (code.includes("ANSWER_ALREADY_SCORED")) return "Je antwoord voor deze ronde is al verwerkt."
  if (code.includes("AUTHENTICATION_REQUIRED")) return "Je spelerssessie is verlopen. Herlaad de pagina en probeer opnieuw."
  if (code.includes("INVALID_PLAYER_NAME")) return "Gebruik een spelersnaam van 1 tot 24 tekens."
  if (code.includes("GASTACCOUNTS")) return "Schakel anonieme/gastaanmelding in via Supabase Auth om rooms te gebruiken."
  if (code.includes("PGRST202") || code.includes("FUNCTION") && code.includes("NOT FOUND")) {
    return "De Race Rush-databasemigratie ontbreekt. Voer de SQL-migratie uit en probeer opnieuw."
  }
  if (code.includes("PGRST205") || code.includes("RELATION") && code.includes("DOES NOT EXIST")) {
    return "De Race Rush-tabellen ontbreken. Voer de SQL-migratie uit en probeer opnieuw."
  }
  return message
}

