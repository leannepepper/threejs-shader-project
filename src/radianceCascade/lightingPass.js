import {
  convertToTexture,
  cos,
  float,
  floor,
  mix,
  nodeObject,
  passTexture,
  sin,
  uniform,
  uv,
  mod,
  vec2,
  vec3,
  vec4,
  texture,
  Fn,
  max,
  sign,
  fract,
  smoothstep,
  clamp,
  dot,
  length,
  If,
  Loop,
  Break,
  Else
} from 'three/tsl'
import {
  RenderTarget,
  Vector2,
  QuadMesh,
  NodeMaterial,
  RendererUtils,
  TempNode,
  NodeUpdateType
} from 'three/webgpu'
import { GRID_SIZE, selectedTexture } from './constants.js'
import Raymarch from './raymarch.js'
import { color } from 'three/tsl'

/** @module RadianceCascadeNode **/

const _size = /*@__PURE__*/ new Vector2()
const _quadMeshComp = /*@__PURE__*/ new QuadMesh()

let _rendererState
class RadianceCascadeNode extends TempNode {
  static get type () {
    return 'RadianceCascadeNode'
  }

  constructor (textureNode, intensity = 0.96) {
    super('vec4')
    this.textureNode = textureNode
    this.textureNodeOld = texture()
    this.intensity = uniform(intensity)

    this._compRT = new RenderTarget(1, 1, { depthBuffer: false })
    this._compRT.texture.name = 'RadianceCascadeNode.comp'

    this._oldRT = new RenderTarget(1, 1, { depthBuffer: false })
    this._oldRT.texture.name = 'RadianceCascadeNode.old'

    this._textureNode = passTexture(this, this._compRT.texture)

    this.updateBeforeType = NodeUpdateType.FRAME
    this.selectedTexture = uniform(selectedTexture)
  }

  getTextureNode () {
    return this._textureNode
  }

  setSize (width, height) {
    this._compRT.setSize(width, height)
    this._oldRT.setSize(width, height)
  }

  /**
   * This method is used to render the effect once per frame.
   * @param {NodeFrame} frame - The current node frame.
   */
  updateBefore (frame) {
    const { renderer } = frame

    _rendererState = RendererUtils.resetRendererState(renderer, _rendererState)

    const textureNode = this.textureNode
    const map = textureNode.value

    const textureType = map.type

    this._compRT.texture.type = textureType
    this._oldRT.texture.type = textureType

    renderer.getDrawingBufferSize(_size)

    this.setSize(_size.x, _size.y)

    const currentTexture = textureNode.value

    this.textureNodeOld.value = this._oldRT.texture

    renderer.setRenderTarget(this._compRT)
    _quadMeshComp.render(renderer)

    const temp = this._oldRT
    this._oldRT = this._compRT
    this._compRT = temp

    textureNode.value = currentTexture

    RendererUtils.restoreRendererState(renderer, _rendererState)
  }

  /**
   * This method is used to setup the effect's TSL code.
   *
   * @param {NodeBuilder} builder - The current node builder.
   * @return {PassTextureNode}
   */
  setup (builder) {
    const textureNode = this.textureNode
    const uvNode = textureNode.uvNode || uv()

    const sampleTexture = uv => textureNode.sample(uv)

    const cascade = Fn(() => {
      const colorForShapes = vec3(0.0).toVar()
      const texelNew = vec4(sampleTexture(uvNode))

      // Check if pixel is selected
      const isSelected = texelNew.a
      const cellColor = texelNew.rgb

      // Bloom Settings
      const bloomFactor = float(0.5) // **Lower intensity to prevent artifacts**
      const aspectRatio = float(window.innerWidth / window.innerHeight)
      const bloomOffset = vec2(float(0.003), float(0.005))

      If(isSelected.greaterThan(0.5), () => {
        // Sample neighboring pixels to create a soft glow effect
        const texelLeft = sampleTexture(
          uvNode.sub(vec2(bloomOffset.x, 0.0))
        ).rgb
        const texelRight = sampleTexture(
          uvNode.add(vec2(bloomOffset.x, 0.0))
        ).rgb
        const texelUp = sampleTexture(uvNode.add(vec2(0.0, bloomOffset.y))).rgb
        const texelDown = sampleTexture(
          uvNode.sub(vec2(0.0, bloomOffset.y))
        ).rgb

        // Average neighboring colors
        const glowColor = texelLeft
          .add(texelRight)
          .add(texelUp)
          .add(texelDown)
          .div(float(4.0))

        // Blend glow with original color using smoothstep for soft falloff
        const bloomEffect = mix(
          cellColor,
          glowColor,
          smoothstep(0.0, 1.0, bloomFactor)
        )

        colorForShapes.assign(bloomEffect)
      })

      // **Multiply final bloom effect onto the texture**
      texelNew.rgb = texelNew.rgb.add(colorForShapes.mul(bloomFactor))

      return texelNew
    })

    //

    const materialComposed =
      this._materialComposed || (this._materialComposed = new NodeMaterial())
    materialComposed.name = 'RadianceCascade'
    materialComposed.fragmentNode = cascade()

    _quadMeshComp.material = materialComposed

    //

    const properties = builder.getNodeProperties(this)
    properties.textureNode = textureNode

    //

    return this._textureNode
  }

  dispose () {
    this._compRT.dispose()
    this._oldRT.dispose()
  }
}

/**
 * TSL function for creating a radiance cascade node for post-processing.
 *
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Node<TextureNode>} selectedTexture - The texture node to use for the selected state.
 * @param {Number} [intensity=1.0] - The intensity of the radiance effect.
 * @returns {RadianceCascadeNode}
 */
export const lightingPass = (node, intensity = 1.0) =>
  nodeObject(new RadianceCascadeNode(convertToTexture(node), intensity))

export default RadianceCascadeNode
