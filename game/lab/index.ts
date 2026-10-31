import * as Phaser from "phaser"
import type { LabGameId } from "@/lib/lab"
import { H, W } from "@/game/detective/kit"
import { LabMenuScene, type LabBridge } from "./shared"
import { TrainerScene } from "./trainer-scene"
import { HumanScene } from "./human-scene"
import { RobotScene } from "./robot-scene"

const PLAY = { trainer: TrainerScene, human: HumanScene, robot: RobotScene }

export function createLabGame(parent: HTMLElement, gameId: LabGameId, bridge: LabBridge) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: W,
    height: H,
    backgroundColor: "#050a18",
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [LabMenuScene, PLAY[gameId]],
  })
  game.registry.set("bridge", bridge)
  game.registry.set("gameId", gameId)
  return game
}
