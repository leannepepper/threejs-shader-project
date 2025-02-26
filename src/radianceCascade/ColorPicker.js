import * as THREE from 'three'

const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x800080]
export const colorPicker = new THREE.Group()

const squareSize = 0.1
const numColumns = 3
const numRows = 2
const totalWidth = numColumns * squareSize
const totalHeight = numRows * squareSize

for (let i = 0; i < 6; i++) {
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
  colorPicker.add(square)
}

colorPicker.position.set(0, 0, 0)

colorPicker.name = 'colorPicker'
colorPicker.visible = false
