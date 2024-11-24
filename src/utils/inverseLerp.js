import {
  vec4,
  mod,
  Fn,
  mul,
  sub,
  vec3,
  vec2,
  dot,
  floor,
  step,
  min,
  max,
  float,
  abs
} from 'three/tsl'

const inverseLerp = Fn(({ v, minValue, maxValue }) => {
  return v.sub(minValue).div(maxValue.sub(minValue))
})

export { inverseLerp }
