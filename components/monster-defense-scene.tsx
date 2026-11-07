"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { OrthographicCamera, type Group } from "three"

export type MonsterVisual = {
  id: number
  word: string
  x: number
  lane: number
  kind: "zombie" | "ghost" | "bat" | "goblin" | "spider" | "dragon"
  health: number
  maxHealth: number
  dying: boolean
  deathTimer: number
}

type Props = {
  monsters: MonsterVisual[]
  lockedId: number | null
  typed: string
  paused: boolean
  animate: boolean
}

function CameraTarget() {
  const { camera, size } = useThree()

  useEffect(() => {
    camera.lookAt(0, 0, 0)
    if (camera instanceof OrthographicCamera) camera.zoom = Math.max(1, size.height / 9)
    camera.updateProjectionMatrix()
  }, [camera, size.height, size.width])

  return null
}

function Tree({ position, scale = 1, shapeScale }: { position: [number, number, number]; scale?: number; shapeScale: number }) {
  return (
    <group position={position} scale={[shapeScale * scale, scale, scale]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 1.1, 5]} />
        <meshStandardMaterial color="#805431" flatShading />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <coneGeometry args={[0.82, 1.55, 6]} />
        <meshStandardMaterial color="#2e9b63" flatShading />
      </mesh>
      <mesh position={[0.12, 1.9, 0.04]} castShadow>
        <coneGeometry args={[0.56, 1.15, 6]} />
        <meshStandardMaterial color="#53bf76" flatShading />
      </mesh>
    </group>
  )
}

function Rock({ position, scale = 1, shapeScale }: { position: [number, number, number]; scale?: number; shapeScale: number }) {
  return (
    <group position={position} scale={[shapeScale * scale, scale, scale]}>
      <mesh rotation={[0.2, 0.5, 0]} castShadow>
        <dodecahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color="#738494" flatShading />
      </mesh>
    </group>
  )
}

function Castle({ shapeScale }: { shapeScale: number }) {
  return (
    <group position={[-15.3, 0, 0]} scale={[shapeScale, 1, 1]}>
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2.1, 4.25]} />
        <meshStandardMaterial color="#8798a9" flatShading />
      </mesh>
      <mesh position={[1.06, 0.68, 0]} castShadow>
        <boxGeometry args={[0.18, 1.36, 1.05]} />
        <meshStandardMaterial color="#493a48" flatShading />
      </mesh>
      {[-1.72, 1.72].map((z) => (
        <group key={z} position={[-0.1, 0, z]}>
          <mesh position={[0, 1.62, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.66, 3.15, 7]} />
            <meshStandardMaterial color="#a6b5c3" flatShading />
          </mesh>
          <mesh position={[0, 3.48, 0]} castShadow>
            <coneGeometry args={[0.76, 1.3, 7]} />
            <meshStandardMaterial color="#e06d61" flatShading />
          </mesh>
          <mesh position={[0, 4.38, 0]} castShadow>
            <boxGeometry args={[0.08, 0.9, 0.08]} />
            <meshStandardMaterial color="#f4d676" />
          </mesh>
          <mesh position={[0.26, 4.68, 0]} rotation={[0, 0, -0.15]} castShadow>
            <boxGeometry args={[0.62, 0.32, 0.06]} />
            <meshStandardMaterial color="#ff8f61" flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.35, 0]} castShadow>
        <boxGeometry args={[2.18, 0.24, 4.45]} />
        <meshStandardMaterial color="#b4c1cc" flatShading />
      </mesh>
      <mesh position={[0.36, 0.63, 0]} castShadow>
        <boxGeometry args={[0.82, 1.24, 1.12]} />
        <meshStandardMaterial color="#664551" flatShading />
      </mesh>
      <mesh position={[0.36, 0.63, 0]} castShadow>
        <boxGeometry args={[0.12, 1.2, 0.12]} />
        <meshStandardMaterial color="#d89a57" />
      </mesh>
    </group>
  )
}

