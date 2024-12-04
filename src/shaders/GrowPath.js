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
  float,
  varying,
  mul,
  sin,
  clamp,
  dot,
  cos,
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

const uvVar = uv()
const shapeColor = vec3(0.0, 0.0, 0.0)

// SDF Circle
const sdfCircle = Fn(({ pos, r }) => {
  return length(pos).sub(r)
})

//SDF Segment
const sdfSegment = Fn(({ p, a, b }) => {
  const pa = p.sub(a)
  const ba = b.sub(a)
  const h = clamp(dot(pa, ba).div(dot(ba, ba)), 0.0, 1.0)
  return length(pa.sub(ba.mul(h)))
})

const resolution = window.innerWidth / window.innerHeight
const pixelCoords = uvVar.sub(vec2(0.5)).mul(resolution).toVar()

// circle
const circle = sdfCircle({ pos: pixelCoords, r: 1 })

//Segment
const topVec = vec2(
  sin(timerGlobal().mul(2.0)),
  cos(timerGlobal().mul(2.0).add(1.0))
)
const bottomVec = vec2(cos(timerGlobal().mul(2.0).sub(1.0)), -1.0)
const thickness = float(0.2)
const segment = sdfSegment({ p: pixelCoords, a: topVec, b: bottomVec }).sub(
  thickness
)

const shapes1 = mix(shapeColor, vec3(1.0), step(0, segment))
const shapes2 = mix(shapes1, vec3(1.0), step(0, circle))
const allShapes = mix(shapes2, vec3(1.0), step(0, segment))

material.colorNode = allShapes

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const GrowPathMesh = new THREE.Mesh(geometry, material)

export default GrowPathMesh
