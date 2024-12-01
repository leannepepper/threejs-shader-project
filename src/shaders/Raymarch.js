import * as THREE from 'three'
import {
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  uniform,
  color,
  vec2,
  vec3,
  vec4,
  mat3,
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
  min,
  dot,
  float,
  dFdx,
  dFdy,
  remap,
  saturate,
  Discard,
  Break,
  normalize,
  Return,
  Loop,
  OutputStructNode,
  select
} from 'three/tsl'
import { inverseLerp } from '../utils/inverseLerp.js'

const material = new MeshBasicNodeMaterial()
const resolution = vec2(window.innerWidth, window.innerHeight)
const pixelCoords = uv()
  .sub(vec2(0.5))
  .mul(window.innerWidth / window.innerHeight)

/** Colors */
const RED = vec3(1.0, 0.0, 0.0)
const GREEN = vec3(0.0, 1.0, 0.0)
const BLUE = vec3(0.0, 0.0, 1.0)
const WHITE = vec3(1.0)
const GREY = vec3(0.5)

/** SDF Sphere */
const sdfSphere = Fn(({ pos, r }) => {
  return float(length(pos).sub(r))
})

/** SDF Cube */
const sdfCube = Fn(({ pos, size }) => {
  const q = abs(pos).sub(size)
  return length(max(q, vec3(0.0))).add(min(max(q.x, max(q.y, q.z)), 0.0))
})

/** SDF Plane */
const sdfPlane = Fn(({ pos }) => {
  return float(pos.y)
})

/**
 * commonly called the 'map' function in other examples
 * @param {vec3} pos
 * @returns {{
 * dist: float,
 * color: vec3
 * }}
 */
const calculateSceneSDF = Fn(({ pos }) => {
  const currentShapeDist = float(0.0).toVar()
  const sceneForShapes = float(0.0).toVar()
  const colorForShapes = vec3(0.0).toVar()

  //Plane
  // Rotation matrix to rotate the plane around the X-axis by 90 degrees
  const rotationMatrix = mat3(
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)),
    vec3(0.0, Math.sin(Math.PI / 6), Math.cos(Math.PI / 6))
  )

  // Translate the plane down
  const translatedPos = pos.sub(vec3(0.0, -2.0, 0.0))

  // Apply rotation to the plane's position
  const rotatedPos = mul(rotationMatrix, translatedPos)

  currentShapeDist.assign(
    sdfPlane({
      pos: rotatedPos
    })
  )
  colorForShapes.assign(GREY)
  sceneForShapes.assign(currentShapeDist)

  //cube
  currentShapeDist.assign(
    sdfCube({
      pos: pos.sub(vec3(-2.0, -2.0, 4.0)),
      size: vec3(1.0)
    })
  )
  colorForShapes.assign(
    select(currentShapeDist.lessThan(sceneForShapes), RED, colorForShapes)
  )
  sceneForShapes.assign(min(sceneForShapes, currentShapeDist))

  //sphere
  currentShapeDist.assign(
    sdfCube({
      pos: pos.sub(vec3(2.0, -2.0, 4.0)),
      size: vec3(1.0)
    })
  )
  colorForShapes.assign(
    select(currentShapeDist.lessThan(sceneForShapes), BLUE, colorForShapes)
  )

  sceneForShapes.assign(min(sceneForShapes, currentShapeDist))

  // I'm unsure how to return both color and dist so return a vec4 with color as x.y.z and dist as w
  const allData = vec4(colorForShapes, sceneForShapes).toVar()

  return allData
})

/**
 * Calculate the normals for the sdf shapes
 * @param {vec3} pos
 * @returns {vec3} normal
 */
const calculateNormal = Fn(({ pos }) => {
  const EPS = 0.001
  const normal = vec3(0.0).toVar()
  const x = calculateSceneSDF({ pos: pos.add(vec3(EPS, 0.0, 0.0)) })
    .w.toVar()
    .sub(calculateSceneSDF({ pos: pos.sub(vec3(EPS, 0.0, 0.0)) }).w.toVar()) // remember, w is the distance returned from the SDF

  const y = calculateSceneSDF({ pos: pos.add(vec3(0.0, EPS, 0.0)) })
    .w.toVar()
    .sub(calculateSceneSDF({ pos: pos.sub(vec3(0.0, EPS, 0.0)) }).w.toVar())

  const z = calculateSceneSDF({ pos: pos.add(vec3(0.0, 0.0, EPS)) })
    .w.toVar()
    .sub(calculateSceneSDF({ pos: pos.sub(vec3(0.0, 0.0, EPS)) }).w.toVar())

  normal.assign(normalize(vec3(x, y, z)))

  return normal
})

/**
 * Calculate the lighting for the scene. This is a basic lambertian lighting model
 * @param {vec3} pos
 * @param {vec3} normal
 * @param {vec3} lightColor
 * @param {vec3} lightDirection
 * @returns {vec3} color
 */
const calculateLighting = Fn(({ pos, normal, lightColor, lightDirection }) => {
  const dp = saturate(dot(normal, lightDirection))
  return lightColor.mul(dp)
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
    const materialData = calculateSceneSDF({ pos: pos })

    const distToScene = materialData.w

    // Case 1: distToScene < 0, we hit the scene
    If(distToScene.lessThan(0.0001), () => {
      Break()
    })

    dist.assign(dist.add(distToScene))
    exitColor.assign(vec3(materialData.xyz).toVar())

    // Case 2: dist > MAX_DIST, we missed the scene
    If(dist.greaterThan(MAX_DIST), () => {
      exitColor.assign(vec3(0.0, 0.0, 0.0)) // Miss color
      Break()
    })

    // Case 3: We haven't hit the scene yet, continue
  })

  const normal = calculateNormal({ pos: pos })
  const lightDirection = normalize(vec3(1.0, 2.0, -1.0))
  const lightColor = WHITE
  const lighting = calculateLighting({
    pos: pos,
    normal: normal,
    lightColor: lightColor,
    lightDirection: lightDirection
  })

  return exitColor.mul(lighting)
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
