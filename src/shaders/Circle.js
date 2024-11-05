import * as THREE from 'three'
import {
  MeshBasicNodeMaterial,
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
  screenCoordinate
} from 'three/tsl'

const material = new MeshBasicNodeMaterial()

const uvScaled = uv().mul(1).toVar()
const shapeColor = color('#ff6088')

// SDF Circle
const sdfCircle = Fn(({ pos }) => {
  const radius = 0.5
  return length(pos).sub(radius)
})

const resolution = window.innerWidth / window.innerHeight
const pixelCoords = uvScaled.sub(vec2(0.5)).mul(resolution).toVar()

const d = sdfCircle({ pos: pixelCoords })
const circle = mix(shapeColor, vec3(1.0), step(0, d))
material.colorNode = circle

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const circleMesh = new THREE.Mesh(geometry, material)

export default circleMesh
