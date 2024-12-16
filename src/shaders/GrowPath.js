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
  vec3,
  pow,
  normalize,
  sqrt,
  abs
} from 'three/tsl'
import { simplexNoise3d } from '../utils/simplexNoise3d.js'

const material = new MeshBasicNodeMaterial()

const uvVar = uv()
const shapeColor = vec3(0.0, 0.0, 0.0)

const RED = vec3(1.0, 0.0, 0.0)
const BLUE = vec3(0.0, 0.0, 1.0)
const WHITE = vec3(1.0, 0.9, 0.9)
const BLACK = vec3(0.0)

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

// SDF Vesica
const sdfVesica = Fn(({ p, r, d }) => {
  p = abs(p)
  const b = sqrt(r.mul(r).sub(d.mul(d)))
  return select(
    p.y.sub(b).mul(d).greaterThan(p.x.mul(b)),
    length(p.sub(vec2(0.0, b))),
    length(p.sub(vec2(float(d).mul(-1), 0.0))).sub(r)
  )
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

// Easing Functions
const easeOutCubic = Fn(({ t }) => {
  return float(1.0).sub(pow(float(1.0).sub(t), 3.0))
})

const resolution = window.innerWidth / window.innerHeight
const pixelCoords = uvVar.sub(vec2(0.5)).mul(resolution).toVar()

// circle
const circle = sdfCircle({ pos: pixelCoords, r: 1 })

//Main Branch
const timer = clamp(timerGlobal(), 0.0, 1.0)
const thickness = float(0.01)
const noiseFactor = simplexNoise3d(vec3(timer.mul(2.0), 1.0, 1.0))
const branchGrowthTime = easeOutCubic({ t: timer })

const mainStartY = float(0.8)
const mainEndY = float(0.8).sub(branchGrowthTime)
let clampedGrowth = clamp(mainEndY, -0.7, 0.8)

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

const branchedX = mix(0.0, 0.3, growthT) // For X, we want it to move from 0 to 0.8
const branchedY = mix(branchStartY, -0.1, growthT) // For Y, we want it to move downward from 0.5 to say 0.3
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

let mixShapes = mix(BLACK, WHITE, smoothstep(0.0, 0.001, d))

material.colorNode = mixShapes

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const GrowPathMesh = new THREE.Mesh(geometry, material)

export default GrowPathMesh
