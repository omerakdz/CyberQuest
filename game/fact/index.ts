import * as Phaser from "phaser"
import type { FactGameId } from "@/lib/fact"
import { H, W } from "@/game/detective/kit"
import { FactMenuScene, type FactBridge } from "./shared"
import { NewsScene } from "./news-scene"
import { PictureScene } from "./picture-scene"
import { FrenzyScene } from "./frenzy-scene"

const PLAY = { news: NewsScene, picture: PictureScene, frenzy: FrenzyScene }

export function createFactGame(parent: HTMLElement, gameId: FactGameId, bridge: FactBridge) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: W,
    height: H,
    backgroundColor: "#050a18",
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [FactMenuScene, PLAY[gameId]],
  })
  game.registry.set("bridge", bridge)
  game.registry.set("gameId", gameId)
  return game
}
