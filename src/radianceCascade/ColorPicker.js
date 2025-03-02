import * as THREE from 'three'

const colors = [
  '#ff3901',
  '#0fffff',
  '#5cb000',
  '#ff8a85',
  '#fefc2e',
  '#ff9200'
]
export const colorPicker = new THREE.Group()

const squareSize = 0.1
const numColumns = 3
const numRows = 2
const totalWidth = numColumns * squareSize
const totalHeight = numRows * squareSize

for (let i = 0; i < colors.length; i++) {
  const geometry = new THREE.PlaneGeometry(squareSize, squareSize)
  const material = new THREE.MeshBasicMaterial({
    color: colors[i],
    side: THREE.DoubleSide
  })

  const square = new THREE.Mesh(geometry, material)
  square.position.x = (i % 3) * squareSize - totalWidth / 2 + squareSize / 2
  square.position.y =
    Math.floor(i / 3) * -squareSize + totalHeight / 2 - squareSize / 2

  square.userData.color = colors[i]
  square.name = colors[i].toString(16)
  colorPicker.add(square)
}

colorPicker.position.set(0, 0, 0)

colorPicker.name = 'colorPicker'
colorPicker.visible = false
