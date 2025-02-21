import {
  RenderTarget,
  Vector2,
  QuadMesh,
  NodeMaterial,
  RendererUtils,
  TempNode,
  NodeUpdateType
} from 'three/webgpu'
import {
  nodeObject,
  Fn,
  float,
  vec4,
  uv,
  texture,
  passTexture,
  uniform,
  sign,
  max,
  convertToTexture
} from 'three/tsl'

class RadianceCascadeNode extends TempNode {
  static get type () {
    return 'RadianceCascadeNode'
  }

  constructor (textureNode, intensity = 1.0) {
    super('vec4')
    this.textureNode = textureNode
    this.intensity = uniform(intensity)
    this._textureNode = passTexture(this, this.textureNode)
  }

  getTextureNode () {
    return this._textureNode
  }

  setup (builder) {
    const textureNode = this.textureNode
    const sampledColor = vec4(textureNode.sample(uv()))
    const radianceEffect = sampledColor.mul(this.intensity)
    return radianceEffect
  }
}

/**
 * TSL function for creating an radiance cascade node for post processing.
 *
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Number} [intensity=1.0] - The intensity of the radiance effect.
 * @returns {RadianceCascadeNode}
 */
export const lightingPass = (node, intensity) =>
  nodeObject(new RadianceCascadeNode(convertToTexture(node, (intensity = 1.0))))
