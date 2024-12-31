import * as THREE from 'three'
import {
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
  normalLocal
} from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const material = new MeshBasicNodeMaterial()
const uvVar = uv()
const localSpacePosition = positionLocal
let t = sin(localSpacePosition.y.mul(20.0).add(timerGlobal().mul(10.0)))
t = remap(t, -1.0, 1.0, 0.0, 0.2)

material.positionNode = localSpacePosition.add(normalLocal.mul(t))

const lightBlue = color('#00ccff')
const darkBlue = color('#0066ff')
const shapeColor = mix(darkBlue, lightBlue, smoothstep(0.0, 0.2, t))
material.colorNode = vec3(shapeColor)

const geometry = new THREE.IcosahedronGeometry(1, 128)
const warpedSphereMesh = new THREE.Mesh(geometry, material)

export default warpedSphereMesh