function Battlefield({ shapeScale }: { shapeScale: number }) {
  const lanes = [-3.25, -1.63, 0, 1.63, 3.25]
  const trees: [number, number, number][] = [
    [-13.5, 0, -4.4], [-7.2, 0, -4.45], [-0.8, 0, -4.4], [7, 0, -4.45], [13.5, 0, -4.4],
    [-11.5, 0, 4.4], [-4.7, 0, 4.45], [3.2, 0, 4.4], [10.5, 0, 4.4],
  ]

  return (
    <group>
      <mesh position={[0, -0.24, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[42, 11]} />
        <meshStandardMaterial color="#66bd79" flatShading />
      </mesh>
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.35, 1, 1]} receiveShadow>
        <circleGeometry args={[8.5, 10]} />
        <meshStandardMaterial color="#85d184" flatShading />
      </mesh>
      {lanes.map((z, index) => (
        <group key={z}>
          <mesh position={[0, -0.05, z]} receiveShadow>
            <boxGeometry args={[36, 0.16, 0.84]} />
            <meshStandardMaterial color={index % 2 ? "#c99559" : "#d4a76a"} flatShading />
          </mesh>
          <mesh position={[0, 0.035, z - 0.48]}>
            <boxGeometry args={[35.8, 0.045, 0.08]} />
            <meshStandardMaterial color="#ead29a" flatShading />
          </mesh>
          <mesh position={[0, 0.035, z + 0.48]}>
            <boxGeometry args={[35.8, 0.045, 0.08]} />
            <meshStandardMaterial color="#ead29a" flatShading />
          </mesh>
        </group>
      ))}
      {trees.map((position, index) => <Tree key={index} position={position} scale={index % 3 === 0 ? 0.8 : 1} shapeScale={shapeScale} />)}
      <Rock position={[-14, 0.2, -3.95]} scale={0.8} shapeScale={shapeScale} />
      <Rock position={[1.3, 0.22, 3.95]} shapeScale={shapeScale} />
      <Rock position={[12, 0.22, -3.95]} scale={0.72} shapeScale={shapeScale} />
      <Castle shapeScale={shapeScale} />
    </group>
  )
}

function Humanoid({ goblin = false }: { goblin?: boolean }) {
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const leftLeg = useRef<Group>(null)
  const rightLeg = useRef<Group>(null)

  useFrame(({ clock }) => {
    const time = clock.elapsedTime * 7
    if (leftArm.current) leftArm.current.rotation.z = Math.sin(time) * 0.48 - 0.12
    if (rightArm.current) rightArm.current.rotation.z = Math.sin(time + Math.PI) * 0.48 + 0.12
    if (leftLeg.current) leftLeg.current.rotation.z = Math.sin(time + Math.PI) * 0.36
    if (rightLeg.current) rightLeg.current.rotation.z = Math.sin(time) * 0.36
  })

  const skin = goblin ? "#5dbd65" : "#76ac68"
  const clothes = goblin ? "#8657bd" : "#5c7480"

  return (
    <group>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.68, 0.86, 0.5]} />
        <meshStandardMaterial color={clothes} flatShading />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <dodecahedronGeometry args={[0.43, 0]} />
        <meshStandardMaterial color={skin} flatShading />
      </mesh>
      <mesh position={[-0.16, 1.68, -0.36]}>
        <sphereGeometry args={[0.055, 6, 5]} />
        <meshBasicMaterial color="#fff4b1" />
      </mesh>
      <mesh position={[0.16, 1.68, -0.36]}>
        <sphereGeometry args={[0.055, 6, 5]} />
        <meshBasicMaterial color="#fff4b1" />
      </mesh>
      {goblin && [-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.42, 1.73, 0]} rotation={[0, 0, side * -0.5]}>
          <coneGeometry args={[0.16, 0.56, 4]} />
          <meshStandardMaterial color={skin} flatShading />
        </mesh>
      ))}
      <group ref={leftArm} position={[-0.42, 1.22, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <boxGeometry args={[0.2, 0.78, 0.22]} />
          <meshStandardMaterial color={skin} flatShading />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.42, 1.22, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <boxGeometry args={[0.2, 0.78, 0.22]} />
          <meshStandardMaterial color={skin} flatShading />
        </mesh>
      </group>
      <group ref={leftLeg} position={[-0.2, 0.52, 0]}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <boxGeometry args={[0.25, 0.62, 0.3]} />
          <meshStandardMaterial color="#485260" flatShading />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.2, 0.52, 0]}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <boxGeometry args={[0.25, 0.62, 0.3]} />
          <meshStandardMaterial color="#485260" flatShading />
        </mesh>
      </group>
    </group>
  )
}

function Ghost() {
  return (
    <group>
      <mesh position={[0, 1.08, 0]} castShadow>
        <sphereGeometry args={[0.68, 8, 6]} />
        <meshStandardMaterial color="#a6efff" transparent opacity={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.56, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.57, 0.82, 7]} />
        <meshStandardMaterial color="#7fd8f3" transparent opacity={0.92} flatShading />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 1.15, -0.57]}>
          <sphereGeometry args={[0.09, 6, 5]} />
          <meshBasicMaterial color="#263a69" />
        </mesh>
      ))}
      <mesh position={[0, 0.94, -0.61]}>
        <sphereGeometry args={[0.08, 6, 5]} />
        <meshBasicMaterial color="#263a69" />
      </mesh>
    </group>
  )
}

