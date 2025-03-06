import * as THREE from 'three'

export const colors = {
  orange: '#ff3901',
  cyan: '#0fffff',
  green: '#5cb000',
  pink: '#ff8a85',
  yellow: '#fefc2e',
  red: '#ff9200'
}

export const colorPicker = new THREE.Group()

const squareSize = 0.1
const numColumns = 3
const numRows = 2
const totalWidth = numColumns * squareSize
const totalHeight = numRows * squareSize

const colorKeys = Object.keys(colors)
for (let i = 0; i < colorKeys.length; i++) {
  const colorKey = colorKeys[i]
  const colorValue = colors[colorKey]
  const geometry = new THREE.PlaneGeometry(squareSize, squareSize)
  const material = new THREE.MeshBasicMaterial({
    color: colorValue,
    side: THREE.DoubleSide
  })

  const square = new THREE.Mesh(geometry, material)
  square.position.x = (i % 3) * squareSize - totalWidth / 2 + squareSize / 2
  square.position.y =
    Math.floor(i / 3) * -squareSize + totalHeight / 2 - squareSize / 2

  square.userData.color = colorValue
  square.name = colorValue.toString(16)
  colorPicker.add(square)
}

colorPicker.position.set(0, 0, 0)

colorPicker.name = 'colorPicker'
colorPicker.visible = false
