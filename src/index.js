import * as THREE from 'three'
import { MeshBasicNodeMaterial, WebGPURenderer } from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ragingSeaMesh from './shaders/ragingSeaMesh.js'
import textureMesh from './shaders/TextureMesh.js'
import smoothstepShaderMesh from './shaders/smoothstepMesh.js'
import circleMesh from './shaders/Circle.js'
import gridMesh from './shaders/Grid.js'
import warpedSphereMesh from './shaders/WarpedSphere.js'
import starsMesh from './shaders/Stars.js'
import RaymarchMesh from './shaders/Raymarch.js'
//import GrowPathMesh from './shaders/GrowPath.js'
import GrowPathMesh2 from './shaders/GrowPath2.js'
import { FloraTextMesh, GrowPathMesh } from './shaders/FloraText.js'
import {
  LightBrightMesh,
  selectedCol,
  selectedRow
} from './shaders/LightBright.js'

// Scene, Camera, Renderer
const scene = new THREE.Scene()
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const camera = new THREE.PerspectiveCamera(
  15,
  window.innerWidth / window.innerHeight,
  1,
  100
)
const canvas = document.querySelector('canvas.canvas')

const renderer = new WebGPURenderer({
  canvas: canvas,
  antialias: true,
  stencil: true,
  alpha: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#19191f')

//scene.add(ragingSeaMesh)
//scene.add(textureMesh)
//scene.add(smoothstepShaderMesh)
//scene.add(circleMesh)
//scene.add(gridMesh)
//scene.add(warpedSphereMesh)
//scene.add(starsMesh)
//scene.add(RaymarchMesh)
//scene.add(GrowPathMesh)
//scene.add(GrowPathMesh2)
//scene.add(FloraTextMesh)
//scene.add(GrowPathMesh)
scene.add(LightBrightMesh)

// Camera
camera.position.z = 75
camera.position.y = 2
camera.lookAt(0, 0, 0)

// Controls
const cameraControls = new OrbitControls(camera, canvas)
cameraControls.enableDamping = true

// Animation Loop
function animate () {
  cameraControls.update()

  window.requestAnimationFrame(animate)
  renderer.renderAsync(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function onPointerDown (event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObject(LightBrightMesh)
  if (intersects.length > 0) {
    const uv = intersects[0].uv

    const stX = uv.x * 20
    const stY = uv.y * 20
    const s = Math.sqrt(3) / 2

    const row = Math.floor(stY / s)
    const parity = row % 2
    const col = Math.floor(stX - parity * 0.5)

    selectedRow.value = row
    selectedCol.value = col
  }
}

window.addEventListener('pointerdown', onPointerDown)
