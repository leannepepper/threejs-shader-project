import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import {
  clamp,
  dot,
  float,
  Fn,
  length,
  max,
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
  abs,
  rand
} from 'three/tsl'
import { simplexNoise3d } from '../utils/simplexNoise3d.js'
const BLUE = vec3(0.0, 0.0, 1.0)
const BG_COLOR = vec3(0.02, 0.02, 0.02) //#19191f
const RED = vec3(1.0, 0.0, 0.0)
const WHITE = vec3(1.0, 0.9, 0.9)

// Op Difference
const opDifference = Fn(({ a, b }) => {
  return max(a.mul(-1.0), b)
})

// Op Union
const opUnion = Fn(({ a, b }) => {
  return min(a, b)
})

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
const sdfPolyline = ({ p, points }) => {
  let distanceNode = sdfSegment({ p, a: points[0], b: points[1] })

  for (let i = 1; i < points.length - 1; i++) {
    const segDist = sdfSegment({ p, a: points[i], b: points[i + 1] })
    distanceNode = min(distanceNode, segDist)
  }

  return distanceNode
}

/** Node material setup */
const material = new MeshBasicNodeMaterial()
material.stencilWrite = true
material.stencilRef = 1
material.stencilFunc = THREE.EqualStencilFunc
material.stencilFail = THREE.KeepStencilOp
material.stencilZFail = THREE.KeepStencilOp
material.stencilZPass = THREE.KeepStencilOp

const resolution = window.innerWidth / window.innerHeight
const pixelCoords = uv().sub(vec2(0.5)).mul(resolution).toVar()
const thickness = float(0.01)

//Main Branch
const timer = timerGlobal()
const noiseFactor = simplexNoise3d(vec3(timer.mul(0.5), 1.0, 1.0))
const branchGrowthTime = easeOutCubic({ t: timer })

const mainStartY = float(1.0)
const mainEndY = float(0.0).sub(branchGrowthTime)
let clampedGrowth = clamp(mainEndY, -1.7, 0.8)

const mainStartPos = vec3(0, mainStartY, 1.0)
const mainEndPos = vec3(0, clampedGrowth, 1.0)

const root = sdfSegment({
  p: vec3(pixelCoords, 1.0),
  a: mainStartPos,
  b: mainEndPos
}).sub(thickness)

/**
 * Randomly Generate Branches
 */

const generateBranches = () => {
  function genBranch () {
    const startX = 0.0
    const startY = 0.5

    // Let each root travel further horizontally, randomly
    const endX = startX + (Math.random() - 0.5) * 1.0

    // Let each root go down by 0.4..0.8 units, so it ends between 0.2..-0.0
    const downwardDist = 0.5 + Math.random() * 0.4
    const endY = startY - downwardDist

    // Convert those JS numbers into TSL nodes:
    const p0 = vec2(float(startX), float(startY))
    const p1 = vec2(
      float((startX + endX) * Math.random()),
      float((startY + endY) * Math.random())
    )
    const p2 = vec2(
      float((startX + endX) * (0.4 + Math.random())),
      float((startY + endY) * (0.4 + Math.random()))
    )
    const p3 = vec2(float(endX * Math.random()), float(endY * Math.random()))

    // Build your TSL node for the polyline
    const branch = sdfPolyline({
      p: pixelCoords,
      points: [p0, p1, p2, p3]
    }).sub(thickness)

    return branch
  }

  const branches = []
  for (let i = 0; i < 10; i++) {
    branches.push(genBranch())
  }

  return branches
}

const mergeAllBranches = ({ root, branches }) => {
  return branches.reduce((acc, branch) => {
    return opUnion({ a: acc, b: branch })
  }, root)
}

const branches = generateBranches()
const roots = mergeAllBranches({ root: root, branches: branches })
material.colorNode = mix(BG_COLOR, WHITE, smoothstep(0.0, 0.001, roots))

/**
 * FONT GEOMETRY
 */
const loader = new FontLoader()
function loadFont (url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
}
const font = await loadFont('./fonts/Assistant/Assistant_Bold.json')

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
