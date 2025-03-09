import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { afterImage } from 'three/addons/tsl/display/AfterImageNode.js'
import { pass, convertToTexture } from 'three/tsl'
import { PostProcessing, WebGPURenderer } from 'three/webgpu'
import { probeGridQuad } from './radianceCascade/cascade.js'
import { GRID_SIZE, selectedTexture } from './radianceCascade/constants.js'
import { LightBrightMesh } from './radianceCascade/LightBright.js'
import { lightingPass } from './radianceCascade/lightingPass.js'
import { colorPicker, colors } from './radianceCascade/ColorPicker.js'
import { flowers } from './radianceCascade/constants.js'

let isDragging = false
let lastHitIndex = -1
let holdingShift = false
let holdingCommand = false
let allSelected = []

let camera, scene, renderer
let postProcessing

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let selectedColor = colors.orange

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
  scene.add(colorPicker)

  // Post Processing
  postProcessing = new PostProcessing(renderer)
  const scenePass = pass(scene, camera)
  const scenePassColor = scenePass.getTextureNode()

  let combinedPass = scenePassColor
  combinedPass = lightingPass(combinedPass, 0.8)

  postProcessing.outputNode = combinedPass

  // draw image
  for (const flower of flowers) {
    updateColor(flower.index, new THREE.Color(flower.color))
  }
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function render (time) {
  postProcessing.render()
}

// Toggle light via raycasting
function toggleLight () {
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects([LightBrightMesh])

  if (intersects.length > 0) {
    const uv = intersects[0].uv

    const stX = uv.x * GRID_SIZE
    const stY = uv.y * GRID_SIZE
    const s = Math.sqrt(3) / 2 // TODO: Fix index bug

    let row = Math.floor(stY / s)
    const parity = row % 2
    let col = Math.floor(stX - parity * 0.5)

    const index = 4 * (col + row * GRID_SIZE)
    if (index === lastHitIndex) {
      return
    }

    updateColor(index, selectedColor)

    lastHitIndex = index
  }
}

// update color
function updateColor (index, color) {
  const data = selectedTexture.image.data
  const convertedColor = new THREE.Color(color)

  data[index + 0] = convertedColor.r * 255
  data[index + 1] = convertedColor.g * 255
  data[index + 2] = convertedColor.b * 255
  data[index + 3] = holdingShift ? 0 : 255

  selectedTexture.needsUpdate = true

  if (!holdingShift) {
    const selectedHex = convertedColor.getHexString()

    const selectedKey = Object.entries(colors).find(
      ([key, value]) => value.replace('#', '') === selectedHex
    )?.[0]

    allSelected.push({ index, color: selectedKey })
  } else if (holdingShift) {
    allSelected = allSelected.filter(({ index: i }) => i !== index)
  }
}

// Update mouse position for raycasting
function updateMousePosition (event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function changeSelectColor () {
  raycaster.setFromCamera(pointer, camera)
  if (!colorPicker.visible) {
    return
  }
  const intersects = raycaster.intersectObjects([colorPicker])

  if (intersects.length > 0 && colorPicker?.visible) {
    const colorName = intersects[0].object.userData.color
    if (colorName) {
      selectedColor = colorName
    }
  }
}

function onPointerDown (event) {
  isDragging = true
  updateMousePosition(event)
  toggleLight()
  changeSelectColor()
}

function onPointerMove (event) {
  updateMousePosition(event)
  if (isDragging) {
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
  if (event.key === 'Meta') {
    holdingCommand = true

    const colorP = scene.getObjectByName('colorPicker')
    if (colorP) {
      colorP.visible = true
    }
  }
}

function onKeyUp (event) {
  holdingShift = false
  holdingCommand = false
  const colorP = scene.getObjectByName('colorPicker')
  if (colorP) {
    colorP.visible = false
  }
}

function onMouseMove (event) {
  updateMousePosition(event)
  const colorP = scene.getObjectByName('colorPicker')
  if (colorP.visible) {
    return
  }
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObject(LightBrightMesh)
  const colorPicker = scene.getObjectByName('colorPicker')

  if (intersects.length > 0 && colorPicker) {
    const point = intersects[0].point
    colorPicker.position.set(point.x, point.y, 0.1)
  }
}

window.addEventListener('pointerdown', onPointerDown)
window.addEventListener('pointermove', onPointerMove)
window.addEventListener('mousemove', onMouseMove)
window.addEventListener('pointerup', onPointerUp)
window.addEventListener('keydown', onKeyDown)
window.addEventListener('resize', onWindowResize)
window.addEventListener('keyup', onKeyUp)
