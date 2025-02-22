import {
  Break,
  float,
  Fn,
  If,
  Loop,
  texture,
  vec2,
  vec3,
  vec4,
  uv,
  floor,
  mod,
  length,
  smoothstep
} from 'three/tsl'
import { GRID_SIZE, selectedTexture } from './constants.js'

/**
 * Calculate the selected state of the grid at the current position
 * @param {vec2} pos
 * @returns {vec4} color and dist
 */
const calculateSelectedTextLookup = Fn(({ pos, text, uvNode }) => {
  const currentShapeDist = float(0.0).toVar()
  const colorForShapes = vec3(0.0).toVar()
  const uvVar = uv()
  const st = vec2(uvVar.mul(GRID_SIZE))

  const sqrt3 = float(Math.sqrt(3))
  const s = sqrt3.div(2.0) // TODO: Fix index bug

  const rowIndex = floor(st.y.div(s))
  const parity = mod(rowIndex, float(2.0))
  const colIndex = floor(st.x.sub(parity.mul(0.5)))

  const centerX = colIndex.add(parity.mul(0.5)).add(0.5)
  const centerY = rowIndex.mul(s).add(s.mul(0.5))
  const centerCell = vec2(centerX, centerY)

  const diff = st.sub(centerCell)
  const dist = length(diff)

  const circleMask = smoothstep(0.0, 0.05, float(0.4).sub(dist))

  const u = colIndex.add(0.5).div(float(GRID_SIZE))
  const v = rowIndex.add(0.5).div(float(GRID_SIZE))

  // Use the selectedTexture to look up the state of the grid at the current position
  const sampleTexture = uv => text.sample(uv)
  const uvPos = pos.div(GRID_SIZE) // Convert to [0,1] UV space
  const texSample = vec4(sampleTexture(vec2(u, v)))

  const isSelected = texSample.a // use alpha channel to store selected state
  const cellColor = texSample.rgb

  // Set the color and dist based on the selected state
  If(isSelected.greaterThan(0.5), () => {
    colorForShapes.assign(vec3(cellColor.r, cellColor.g, cellColor.b))
    currentShapeDist.assign(0.0) // Selected
  }).Else(() => {
    colorForShapes.assign(vec3(1.0, 0.0, 0.0)) // Black
    currentShapeDist.assign(1.0) // Not selected
  })

  // I'm unsure how to return both color and dist so return a vec4 with color as x.y.z and dist as w
  const allData = vec4(colorForShapes, currentShapeDist).toVar()

  return allData
})

/**
 * Raymarch function, does the sphere tracing for the world
 * @param {vec2} cameraOrigin
 * @param {vec2} cameraDirection
 * @returns {vec3} color of the pixel
 */
const Raymarch = Fn(({ cameraOrigin, cameraDirection, text, uvNode }) => {
  const NUM_STEPS = 64
  const MAX_DIST = 10.0
  const pos = vec2(0.0).toVar()
  const dist = float(0.0).toVar()

  let exitColor = vec3(1.0, 1.0, 1.0).toVar() // Default color

  Loop({ type: 'int', start: 0, end: NUM_STEPS, condition: '<' }, () => {
    pos.assign(cameraOrigin.add(cameraDirection.mul(dist))) // calculate the current position along the ray
    const materialData = calculateSelectedTextLookup({
      pos: pos,
      uvNode: uvNode,
      text: text
    })

    const distToScene = materialData.w

    // Case 1: distToScene < 0, we hit the scene
    If(distToScene.lessThan(0.0001), () => {
      exitColor.assign(vec3(materialData.xyz).toVar())
      Break()
    })

    dist.assign(dist.add(distToScene.mul(0.5)))
    exitColor.assign(vec3(materialData.xyz).toVar())

    // Case 2: dist > MAX_DIST, we missed the scene
    If(dist.greaterThan(MAX_DIST), () => {
      exitColor.assign(vec3(0.0, 0.0, 0.0)) // Miss color
      Break()
    })

    // Case 3: We haven't hit the scene yet, continue
  })

  // -- Eventually this will calculate the radiance value for the pixel

  return exitColor
})

export default Raymarch
