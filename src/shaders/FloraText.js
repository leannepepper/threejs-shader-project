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
  normalize,
  sqrt,
  abs
} from 'three/tsl'
import { simplexNoise3d } from '../utils/simplexNoise3d.js'
const BLUE = vec3(0.0, 0.0, 1.0)
const WHITE = vec3(1.0, 0.9, 0.9)
const material = new MeshBasicNodeMaterial()
material.colorNode = WHITE

const loader = new FontLoader()
function loadFont (url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
}
const font = await loadFont('./fonts/manrope-regular-normal-200.json')

const config = {
  font,
  size: 5.0,
  height: 0.5,
  curveSegments: 12,
  bevelEnabled: false
}

const geometry = new TextGeometry('FLORA', config)
const FloraTextMesh = new THREE.Mesh(geometry, material)

geometry.computeBoundingBox()
const size = new THREE.Vector3()
geometry.boundingBox.getSize(size)
geometry.translate(-size.x / 2, -size.y / 2, -size.z / 2)

export default FloraTextMesh
