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
  screenCoordinate,
  fract,
  max,
  float,
  dFdx,
  dFdy,
  remap,
  saturate,
  Discard,
  Break,
  normalize,
  Return,
  Loop
} from 'three/tsl'
import { inverseLerp } from '../utils/inverseLerp.js'

const material = new MeshBasicNodeMaterial()
const resolution = vec2(window.innerWidth, window.innerHeight)
const pixelCoords = uv()
  .sub(vec2(0.5))
  .mul(window.innerWidth / window.innerHeight)

/** SDF Sphere */
const sdfSphere = Fn(({ pos, r }) => {
  return float(length(pos).sub(r))
})

/**
 * commonly called the 'map' function in other examples
 * @param {vec3} pos
 * @returns {float}
 */
const calculateSceneSDF = Fn(({ pos }) => {
  const dist = sdfSphere({ pos: pos.sub(vec3(0.0, 0.0, 4.0)), r: 1.0 })
  return dist
})

/**
 * Raymarch function, does the sphere tracing for the world
 * @param {vec3} cameraOrigin
 * @param {vec3} cameraDirection
 * @returns {vec3} color of the pixel
 */
const Raymarch = Fn(({ cameraOrigin, cameraDirection }) => {
  const NUM_STEPS = 256
  const MAX_DIST = 1000.0
  const pos = vec3(0.0).toVar()
  const dist = float(0.0).toVar()

  let exitColor = vec3(1.0, 1.0, 1.0).toVar() // Default color

  Loop({ type: 'int', start: 0, end: NUM_STEPS, condition: '<' }, () => {
    pos.assign(cameraOrigin.add(cameraDirection.mul(dist))) // calculate the current position along the ray
    const distToScene = calculateSceneSDF({ pos: pos })

    If(distToScene.lessThan(0.0001), () => {
      Break()
    })

    dist.assign(dist.add(distToScene))

    If(dist.greaterThan(MAX_DIST), () => {
      exitColor.assign(vec3(0.0, 0.0, 0.0)) // Miss color
      Break()
    })
  })

  return exitColor
})

const cameraOrigin = vec3(0.0, 0.0, 0.0)
const cameraDirection = normalize(vec3(pixelCoords, float(1.0)))

material.colorNode = Raymarch({
  cameraOrigin: cameraOrigin,
  cameraDirection: cameraDirection
})

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const RaymarchMesh = new THREE.Mesh(geometry, material)

export default RaymarchMesh
