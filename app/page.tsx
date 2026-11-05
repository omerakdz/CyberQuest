"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Lock, Music2, Play, Settings, Sparkles, Trophy, Volume2, VolumeX, Users, X, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { TypingAdventure } from "@/components/typing-adventure"
import { PracticeArena } from "@/components/practice-arena"
import { MonsterDefense } from "@/components/monster-defense"
import { CyberDetective } from "@/components/cyber-detective"
import { FakeOrFact } from "@/components/fake-or-fact"
import { AiLab } from "@/components/ai-lab"
import { DigitalFootprint } from "@/components/digital-footprint"
import { RaceRush } from "@/components/race-rush"
import { setAudioPrefs, setMusicTrack, unlockAudio } from "@/lib/race-audio"
import { RobotMascot } from "@/components/robot-mascot"

type Screen = "home" | "select" | "modes" | "race" | "practice" | "adventure" | "monsters" | "detective" | "fact" | "lab" | "footprint" | "records" | "settings"
type Profile = { name: string; avatar: string }
const words = ["toetsenbord", "snelheid", "concentratie", "avontuur", "kampioen", "precisie"]

export default function CyberQuest() {
  const [screen, setScreen] = useState<Screen>("home")
  const [profile, setProfile] = useState<Profile>({ name: "Nova", avatar: "blue" })
  const [stats, setStats] = useState({ xp: 1240, streak: 6, best: 58, words: 347 })
  const [sound, setSound] = useState(true)
  const [music, setMusic] = useState(true)
  const [typed, setTyped] = useState("")
  const [wordIndex, setWordIndex] = useState(0)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("keyquest-profile")
    const savedStats = localStorage.getItem("keyquest-stats")
    if (saved) setProfile(JSON.parse(saved))
    if (savedStats) setStats(JSON.parse(savedStats))
  }, [])
  useEffect(() => { localStorage.setItem("keyquest-profile", JSON.stringify(profile)) }, [profile])
  useEffect(() => { localStorage.setItem("keyquest-stats", JSON.stringify(stats)) }, [stats])

  useEffect(() => { setAudioPrefs({ music, sound }) }, [music, sound])
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio)
    window.addEventListener("keydown", unlockAudio)
    return () => { window.removeEventListener("pointerdown", unlockAudio); window.removeEventListener("keydown", unlockAudio) }
  }, [])
  // Child effects run before this one, so the race screen must not be overridden here.
  useEffect(() => { if (screen !== "race" && screen !== "monsters") setMusicTrack(screen === "practice" || screen === "adventure" ? null : "home") }, [screen])

  function finishWord() {
    setTyped("")
    setWordIndex((value) => (value + 1) % words.length)
    setStats((value) => ({ ...value, xp: value.xp + 20, words: value.words + 1, best: Math.max(value.best, 48 + value.words % 10) }))
    setNotice("+20 XP  ·  PERFECT HIT")
    window.setTimeout(() => setNotice(""), 900)
  }

  const currentWord = words[wordIndex]
  if (screen === "race") return <RaceRush onBack={() => setScreen("modes")} playerName={profile.name} onRecord={(wpm) => setStats((value) => ({ ...value, best: Math.max(value.best, wpm) }))} />
  if (screen === "monsters") return <MonsterDefense onBack={() => setScreen("modes")} onRecord={(wpm) => setStats((value) => ({ ...value, best: Math.max(value.best, wpm) }))} />
  if (screen === "detective") return <CyberDetective onBack={() => setScreen("select")} onAward={(xp) => setStats((value) => ({ ...value, xp: value.xp + xp }))} />
  if (screen === "fact") return <FakeOrFact onBack={() => setScreen("select")} onAward={(xp) => setStats((value) => ({ ...value, xp: value.xp + xp }))} />
  if (screen === "footprint") return <DigitalFootprint onBack={() => setScreen("select")} onAward={(xp) => setStats((value) => ({ ...value, xp: value.xp + xp }))} />
  if (screen === "lab") return <AiLab onBack={() => setScreen("select")} onAward={(xp) => setStats((value) => ({ ...value, xp: value.xp + xp }))} />
  if (screen === "practice") return <PracticeArena onBack={() => setScreen("modes")} onRecord={(wpm) => setStats((value) => ({ ...value, best: Math.max(value.best, wpm) }))} />
  return <main className="arcade-shell"><div className="starfield" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="arcade-world"><header className="game-hud"><button className="hud-brand" onClick={() => setScreen("home")}><span className="logo-badge">K</span><span>CYBER<span>QUEST</span></span></button><div className="hud-actions"><button aria-label="Geluid" className={sound ? "hud-icon active" : "hud-icon"} onClick={() => setSound(!sound)}>{sound ? <Volume2 /> : <VolumeX />}</button><button aria-label="Muziek" className={music ? "hud-icon active" : "hud-icon"} onClick={() => setMusic(!music)}><Music2 /></button><span className="hud-profile"><b>{profile.name[0]}</b><span>{profile.name}<small>LEVEL 08</small></span></span></div></header>

