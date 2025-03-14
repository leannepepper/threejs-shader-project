import * as THREE from 'three'

// 6 color entries:
export const colors = {
  orange: '#ff3901',
  cyan: '#0fffff',
  green: '#5cb000',
  pink: '#ff8a85',
  yellow: '#fefc2e',
  red: '#ff9200'
}

export const colorPicker = new THREE.Group()
colorPicker.name = 'colorPicker'
colorPicker.visible = false

// --- Parameters ---
const circleCount = Object.keys(colors).length // 6
const circleRadius = 0.06 // Distance from center for outer circles
const circleSize = 0.02 // Radius of each color circle
const segments = 32 // Smoothness of circle geometry

// --- Create Outer Circles in a Ring ---
const colorKeys = Object.keys(colors)
for (let i = 0; i < circleCount; i++) {
  const colorKey = colorKeys[i]
  const colorValue = colors[colorKey]

  // Angle in radians for this circle
  const angle = (i / circleCount) * Math.PI * 2.0

  // Convert polar to Cartesian
  const x = Math.cos(angle) * circleRadius
  const y = Math.sin(angle) * circleRadius

  // Create a circle geometry for each color
  const geometry = new THREE.CircleGeometry(circleSize, segments)
  const material = new THREE.MeshBasicMaterial({
    color: colorValue,
    side: THREE.DoubleSide
  })

  const circleMesh = new THREE.Mesh(geometry, material)
  circleMesh.position.set(x, y, 0)
  circleMesh.userData.color = colorValue
  circleMesh.name = colorValue.toString(16)

  colorPicker.add(circleMesh)
}

// --- Create Center Circle (for slash or “no color”) ---
const centerGeometry = new THREE.CircleGeometry(circleSize, segments)
const centerMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, // White center
  side: THREE.DoubleSide
})
const centerCircle = new THREE.Mesh(centerGeometry, centerMaterial)
centerCircle.position.set(0, 0, 0)
centerCircle.userData.color = '#ffffff'
centerCircle.name = 'centerCircle'
colorPicker.add(centerCircle)

// --- Create Slash Over the Center Circle ---
// Here we’ll just use a thin, rotated PlaneGeometry as the slash.
// Adjust width/height to your preference.
const slashGeometry = new THREE.PlaneGeometry(
  circleSize * 1.9,
  circleSize * 0.2
)
const slashMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Red slash
const slash = new THREE.Mesh(slashGeometry, slashMaterial)
slash.rotation.z = Math.PI * 0.25 // 45° rotation for diagonal slash
centerCircle.add(slash)

// Position the entire picker group if desired
colorPicker.position.set(0, 0, 0)
