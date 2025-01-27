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

const shapeColor = color('#19191f')
const black = color('#000000')
const uvVar = uv()
const st = vec2(uvVar.mul(20.0))

const sqrt3 = float(Math.sqrt(3))
const s = sqrt3.div(2.0)

const row = floor(st.y.div(s))
const parity = mod(row, float(2.0))
const col = floor(st.x.sub(parity.mul(0.5)))

const centerX = col.add(parity.mul(0.5)).add(0.5)
const centerY = row.mul(s).add(s.mul(0.5))
const centerCell = vec2(centerX, centerY)

const diff = st.sub(centerCell)
const dist = length(diff)

const circleMask = smoothstep(0.0, 0.05, float(0.4).sub(dist))
const finalColor = mix(black, shapeColor, circleMask)
material.colorNode = finalColor

const geometry = new THREE.PlaneGeometry(20, 20, 100, 100)
const LightBrightMesh = new THREE.Mesh(geometry, material)

export default LightBrightMesh
