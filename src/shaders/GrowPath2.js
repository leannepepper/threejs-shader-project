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
  abs,
  cos,
  sin
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

/**
 * SDF Bezier
 * @param {vec2} p
 * @param {vec2} v0
 * @param {vec2} v1
 * @param {vec2} v2
 * @returns {vec2} outQ
 */
const sdfBezier = Fn(({ p, v0, v1, v2 }) => {
  const i = v0.sub(v2)
  const j = v2.sub(v1)
  const k = v1.sub(v0)
  const w = j.sub(k)

  const v0_1 = v0.sub(p)
  const v1_1 = v1.sub(p)
  const v2_1 = v2.sub(p)

  const x = dot(v0_1, v2_1)
  const y = dot(v1_1, v0_1)
  const z = dot(v2_1, v1_1)

  const s = vec2(2.0)
    .mul(y.mul(j).add(z.mul(k)))
    .sub(x.mul(i))

  const r = y.mul(z).sub(x.mul(x).mul(0.25)).div(dot(s, s))
  const t = clamp(
    float(0.5)
      .mul(x)
      .add(y)
      .add(r.mul(dot(s, w)))
      .div(x.add(y).add(z)),
    0.0,
    1.0
  )

  const d = v0.add(t.mul(k).add(k).add(t.mul(w)))
  return d.add(p)
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
const timer = timerGlobal()
const clampTimer = clamp(timerGlobal(), 0.0, 1.0)

// circle
const circle = sdfCircle({ pos: pixelCoords, r: 1 })

//Bezier Branch
const v0 = vec2(0.25, 0.0)
const v1 = vec2(0.0, 0.0) // control point
const v2 = vec2(0.25, 0.0)

const bezier = sdfBezier({ p: pixelCoords, v0, v1, v2 })

let mixShapes = mix(BLACK, WHITE, smoothstep(0.0, 0.01, bezier))

material.colorNode = mixShapes

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const GrowPathMesh2 = new THREE.Mesh(geometry, material)

export default GrowPathMesh2
