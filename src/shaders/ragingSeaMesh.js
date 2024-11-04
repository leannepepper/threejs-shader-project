import * as THREE from 'three'
import {
  MeshBasicNodeMaterial,
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
  sin
} from 'three/tsl'
import { simplexNoise3d } from '../utils/simplexNoise3d.js'

/** TSL START */
const material = new MeshBasicNodeMaterial()

const colorDepth = uniform(color('#ff6088'))
const colorSurface = uniform(color('#151c99'))
const colorMixBottom = uniform(-0.35)
const colorMixTop = uniform(0.2)
const bigWavesFrequency = uniform(vec2(3, 1))
const bigWavesSpeed = uniform(0.75)
const bigWavesMultiplier = uniform(0.15)
const smallIterations = 4
const smallWavesFrequency = uniform(2)
const smallWavesSpeed = uniform(0.2)
const smallWavesMultiplier = uniform(0.08)

const modelPosition = modelWorldMatrix.mul(vec4(positionLocal, 1))
const time = timerLocal()
let elevation = mul(
  sin(modelPosition.x.mul(bigWavesFrequency.x).add(time.mul(bigWavesSpeed))),
  sin(modelPosition.z.mul(bigWavesFrequency.y).add(time.mul(bigWavesSpeed)))
)

elevation = elevation.mul(bigWavesMultiplier)

for (let i = 1; i <= smallIterations; i++) {
  const noiseInput = vec3(
    modelPosition.xz.mul(smallWavesFrequency.mul(i)),
    time.mul(smallWavesSpeed)
  )

  const wave = simplexNoise3d(noiseInput).mul(smallWavesMultiplier.div(i)).abs()

  elevation = elevation.sub(wave)
}

material.positionNode = positionLocal.add(vec3(0, elevation, 0))

const colorMix = smoothstep(colorMixBottom, colorMixTop, elevation)
let finalColor = mix(colorDepth, colorSurface, colorMix)
finalColor = varying(finalColor)
material.colorNode = vec4(finalColor, 1)

const geometry = new THREE.PlaneGeometry(2, 2, 512, 512)
geometry.rotateX(-Math.PI * 0.5)
const ragingSeaMesh = new THREE.Mesh(geometry, material)

export default ragingSeaMesh
