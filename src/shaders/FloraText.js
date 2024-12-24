import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
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
  sin,
  normalize,
  sqrt,
  abs
} from 'three/tsl'
import { simplexNoise3d } from '../utils/simplexNoise3d.js'
const BLUE = vec3(0.0, 0.0, 1.0)
const RED = vec3(1.0, 0.0, 0.0)
const WHITE = vec3(1.0, 0.9, 0.9)

// Easing Functions
const easeOutCubic = Fn(({ t }) => {
  return float(1.0).sub(pow(float(1.0).sub(t), 3.0))
})

//SDF Segment
const sdfSegment = Fn(({ p, a, b }) => {
  const pa = p.sub(a)
  const ba = b.sub(a)
  const h = clamp(dot(pa, ba).div(dot(ba, ba)), 0.0, 1.0)
  return length(pa.sub(ba.mul(h)))
})

// Given a set of points, form a polyline and return min distance
const sdfPolyline = Fn(({ p, p0, p1, p2, p3 }) => {
  const d0 = sdfSegment({ p, a: p0, b: p1 })
  const d1 = sdfSegment({ p, a: p1, b: p2 })
  const d2 = sdfSegment({ p, a: p2, b: p3 })
  return min(d0, min(d1, d2))
})

/** Node material setup */
const material = new MeshBasicNodeMaterial()
material.stencilWrite = true // or false if you just want to read
material.stencilRef = 1
material.stencilFunc = THREE.EqualStencilFunc
material.stencilFail = THREE.KeepStencilOp
material.stencilZFail = THREE.KeepStencilOp
material.stencilZPass = THREE.KeepStencilOp

const resolution = window.innerWidth / window.innerHeight
const pixelCoords = uv().sub(vec2(0.5)).mul(resolution).toVar()
const thickness = float(0.1)

//Main Branch
const timer = sin(timerGlobal())
const noiseFactor = simplexNoise3d(vec3(timer.mul(0.5), 1.0, 1.0))
const branchGrowthTime = easeOutCubic({ t: timer })

const mainStartY = float(0.8)
const mainEndY = float(-0.5).sub(branchGrowthTime)
let clampedGrowth = clamp(mainEndY, -1.7, 0.8)

const mainStartPos = vec3(0, mainStartY, 1.0)
const mainEndPos = vec3(0, clampedGrowth, 1.0)

const root = sdfSegment({
  p: vec3(pixelCoords, 1.0),
  a: mainStartPos,
  b: mainEndPos
}).sub(thickness)

material.colorNode = mix(WHITE, RED, smoothstep(0.0, 0.001, root))

/**
 * FONT GEOMETRY
 */
const loader = new FontLoader()
function loadFont (url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
}
const font = await loadFont('./fonts/manrope-regular-normal-200.json')

const config = {
  font,
  size: 8.0,
  height: 0.5,
  curveSegments: 12,
  bevelEnabled: false
}
const geometry = new TextGeometry('Flora', config)
geometry.computeBoundingBox()
const size = new THREE.Vector3()
geometry.boundingBox.getSize(size)
geometry.translate(-size.x / 2, -size.y / 2, -size.z / 2)

/** Text Material setup */
const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
textMaterial.stencilWrite = true
textMaterial.stencilRef = 1
textMaterial.stencilFunc = THREE.AlwaysStencilFunc
textMaterial.stencilFail = THREE.ReplaceStencilOp
textMaterial.stencilZFail = THREE.ReplaceStencilOp
textMaterial.stencilZPass = THREE.ReplaceStencilOp

const FloraTextMesh = new THREE.Mesh(geometry, textMaterial)
const GrowPathMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(25, 10, 250, 250),
  material
)

FloraTextMesh.renderOrder = 0
FloraTextMesh.position.set(0, 0, -1)
GrowPathMesh.renderOrder = 1

export { FloraTextMesh, GrowPathMesh }