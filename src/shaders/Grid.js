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
  remap
} from 'three/tsl'

const material = new MeshBasicNodeMaterial()

const uvVar = uv()
const shapeColor = color('#FAF9F6')
const black = color('#000000')
const blue = color('#0000FF')

const center = vec2(uvVar.sub(0.5))
let cell = fract(center.mul(10.0))
cell = abs(cell.sub(0.5))
let distanceToCell = max(cell.x, cell.y).mul(2.0)
// inverse the distance
distanceToCell = float(1.0).sub(distanceToCell)

const cellLines = smoothstep(0.0, 0.05, distanceToCell)
const xAxis = smoothstep(0.0, 0.002, abs(uvVar.y.sub(0.5)))
const yAxis = smoothstep(0.0, 0.002, abs(uvVar.x.sub(0.5)))

let grid = mix(black, shapeColor, cellLines)
grid = mix(blue, grid, xAxis)
grid = mix(blue, grid, yAxis)
material.colorNode = vec3(grid)

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const gridMesh = new THREE.Mesh(geometry, material)

export default gridMesh
