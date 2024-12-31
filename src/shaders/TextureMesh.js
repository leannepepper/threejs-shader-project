import * as THREE from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { uniform, color, vec4, uv, texture } from 'three/tsl'

const material = new MeshBasicNodeMaterial()
const tint = uniform(color('#ff6088'))

const textureLoader = new THREE.TextureLoader()
const lanscapeText = textureLoader.load(
  './textures/landscape.jpg',
  landscapeTexture => {
    landscapeTexture.wrapS = THREE.RepeatWrapping
    landscapeTexture.wrapT = THREE.RepeatWrapping
    landscapeTexture.colorSpace = THREE.SRGBColorSpace
    landscapeTexture.anisotropy = 8
  }
)
const alphaText = textureLoader.load('./textures/alpha.jpg')

// Texture Practice
const uvScaled = uv().mul(1).toVar()
const colorTexture = texture(lanscapeText, uvScaled)
const alphaTexture = texture(alphaText)
const tintColor = vec4(tint, 1.0)

material.colorNode = colorTexture.mul(tintColor).mul(alphaTexture)

const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const textureMesh = new THREE.Mesh(geometry, material)

export default textureMesh
