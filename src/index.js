import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { WebGPURenderer } from 'three/webgpu'
import {
  GRID_SIZE,
  LightBrightMesh,
  selectedTexture
} from './radianceCascade/LightBright.js'
import { probeGridRT, probeGridScene } from './radianceCascade/cascade.js'

// Scene, Camera, Renderer
const scene = new THREE.Scene()
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const aspect = window.innerWidth / window.innerHeight
const frustumHeight = 1
const frustumWidth = frustumHeight * aspect

const camera = new THREE.OrthographicCamera(
  frustumWidth / -2,
  frustumWidth / 2,
  frustumHeight / 2,
  frustumHeight / -2,
  0.1,
  1000
)

camera.position.set(0, 0, 1)

const canvas = document.querySelector('canvas.canvas')

const renderer = new WebGPURenderer({
  canvas: canvas,
  alpha: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#19191f')

scene.add(LightBrightMesh)

// Controls
const cameraControls = new OrbitControls(camera, canvas)
cameraControls.enableDamping = true

// Animation Loop
function animate () {
  cameraControls.update()

  window.requestAnimationFrame(animate)

  renderer.setRenderTarget(probeGridRT)
  renderer.renderAsync(probeGridScene, camera)
  renderer.setRenderTarget(null)

  renderer.renderAsync(scene, camera)
}

animate()
selectCells()

window.addEventListener('resize', () => {
  const dpr = window.devicePixelRatio
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  const w = canvas.clientWidth
  const h = canvas.clientHeight

  renderer.setSize(w * dpr, h * dpr, false)
})

// Track dragging state
let isDragging = false
let lastHitIndex = -1
let holdingShift = false

// Toggle light via raycasting
function toggleLight (event) {
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObject(LightBrightMesh)
  if (intersects.length > 0) {
    const uv = intersects[0].uv

    const stX = uv.x * GRID_SIZE
    const stY = uv.y * GRID_SIZE
    const s = Math.sqrt(3) / 2 // TODO: Fix index bug

    let row = Math.floor(stY / s)
    const parity = row % 2
    let col = Math.floor(stX - parity * 0.5)

    const data = selectedTexture.image.data
    const index = 4 * (col + row * GRID_SIZE)

    if (index === lastHitIndex) {
      return
    }

    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)

    data[index + 0] = r
    data[index + 1] = g
    data[index + 2] = b

    data[index + 3] = data[index + 3] = holdingShift ? 0 : 255
    selectedTexture.needsUpdate = true

    lastHitIndex = index
  }
}

// For debugging purposes, hardcode some cells to be selected
function selectCells () {
  const data = selectedTexture.image.data
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    // Randomly select some cells
    if (Math.random() < 0.1) {
      const index = 4 * i
      data[index + 0] = Math.floor(Math.random() * 256)
      data[index + 1] = Math.floor(Math.random() * 256)
      data[index + 2] = 255
      data[index + 3] = 255
    }
  }
  selectedTexture.needsUpdate = true
}

// Update mouse position for raycasting
function updateMousePosition (event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function onPointerDown (event) {
  isDragging = true
  updateMousePosition(event)
  toggleLight()
}

function onPointerMove (event) {
  if (isDragging) {
    updateMousePosition(event)
    toggleLight()
  }
}

function onPointerUp () {
  isDragging = false
}

function onKeyDown (event) {
  if (event.key === 'Shift') {
    holdingShift = true
  }
}

function onKeyUp (event) {
  if (event.key === 'Shift') {
    holdingShift = false
  }
}

window.addEventListener('pointerdown', onPointerDown)
window.addEventListener('pointermove', onPointerMove)
window.addEventListener('pointerup', onPointerUp)
window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
