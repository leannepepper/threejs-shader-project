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
  sin,
  uv,
  timerGlobal,
  WebGPURenderer,
  PerspectiveCamera,
  Scene
} from 'three/tsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ragingSeaMesh from './shaders/ragingSeaMesh.js'
import textureMesh from './shaders/TextureMesh.js'
import smoothstepShaderMesh from './shaders/smoothstepMesh.js'
import circleMesh from './shaders/Circle.js'
import gridMesh from './shaders/Grid.js'
import warpedSphereMesh from './shaders/WarpedSphere.js'
import starsMesh from './shaders/Stars.js'

// Scene, Camera, Renderer
const scene = new Scene()
const camera = new PerspectiveCamera(
  15,
  window.innerWidth / window.innerHeight,
  1,
  100
)

// Canvas
const canvas = document.querySelector('canvas.canvas')

const renderer = new WebGPURenderer({
  canvas: canvas,
  antialias: true
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
scene.add(starsMesh)

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

//Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
