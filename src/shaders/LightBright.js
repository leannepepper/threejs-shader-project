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
  mod
} from 'three/tsl'

const material = new MeshBasicNodeMaterial()

export const selectedRow = uniform(5.0)
export const selectedCol = uniform(10.0)

const shapeColor = color('#19191f')
const black = color('#000000')
const highlight = color('#FF0000')

const uvVar = uv()
const st = vec2(uvVar.mul(20.0))

const sqrt3 = float(Math.sqrt(3))
const s = sqrt3.div(2.0)

const rowIndex = floor(st.y.div(s))
const parity = mod(rowIndex, float(2.0))
const colIndex = floor(st.x.sub(parity.mul(0.5)))

const centerX = colIndex.add(parity.mul(0.5)).add(0.5)
const centerY = rowIndex.mul(s).add(s.mul(0.5))
const centerCell = vec2(centerX, centerY)

const diff = st.sub(centerCell)
const dist = length(diff)

const circleMask = smoothstep(0.0, 0.05, float(0.4).sub(dist))

const rowDiff = abs(rowIndex.sub(selectedRow))
const colDiff = abs(colIndex.sub(selectedCol))

// step(0.5, rowDiff) is 1 if rowDiff >= 0.5, else 0
// => 1 - step(...) is 0 if rowDiff >= 0.5, else 1
// So rowMatch = 1 only if rowDiff < 0.5 => i.e. rowIndex = selectedRow
const rowMatch = float(1.0).sub(step(0.5, rowDiff))
const colMatch = float(1.0).sub(step(0.5, colDiff))

// isSelected = 1 if rowIndex and colIndex match exactly
const isSelected = rowMatch.mul(colMatch)

const baseColor = mix(black, shapeColor, circleMask)
const selectedColor = mix(baseColor, highlight, isSelected)
const finalColor = mix(baseColor, selectedColor, circleMask)

material.colorNode = finalColor

const geometry = new THREE.PlaneGeometry(20, 20, 100, 100)
export const LightBrightMesh = new THREE.Mesh(geometry, material)
