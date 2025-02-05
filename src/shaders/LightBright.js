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
  select
} from 'three/tsl'

export const GRID_SIZE = 40.0

/** Set up data texture to hold selected state information */
const data = new Uint8Array(GRID_SIZE * GRID_SIZE * 4)
export const selectedTexture = new THREE.DataTexture(
  data,
  GRID_SIZE,
  GRID_SIZE,
  THREE.RGBAFormat
)
selectedTexture.needsUpdate = true

/** Create Mesh with Honeycomb Grid and Lights */
const material = new MeshBasicNodeMaterial()

const shapeColor = color('#19191f')
const black = color('#000000')

const uvVar = uv()
const st = vec2(uvVar.mul(GRID_SIZE))

const sqrt3 = float(Math.sqrt(3))
const s = sqrt3.div(2.0) // TODO: Fix index bug

const rowIndex = floor(st.y.div(s))
const parity = mod(rowIndex, float(2.0))
const colIndex = floor(st.x.sub(parity.mul(0.5)))

const centerX = colIndex.add(parity.mul(0.5)).add(0.5)
const centerY = rowIndex.mul(s).add(s.mul(0.5))
const centerCell = vec2(centerX, centerY)

const diff = st.sub(centerCell)
const dist = length(diff)

const circleMask = smoothstep(0.0, 0.05, float(0.4).sub(dist))

const u = colIndex.add(0.5).div(float(GRID_SIZE))
const v = rowIndex.add(0.5).div(float(GRID_SIZE))

const texSample = texture(selectedTexture, vec2(u, v))
const isSelected = texSample.a // use alpha channel to store selected state
const randomColor = texSample.rgb

// If isSelected is 255 (true), then use the rgb channels to color the cell
// Otherwise, use the base color

//const highlightColor = select(isSelected.equal(float(255)), texSample.r, 0)

const baseColor = mix(black, shapeColor, circleMask)
const selectedColor = mix(baseColor, randomColor, isSelected)
const finalColor = mix(baseColor, selectedColor, circleMask)

material.colorNode = finalColor

const geometry = new THREE.PlaneGeometry(40, 40, 100, 100)

export const LightBrightMesh = new THREE.Mesh(geometry, material)
