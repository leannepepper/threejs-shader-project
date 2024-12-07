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
  min,
  max,
  length,
  screenSize,
  screenCoordinate
} from 'three/tsl'
import { simplexNoise3d } from '../utils/simplexNoise3d.js'

const material = new MeshBasicNodeMaterial()

const uvVar = uv()
const shapeColor = vec3(0.0, 0.0, 0.0)

const RED = vec3(1.0, 0.0, 0.0)
const BLUE = vec3(0.0, 0.0, 1.0)
const WHITE = vec3(1.0, 0.9, 0.9)

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

// Op Union
const opUnion = Fn(({ a, b }) => {
  return min(a, b)
})

// Op Intersection
const opIntersection = Fn(({ a, b }) => {
  return max(a, b)
})

// Op Difference
const opDifference = Fn(({ a, b }) => {
  return max(a.mul(-1.0), b)
})

const resolution = window.innerWidth / window.innerHeight
const pixelCoords = uvVar.sub(vec2(0.5)).mul(resolution).toVar()

// circle
const circle = sdfCircle({ pos: pixelCoords, r: 1 })

//Segment
const topVec = vec2(0, 0.8)
const noiseFactor = simplexNoise3d(vec3(timerGlobal().mul(2.0), 1.0, 1.0))
const bottomVec = vec2(noiseFactor.x, float(0.8).sub(timerGlobal().mul(0.2)))
const thickness = float(0.01)
const segment = sdfSegment({ p: pixelCoords, a: topVec, b: bottomVec }).sub(
  thickness
)

//const d = opUnion({ a: circle, b: segment })
//const d = opIntersection({ a: circle, b: segment })
//const d = opDifference({ a: circle, b: segment })
const d = opDifference({ a: segment, b: circle })
let allShapes = mix(RED.mul(0.5), WHITE, smoothstep(0.0, 0.001, d))
let mixShapes = mix(BLUE, allShapes, smoothstep(-0.09, 0.001, d))

material.colorNode = mixShapes

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const GrowPathMesh = new THREE.Mesh(geometry, material)

export default GrowPathMesh
