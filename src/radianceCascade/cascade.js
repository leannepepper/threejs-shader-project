import * as THREE from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import {
  MeshStandardNodeMaterial,
  uniform,
  color,
  vec2,
  vec3,
  vec4,
  modelWorldMatrix,
  timerLocal,
  positionLocal,
  smoothstep,
  mix,
  varying,
  mul,
  sin,
  uv,
  timerGlobal,
  triplanarTexture,
  texture,
  toVar,
  step,
  abs,
  If,
  Fn,
  length,
  screenSize,
  screenCoordinate,
  fract,
  max,
  float,
  dFdx,
  dFdy,
  remap,
  floor,
  mod,
  select,
  cos,
  clamp,
  dot
} from 'three/tsl'
import { GRID_SIZE } from './LightBright.js'
import Raymarch from './raymarch.js'
//const GRID_SIZE = 4.0

export const probeGridScene = new THREE.Scene()
export const probeGridRT = new THREE.WebGLRenderTarget(GRID_SIZE, GRID_SIZE, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat
})

const planeGeometry = new THREE.PlaneGeometry(40, 40)
const material = new MeshBasicNodeMaterial()

const uvVar = uv()
const st = vec2(uvVar.mul(GRID_SIZE))
const cell = floor(st)
const f = fract(st) // Fractional position within the cell [0,1]
const center = vec2(0.5, 0.5)
const d = length(f.sub(center))
const intensity = float(1.0).sub(smoothstep(0.1, 0.105, d))

const probePos = cell.add(vec2(0.5)).div(GRID_SIZE)

const gridColor = vec3(cell.x.div(GRID_SIZE), cell.y.div(GRID_SIZE), 0.5).mul(
  intensity
)

// --- SDF Function for a Line Segment ---
const sdfSegment = Fn(({ p, a, b }) => {
  const pa = p.sub(a)
  const ba = b.sub(a)
  const h = clamp(dot(pa, ba).div(dot(ba, ba)), 0.0, 1.0)
  return length(pa.sub(ba.mul(h)))
})

// --- Visualize Rays ---
const numRays = 8
const baseAngle = float(45.0).mul(Math.PI).div(180.0) // 45 degrees in radians
let rayVisualization = float(0.0)
const probeCenter = vec2(0.5, 0.5)
let colorOfRay = vec3(0.0)

for (let i = 0; i < numRays; i++) {
  const angle = baseAngle.add(
    float(i).mul(float(2.0).mul(Math.PI).div(numRays))
  )
  const rayDir = vec2(cos(angle), sin(angle))

  const rayLength = float(0.5)
  const rayEnd = probeCenter.add(rayDir.mul(rayLength))
  const distToRay = sdfSegment({ p: f, a: probeCenter, b: rayEnd })

  const lineWidth = float(0.01)
  const rayLine = float(1.0).sub(smoothstep(0.0, lineWidth, distToRay))

  rayVisualization = max(rayVisualization, rayLine)

  // For each ray, lets ray march and visualize the distance
  colorOfRay = max(
    colorOfRay,
    Raymarch({
      cameraOrigin: probePos,
      cameraDirection: rayDir
    })
  )
}

console.log({ colorOfRay })

//const rayColor = vec3(1.0, 1.0, 0.0).mul(rayVisualization)
const rayColor = colorOfRay.mul(rayVisualization)
const finalColor = mix(gridColor, rayColor, rayVisualization)

material.colorNode = finalColor

const probeGridQuad = new THREE.Mesh(planeGeometry, material)
probeGridScene.add(probeGridQuad)