function Bat() {
  const leftWing = useRef<Group>(null)
  const rightWing = useRef<Group>(null)

  useFrame(({ clock }) => {
    const flap = Math.sin(clock.elapsedTime * 13) * 0.62
    if (leftWing.current) leftWing.current.rotation.x = flap
    if (rightWing.current) rightWing.current.rotation.x = -flap
  })

  return (
    <group>
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.36, 7, 6]} />
        <meshStandardMaterial color="#8c63d8" flatShading />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} ref={side < 0 ? leftWing : rightWing} position={[0, 1.2, side * 0.23]}>
          <mesh position={[0.06, 0, side * 0.48]} rotation={[side * -0.14, 0, side * 0.15]} castShadow>
            <boxGeometry args={[0.6, 0.08, 1.05]} />
            <meshStandardMaterial color="#6842ad" flatShading />
          </mesh>
        </group>
      ))}
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 1.36, -0.29]}>
          <sphereGeometry args={[0.07, 6, 5]} />
          <meshBasicMaterial color="#f9eea2" />
        </mesh>
      ))}
    </group>
  )
}

function SpiderLeg({ side, index }: { side: number; index: number }) {
  const leg = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (leg.current) leg.current.rotation.y = side * (0.25 + Math.sin(clock.elapsedTime * 9 + index) * 0.16)
  })

  return (
    <group ref={leg} position={[side * 0.2, 0.74, (index - 1.5) * 0.22]}>
      <mesh position={[side * 0.36, 0, 0]} rotation={[0, 0, side * 0.2]} castShadow>
        <boxGeometry args={[0.82, 0.12, 0.13]} />
        <meshStandardMaterial color="#db7b3d" flatShading />
      </mesh>
    </group>
  )
}

function Spider() {
  return (
    <group>
      <mesh position={[0.1, 0.9, 0]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#d95b43" flatShading />
      </mesh>
      <mesh position={[-0.36, 0.9, 0]} castShadow>
        <dodecahedronGeometry args={[0.31, 0]} />
        <meshStandardMaterial color="#f08b4c" flatShading />
      </mesh>
      {[-1, 1].flatMap((side) => [0, 1, 2, 3].map((index) => (
        <SpiderLeg key={`${side}-${index}`} side={side} index={index} />
      )))}
      {[-0.47, -0.24].map((z) => (
        <mesh key={z} position={[-0.53, 1, z]}>
          <sphereGeometry args={[0.07, 6, 5]} />
          <meshBasicMaterial color="#fff2a1" />
        </mesh>
      ))}
    </group>
  )
}

function Dragon({ attacking }: { attacking: boolean }) {
  const leftWing = useRef<Group>(null)
  const rightWing = useRef<Group>(null)
  const fire = useRef<Group>(null)

  useFrame(({ clock }) => {
    const flap = Math.sin(clock.elapsedTime * 8) * 0.48
    if (leftWing.current) leftWing.current.rotation.x = flap
    if (rightWing.current) rightWing.current.rotation.x = -flap
    if (fire.current) {
      fire.current.visible = attacking && Math.sin(clock.elapsedTime * 8) > -0.15
      const size = 0.8 + (Math.sin(clock.elapsedTime * 13) + 1) * 0.35
      fire.current.scale.set(size, size, size)
    }
  })

  return (
    <group>
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.67, 8, 6]} />
        <meshStandardMaterial color="#e65d43" flatShading />
      </mesh>
      <mesh position={[-0.65, 1.32, 0]} castShadow>
        <dodecahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color="#ff8b4c" flatShading />
      </mesh>
      <mesh position={[0.84, 0.96, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <coneGeometry args={[0.27, 1.2, 5]} />
        <meshStandardMaterial color="#c3484c" flatShading />
      </mesh>
      {[-0.18, 0.18].map((z) => (
        <group key={z} position={[-0.72, 1.63, z]}>
          <mesh position={[0, 0.26, 0]} rotation={[0, 0, -0.15]} castShadow>
            <coneGeometry args={[0.12, 0.52, 4]} />
            <meshStandardMaterial color="#f6d17b" flatShading />
          </mesh>
          <mesh position={[-0.03, -0.1, z < 0 ? -0.28 : 0.28]}>
            <sphereGeometry args={[0.075, 6, 5]} />
            <meshBasicMaterial color="#fff3a1" />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} ref={side < 0 ? leftWing : rightWing} position={[0.12, 1.42, side * 0.35]}>
          <mesh position={[0.12, 0, side * 0.62]} rotation={[side * -0.18, 0, 0]} castShadow>
            <boxGeometry args={[1.05, 0.09, 1.3]} />
            <meshStandardMaterial color="#ba454c" flatShading side={2} />
          </mesh>
          <mesh position={[0.28, 0.12, side * 1.1]} rotation={[0, 0, -0.25]} castShadow>
            <coneGeometry args={[0.16, 0.82, 4]} />
            <meshStandardMaterial color="#f06c55" flatShading />
          </mesh>
        </group>
      ))}
      <group ref={fire} position={[-1.16, 1.05, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.43, 1.25, 6]} />
          <meshBasicMaterial color="#ff6a27" />
        </mesh>
        <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.2, 0.68, 5]} />
          <meshBasicMaterial color="#ffe66c" />
        </mesh>
      </group>
    </group>
  )
}