{screen === "home" && <Home setScreen={setScreen} stats={stats} />}
{screen === "select" && <Select onBack={() => setScreen("home")} onNext={(game) => setScreen(game === "02" ? "detective" : game === "03" ? "fact" : game === "04" ? "lab" : game === "05" ? "footprint" : "modes")} />}
{screen === "modes" && <Modes onBack={() => setScreen("select")} onRace={() => setScreen("race")} onAdventure={() => setScreen("adventure")} onPractice={() => setScreen("practice")} onMonsters={() => setScreen("monsters")} />}
{screen === "adventure" && <TypingAdventure onBack={() => setScreen("modes")} onAward={(xp) => setStats((value) => ({ ...value, xp: value.xp + xp }))} />}
{screen === "records" && <Records stats={stats} profile={profile} onBack={() => setScreen("home")} />}
{screen === "settings" && <SettingsPanel profile={profile} setProfile={setProfile} sound={sound} music={music} setSound={setSound} setMusic={setMusic} onBack={() => setScreen("home")} />}


<footer className="game-footer"><span>CYBERQUEST ARCADE · SEIZOEN 03</span><span>WASD / TYPEN OM TE SPELEN</span><span>v1.4.0</span></footer></div></main>
}

function Home({ setScreen, stats }: { setScreen: (s: Screen) => void; stats: any }) { return <section className="home-screen"><RobotMascot /><div className="title-lockup"><div className="season"><Sparkles /> SEIZOEN 03 · NEON CIRCUITS</div><h1>CYBER<span>QUEST</span></h1><p>TYPE. RACE. <b>CONQUER.</b></p></div><div className="menu-stack"><button className="arcade-button primary" onClick={() => setScreen("select")}><Play /> SPELEN <small>ENTER</small></button><button className="arcade-button" onClick={() => setScreen("records")}><Trophy /> MIJN RECORDS</button><button className="arcade-button" onClick={() => setScreen("settings")}><Settings /> INSTELLINGEN</button></div><div className="home-stats"><span><b>{stats.xp.toLocaleString()}</b><small>XP TOTAAL</small></span><span><b>{stats.streak}</b><small>DAGEN STREAK</small></span><span><b>{stats.best}</b><small>BESTE WPM</small></span></div></section> }

const games = [{ number: "01", title: "TYPE", accent: "BATTLE", category: "Typing & Keyboard Skills", description: "Test je typesnelheid en neem het op tegen vrienden of bots.", available: true }, { number: "02", title: "CYBER", accent: "DETECTIVE", category: "Internet Safety & Privacy", description: "Onderzoek verdachte berichten, nepwebsites, phishing en online scams.", available: true }, { number: "03", title: "FAKE", accent: "OR FACT", category: "Fake News & Media Literacy", description: "Kun jij echt nieuws onderscheiden van fake news?", available: true }, { number: "04", title: "AI", accent: "LAB", category: "Artificial Intelligence", description: "Ontdek hoe AI werkt, waar het goed in is en waar het fouten maakt.", available: true }, { number: "05", title: "DIGITAL", accent: "FOOTPRINT", category: "Social Media & Online Identity", description: "Ontdek wat er gebeurt met de informatie die je online deelt.", available: true }, { number: "06", title: "TECH", accent: "BUILDER", category: "Computers & Hardware", description: "Leer hoe computers werken door hun onderdelen te verkennen.", available: false }, { number: "07", title: "NETWORK", accent: "RESCUE", category: "Networks & Internet", description: "Herstel een digitaal netwerk en ontdek hoe computers communiceren.", available: false }, { number: "08", title: "LOGIC", accent: "QUEST", category: "Programming & Logical Thinking", description: "Los puzzels op, stuur robots aan en leer de basis van programmeren.", available: false }]

function Select({ onBack, onNext }: { onBack: () => void; onNext: (game: string) => void }) { return <section className="scene"><button className="corner-back" onClick={onBack}><ArrowLeft /> MENU</button><div className="scene-title"><div className="season">KIES JE MISSIE</div><h2>SELECT <span>GAME</span></h2><p>Kies je digitale arena.</p></div><div className="game-machines">{games.map((game) => <button key={game.number} className={game.available ? "machine playable" : "machine locked"} disabled={!game.available} onClick={game.available ? () => onNext(game.number) : undefined}><div className="machine-screen">{game.available ? <Zap /> : <Lock />}<strong>{game.title}<br/>{game.accent}</strong><small>{game.available ? "AVAILABLE" : "COMING SOON"}</small><em>{game.category}</em><p>{game.description}</p></div><div className="machine-base"><span>{game.number}</span><b>{game.available ? "START GAME" : "LOCKED"}</b>{game.available && <Play />}</div></button>)}</div></section> }

