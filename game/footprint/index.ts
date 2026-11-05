import * as Phaser from "phaser"
import type { FootprintGameId } from "@/lib/footprint"
import { H, W } from "@/game/detective/kit"
import { FootprintMenuScene, type FootprintBridge } from "./shared"
import { TrackerScene } from "./tracker-scene"
import { PrivacyScene } from "./privacy-scene"
import { ViralScene } from "./viral-scene"

const PLAY = { tracker: TrackerScene, privacy: PrivacyScene, viral: ViralScene }

export function createFootprintGame(parent: HTMLElement, gameId: FootprintGameId, bridge: FootprintBridge) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: W,
    height: H,
    backgroundColor: "#050a18",
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [FootprintMenuScene, PLAY[gameId]],
  })
  game.registry.set("bridge", bridge)
  game.registry.set("gameId", gameId)
  return game
}
