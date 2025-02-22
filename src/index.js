import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { afterImage } from 'three/addons/tsl/display/AfterImageNode.js'
import { pass, convertToTexture } from 'three/tsl'
import { PostProcessing, WebGPURenderer } from 'three/webgpu'
import { probeGridQuad } from './radianceCascade/cascade.js'
import { GRID_SIZE, selectedTexture } from './radianceCascade/constants.js'
import { LightBrightMesh } from './radianceCascade/LightBright.js'
import { lightingPass } from './radianceCascade/lightingPass.js'

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

let camera, scene, renderer
let postProcessing, renderTarget

init()

function init () {
  renderer = new WebGPURenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(render)
  document.body.appendChild(renderer.domElement)

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x222222)

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    50
  )
  camera.position.z = 1

  scene.add(LightBrightMesh)

  // Post Processing
  postProcessing = new PostProcessing(renderer)
  const scenePass = pass(scene, camera)
  const scenePassColor = scenePass.getTextureNode()

  let combinedPass = scenePassColor
  combinedPass = lightingPass(combinedPass, 0.8)

  postProcessing.outputNode = combinedPass

  // Controls
  //new OrbitControls(camera, renderer.domElement)

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function render (time) {
  postProcessing.render()
}

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
