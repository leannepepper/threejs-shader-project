import * as THREE from 'three'
import {
  color,
  float,
  floor,
  length,
  mix,
  mod,
  smoothstep,
  texture,
  uv,
  vec2,
  vec3
} from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { probeGridRT } from './cascade.js'
export const GRID_SIZE = 30.0

/** Set up data texture to hold selected state information */
const data = new Uint8Array(GRID_SIZE * GRID_SIZE * 4)
export const selectedTexture = new THREE.DataTexture(
  data,
  GRID_SIZE,
  GRID_SIZE,
  THREE.RGBAFormat
)
selectedTexture.needsUpdate = true

/** Create Mesh with Honeycomb Grid and Lights */
const material = new MeshBasicNodeMaterial()

const shapeColor = color('#19191f')
const black = color('#000000')

const uvVar = uv()
const st = vec2(uvVar.mul(GRID_SIZE))

const sqrt3 = float(Math.sqrt(3))
const s = sqrt3.div(2.0) // TODO: Fix index bug

const rowIndex = floor(st.y.div(s))
const parity = mod(rowIndex, float(2.0))
const colIndex = floor(st.x.sub(parity.mul(0.5)))

const centerX = colIndex.add(parity.mul(0.5)).add(0.5)
const centerY = rowIndex.mul(s).add(s.mul(0.5))
const centerCell = vec2(centerX, centerY)

const diff = st.sub(centerCell)
const dist = length(diff)

const circleMask = smoothstep(0.0, 0.05, float(0.4).sub(dist))

const u = colIndex.add(0.5).div(float(GRID_SIZE))
const v = rowIndex.add(0.5).div(float(GRID_SIZE))

const texSample = texture(selectedTexture, vec2(u, v))
const isSelected = texSample.a // use alpha channel to store selected state
const randomColor = texSample.rgb

const baseColor = mix(black, shapeColor, circleMask)
const selectedColor = mix(baseColor, randomColor, isSelected)
const lightBrightColor = mix(baseColor, selectedColor, circleMask)

// what's in the probeGridRT?
const probeGridTexture = texture(probeGridRT.texture, vec2(u, v))
const probeGridColor = vec3(
  probeGridTexture.r,
  probeGridTexture.g,
  probeGridTexture.b
)

// color the cell based on the probeGridRT intensity
const finalColor = mix(lightBrightColor, probeGridColor, 0.5)

material.colorNode = finalColor

const geometry = new THREE.PlaneGeometry(2, 2)
export const LightBrightMesh = new THREE.Mesh(geometry, material)
//LightBrightMesh.position.set(0.5, 0.5, 0)
