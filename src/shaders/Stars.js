import * as THREE from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import {
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
  fract,
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
  pow
} from 'three/tsl'
import { simplexNoise3d } from '../utils/simplexNoise3d.js'

const material = new MeshBasicNodeMaterial()
const pixelCoords = uv()
  .sub(vec2(0.5))
  .mul(window.innerWidth / window.innerHeight)

const GenerateStars = Fn(({ pixelCoords: pixelCoords }) => {
  const cellWidth = 3.0
  const cellCoords = fract(pixelCoords.mul(cellWidth)).sub(0.5).mul(cellWidth)

  const distToStar = length(cellCoords)
  const starRadius = 0.1
  const glow = smoothstep(starRadius, starRadius + 0.1, distToStar)
  return vec3(glow)
})
const starColor = GenerateStars({ pixelCoords: pixelCoords })

material.fragmentNode = vec4(pow(starColor, vec3(1.0 / 2.2)), 1.0)

const geometry = new THREE.PlaneGeometry(10, 10, 1000, 1000)
const starsMesh = new THREE.Mesh(geometry, material)

export default starsMesh