function Enemy({ monster, shapeScale }: { monster: MonsterVisual; shapeScale: number }) {
  const motion = useRef<Group>(null)
  const flying = monster.kind === "dragon" || monster.kind === "bat" || monster.kind === "ghost"
  const x = ((monster.x - 50) / 50) * 18
  const z = (monster.lane - 2) * 1.63

  useFrame(({ clock }) => {
    if (!motion.current) return
    const time = clock.elapsedTime + monster.id
    if (monster.dying) {
      const progress = Math.min(1, Math.max(0, 1 - monster.deathTimer / 0.45))
      motion.current.scale.setScalar(Math.max(0.05, 1 - progress))
      motion.current.position.y = progress * 0.75
      motion.current.rotation.z = progress * 1.3
      return
    }
    motion.current.scale.setScalar(1)
    motion.current.position.y = flying
      ? 0.15 + Math.sin(time * 3) * 0.16
      : Math.abs(Math.sin(time * 7)) * 0.08
    motion.current.rotation.z = monster.kind === "zombie" || monster.kind === "goblin"
      ? Math.sin(time * 7) * 0.035
      : 0
  })

  return (
    <group position={[x, 0, z]}>
      <group scale={[shapeScale, 1, 1]}>
        <group ref={motion}>
          {monster.kind === "zombie" && <Humanoid />}
          {monster.kind === "goblin" && <Humanoid goblin />}
          {monster.kind === "ghost" && <Ghost />}
          {monster.kind === "bat" && <Bat />}
          {monster.kind === "spider" && <Spider />}
          {monster.kind === "dragon" && <Dragon attacking={monster.x < 34} />}
        </group>
      </group>
    </group>
  )
}

function World({ monsters }: { monsters: MonsterVisual[] }) {
  const { size } = useThree()
  const scaleX = Math.max(0.15, (size.width / size.height * 9) / 42)
  const shapeScale = 1 / scaleX

  return (
    <group scale={[scaleX, 1, 1]}>
      <Battlefield shapeScale={shapeScale} />
      {monsters.map((monster) => (
        <Enemy key={monster.id} monster={monster} shapeScale={shapeScale} />
      ))}
    </group>
  )
}

export function MonsterDefenseScene({ monsters, lockedId, typed, paused, animate }: Props) {
  return (
    <div className="md-canvas" aria-label="3D kasteel en monster-slagveld">
      <Canvas
        orthographic
        shadows="percentage"
        frameloop={animate && !paused ? "always" : "demand"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 15, 18], zoom: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
        fallback={<div className="md-webgl-error" role="status">3D-weergave niet beschikbaar in deze browser.</div>}
      >
        <color attach="background" args={["#b6e4ff"]} />
        <fog attach="fog" args={["#b6e4ff", 26, 48]} />
        <ambientLight intensity={0.8} />
        <hemisphereLight args={["#f2fbff", "#4c8f62", 0.8]} />
        <directionalLight position={[-5, 12, 8]} intensity={2.2} castShadow />
        <CameraTarget />
        <World monsters={monsters} />
      </Canvas>
      <div className="md-model-label-layer">
        {monsters.filter((monster) => !monster.dying).map((monster) => {
          const x = ((monster.x - 50) / 50) * 18
          const z = (monster.lane - 2) * 1.63
          const height = monster.kind === "dragon" ? 2.85 : 2.15
          const screenY = height * 0.768 - z * 0.64
          const locked = monster.id === lockedId

          return (
            <div
              key={monster.id}
              className={`md-model-tag${locked ? " locked" : ""}${monster.kind === "dragon" ? " boss" : ""}`}
              style={{ left: `${50 + (x / 42) * 100}%`, top: `${50 - (screenY / 9) * 100}%` }}
            >
              <span className="md-model-word">
                <span className="md-typed">{locked ? monster.word.slice(0, typed.length) : ""}</span>
                {locked ? monster.word.slice(typed.length) : monster.word}
              </span>
              <span className="md-model-health" aria-label={`${Math.ceil(monster.health)} van ${monster.maxHealth} gezondheid`}>
                <i style={{ width: `${Math.max(0, (monster.health / monster.maxHealth) * 100)}%` }} />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