function Modes({ onBack, onRace, onAdventure, onPractice, onMonsters }: { onBack: () => void; onRace: () => void; onAdventure: () => void; onPractice: () => void; onMonsters: () => void }) { return <section className="scene"><button className="corner-back" onClick={onBack}><ArrowLeft /> GAMES</button><div className="scene-title"><div className="season">TYPE BATTLE · SELECT MODE</div><h2>CHOOSE YOUR <span>FIGHT</span></h2></div><div className="mode-grid four"><button className="mode-card featured" onClick={onRace}><span className="mode-number">01</span><div className="mode-art race-art">⚡</div><h3>RACE RUSH</h3><p>Race tegen bots of andere spelers.</p><b>PLAY NOW <Play /></b></button><button className="mode-card adventure-card" onClick={onAdventure}><span className="mode-number">02</span><div className="mode-art blitz-art">100</div><h3>TYPING ADVENTURE</h3><p>Verken de map, unlock levels en verdien medals.</p><b>EXPLORE MAP <Play /></b></button><button className="mode-card" onClick={onPractice}><span className="mode-number">03</span><div className="mode-art practice-art">∞</div><h3>PRACTICE</h3><p>Oefen woorden of zinnen in je eigen tempo.</p><b>START TRAINING <Play /></b></button><button className="mode-card" onClick={onMonsters}><span className="mode-number">04</span><div className="mode-art monster-art">👾</div><h3>MONSTER DEFENSE</h3><p>Verdedig je kasteel: typ woorden om monsters te verslaan.</p><b>DEFEND <Play /></b></button></div></section> }

function Race({ onBack, current, typed, setTyped, finishWord, notice }: any) { const racers = [{name:"Nova", progress:54, color:"#30ddff"}, {name:"PixelRacer", progress:47, color:"#ffbd36"}, {name:"ByteKnight", progress:31, color:"#a875ff"}, {name:"KeyMaster", progress:18, color:"#ff668f"}]; return <main className="race-screen"><div className="race-hud"><button className="corner-back" onClick={onBack}><X /> EXIT</button><div className="round">RONDE <b>07</b> / 20</div><div className="race-live"><i/> LIVE RACE</div></div><div className="race-title"><span>NEON RUN</span><h2>RACE <b>RUSH</b></h2></div><div className="track-board">{racers.map((r, index) => <div className="lane" key={r.name}><div className="lane-player"><span style={{background:r.color}}>{r.name[0]}</span><b>{r.name}</b></div><div className="lane-track"><i style={{width:`${r.progress}%`, background:r.color}}><em>◆</em></i><span className="finish">FINISH</span></div><small>{58-index*5} WPM</small></div>)}</div><div className="typing-zone"><span>TYPE HET WOORD</span><div className="target-word">{current.split("").map((letter:string, index:number) => <b key={`${letter}-${index}`} className={index < typed.length ? typed[index] === letter ? "correct" : "wrong" : ""}>{letter}</b>)}</div><input autoFocus value={typed} onChange={(e) => { const value = e.target.value; setTyped(value); if (value === current) finishWord() }} placeholder="Typ hier om te racen..." /><small>COMBO x3  ·  FOUTEN KOSTEN TIJD</small></div>{notice && <div className="event-pop">{notice}</div>}</main> }

function Records({ stats, profile, onBack }: any) { return <section className="overlay-scene"><button className="corner-back" onClick={onBack}><ArrowLeft /> MENU</button><div className="records-panel"><div className="season">PLAYER PROFILE</div><h2>{profile.name.toUpperCase()} <span>RECORDS</span></h2><div className="record-grid"><div><strong>{stats.best}</strong><small>BESTE WPM</small></div><div><strong>{stats.words}</strong><small>WOORDEN GETYPT</small></div><div><strong>{stats.xp.toLocaleString()}</strong><small>TOTAAL XP</small></div></div><div className="score-list"><p><span>01</span> NEON RUN <b>58 WPM</b></p><p><span>02</span> WORD BLITZ <b>54 WPM</b></p><p><span>03</span> PRACTICE <b>49 WPM</b></p></div></div></section> }

function SettingsPanel({ profile, setProfile, sound, music, setSound, setMusic, onBack }: any) { return <section className="overlay-scene"><button className="corner-back" onClick={onBack}><ArrowLeft /> MENU</button><div className="settings-game-panel"><div className="season">SYSTEM CONFIG</div><h2>GAME <span>SETTINGS</span></h2><label>PLAYER NAME<input value={profile.name} onChange={(e) => setProfile({...profile, name:e.target.value.slice(0,16)})}/></label><div className="setting-toggle"><span>GELUIDSEFFECTEN</span><button onClick={() => setSound(!sound)} className={sound ? "on" : ""}>{sound ? "AAN" : "UIT"}</button></div><div className="setting-toggle"><span>MUZIEK</span><button onClick={() => setMusic(!music)} className={music ? "on" : ""}>{music ? "AAN" : "UIT"}</button></div></div></section> }
