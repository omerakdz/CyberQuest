import * as Phaser from "phaser"
import type { DetectiveGameId } from "@/lib/detective"
import { H, W, type Bridge } from "./kit"
import { LevelMenuScene } from "./menu-scene"
import { PhishingScene } from "./phishing-scene"
import { CrimeScene } from "./crime-scene"
import { PasswordScene } from "./password-scene"

const PLAY = { phishing: PhishingScene, crime: CrimeScene, password: PasswordScene }

export function createDetectiveGame(parent: HTMLElement, gameId: DetectiveGameId, bridge: Bridge) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: W,
    height: H,
    backgroundColor: "#050a18",
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [LevelMenuScene, PLAY[gameId]],
  })
  game.registry.set("bridge", bridge)
  game.registry.set("gameId", gameId)
  return game
}
