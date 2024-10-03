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
  Fn
} from 'three/tsl'
import { simplexNoise3d } from './simplexNoise3d.js'

const material = new MeshBasicNodeMaterial()
const tint = uniform(color('#ff6088'))

const textureLoader = new THREE.TextureLoader()
const lanscapeText = textureLoader.load(
  './textures/landscape.jpg',
  landscapeTexture => {
    landscapeTexture.wrapS = THREE.RepeatWrapping
    landscapeTexture.wrapT = THREE.RepeatWrapping
    landscapeTexture.colorSpace = THREE.SRGBColorSpace
    // landscapeTexture.anisotropy = 8
  }
)
const alphaText = textureLoader.load('./textures/alpha.jpg')

// Texture Practice
const uvScaled = uv().mul(1).toVar()
const colorTexture = texture(lanscapeText, uvScaled)
const alphaTexture = texture(alphaText)
const tintColor = vec4(tint, 1.0)
//material.colorNode = colorTexture

// Step, Mix, Smoothstep Practice
const red = vec3(1, 0, 0)
const green = vec3(0, 1, 0)
const blue = vec3(0, 0, 1)
const white = vec3(1, 1, 1)
const stepColor = vec3(step(0.5, uvScaled.x))
const mixColor = mix(red, green, uvScaled.x)

const line1 = smoothstep(0.0, 0.005, abs(uvScaled.y.sub(0.5)))
material.colorNode = vec4(vec3(line1), 1.0)

const limitColor = Fn(({ uv }) => {
  const limit = 0.5

  // Convert to variable using `.toVar()` to be able to use assignments.
  const colorResult = vec3(1, 0, 0).toVar()
  If(uv.y.greaterThan(limit), () => {
    colorResult.assign(mix(red, green, uv.y))
  })

  return colorResult.toVec3()
})

const colour = limitColor({ uv: uvScaled })
material.colorNode = mix(white, colour, line1)
// add the line to the material
material.fragmentNode = vec4(vec3(line1), 1.0)

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const textureMesh = new THREE.Mesh(geometry, material)

export default textureMesh
