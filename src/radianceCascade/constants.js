import * as THREE from 'three'

export const GRID_SIZE = 30.0

const data = new Uint8Array(GRID_SIZE * GRID_SIZE * 4)
export const selectedTexture = new THREE.DataTexture(
  data,
  GRID_SIZE,
  GRID_SIZE,
  THREE.RGBAFormat
)
selectedTexture.needsUpdate = true
