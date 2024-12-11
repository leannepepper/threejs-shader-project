import * as THREE from 'three'
import {
  clamp,
  dot,
  float,
  Fn,
  length,
  max,
  MeshBasicNodeMaterial,
  min,
  mix,
  select,
  smoothstep,
  step,
  timerGlobal,
  uv,
  vec2,
  vec3
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

//Main Branch
const timer = timerGlobal()
const thickness = float(0.01)
const noiseFactor = simplexNoise3d(vec3(timer.mul(2.0), 1.0, 1.0))
const branchGrowthTime = timer.mul(0.2)

const mainStartY = float(0.8)
const mainEndY = float(0.8).sub(branchGrowthTime)
const clampedGrowth = clamp(mainEndY, -0.7, 0.8)

const mainStartPos = vec2(0, mainStartY)
const mainEndPos = vec2(0, clampedGrowth)

const mainBranch = sdfSegment({
  p: pixelCoords,
  a: mainStartPos,
  b: mainEndPos
}).sub(thickness)

// Branch off of the Segment
const branchStartY = float(0.5)
const branchActive = float(1.0).sub(step(branchStartY, mainEndY)) // 0 if inActive, 1 if active

const branchStartPos = vec2(0, branchStartY)
const growthT = clamp(branchActive.mul(branchGrowthTime), 0.0, 1.0)

const branchedX = mix(0.0, 0.8, growthT) // For X, we want it to move from 0 to 0.8
const branchedY = mix(branchStartY, 0.3, growthT) // For Y, we want it to move downward from 0.5 to say 0.3
const branchEndPos = vec2(branchedX, branchedY)

const firstBranch = sdfSegment({
  p: pixelCoords,
  a: branchStartPos,
  b: branchEndPos
}).sub(thickness)

const tree = select(
  branchActive.greaterThan(0.5),
  opUnion({ a: mainBranch, b: firstBranch }),
  mainBranch
)
const d = opDifference({ a: tree, b: circle })

let allShapes = mix(RED.mul(0.5), WHITE, smoothstep(0.0, 0.001, d))
let mixShapes = mix(BLUE, allShapes, smoothstep(-0.09, 0.001, d))

material.colorNode = mixShapes

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const GrowPathMesh = new THREE.Mesh(geometry, material)

export default GrowPathMesh
