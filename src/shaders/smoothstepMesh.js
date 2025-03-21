import * as THREE from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import {
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

const material = new MeshBasicNodeMaterial()

const uvScaled = uv().mul(1).toVar()

// Step, Mix, Smoothstep Practice
const red = vec3(1, 0, 0)
const green = vec3(0, 1, 0)
const blue = vec3(0, 0, 1)
const white = vec3(1, 1, 1)
const stepColor = vec3(step(0.5, uvScaled.x))
const mixColor = mix(red, green, uvScaled.y)

const value1 = uvScaled.x
const value2 = smoothstep(0.0, 1.0, uvScaled.x)

const line1 = smoothstep(0.0, 0.005, abs(uvScaled.y.sub(0.5)))
const linearLine = smoothstep(
  0.0,
  0.0075,
  abs(uvScaled.y.sub(mix(0.5, 1.0, value1)))
)
const smoothLine = smoothstep(
  0.0,
  0.0075,
  abs(uvScaled.y.sub(mix(0.0, 0.5, value2)))
)

material.colorNode = vec4(vec3(line1), 1.0)

const limitColor = Fn(({ uv }) => {
  const limit = 0.5

  // Convert to variable using `.toVar()` to be able to use assignments.
  const colorResult = white.toVar()
  If(uv.y.greaterThan(limit), () => {
    colorResult.assign(mix(red, blue, uv.x))
  }).ElseIf(uv.y.lessThan(limit), () => {
    colorResult.assign(mix(red, blue, smoothstep(0.0, 1.0, uv.x)))
  })

  return colorResult.toVec3()
})

let colour = limitColor({ uv: uvScaled })
colour = mix(white, colour, line1)
colour = mix(white, colour, linearLine)
colour = mix(white, colour, smoothLine)

material.colorNode = colour

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const smoothstepShaderMesh = new THREE.Mesh(geometry, material)

export default smoothstepShaderMesh
