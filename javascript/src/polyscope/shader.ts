import {
    ShaderMaterial,
    DoubleSide,
    Vector3,
    Texture,
    Color
  } from 'three';



const matcapIncludes: string = `
  uniform sampler2D Matcap_rgbk; // Matcap texture
`;

const common: string = `
  float getEdgeFactor(vec3 UVW, vec3 edgeReal, float width) {
    float slopeWidth = 1.;
    vec3 fw = fwidth(UVW);
    vec3 realUVW = max(UVW, 1. - edgeReal.yzx);
    vec3 baryWidth = slopeWidth * fw;
    vec3 end = width * fw;
    vec3 dist = smoothstep(end - baryWidth, end, realUVW);
    float e = 1.0 - min(min(dist.x, dist.y), dist.z);
    return e;
  }

  vec4 lightSurfaceMat(vec3 color, vec2 Normal) {
    vec2 uv = 0.93 * Normal * 0.25;
    vec4 mat_r = sRGBToLinear(texture2D(Matcap_rgbk, uv + vec2(0.25, 0.75)));
    vec4 mat_g = sRGBToLinear(texture2D(Matcap_rgbk, uv + vec2(0.75, 0.75)));
    vec4 mat_b = sRGBToLinear(texture2D(Matcap_rgbk, uv + vec2(0.25, 0.25)));
    vec4 mat_k = sRGBToLinear(texture2D(Matcap_rgbk, uv + vec2(0.75, 0.25)));
    vec4 colorCombined = color.r * mat_r + color.g * mat_g + color.b * mat_b +
                        (1. - color.r - color.g - color.b) * mat_k;
    return LinearTosRGB(colorCombined);
  }
`;

export const groundPlaneVertexShader: string = `
  uniform mat4 textureMatrix;
  attribute vec2 texture_uv;

  varying vec4 vUv;
  varying vec2 TextureUV;

  void main() {
    vUv = textureMatrix * vec4(position, 1.0);
    TextureUV = texture_uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const groundPlaneFragmentShader: string = `
  uniform vec3 color;
  uniform sampler2D tDiffuse;
  uniform sampler2D tex;
  uniform float alpha;

  varying vec2 TextureUV;
  varying vec4 vUv;

  float blendOverlay(float base, float blend) {
    return (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)));
  }

  vec3 blendOverlay(vec3 base, vec3 blend) {
    return vec3(blendOverlay(base.r, blend.r), blendOverlay(base.g, blend.g), blendOverlay(base.b, blend.b));
  }

  float onGrid(vec2 coord2D) {
    float modDist = min(min(mod(coord2D.x, 1.0), mod(coord2D.y, 1.0)), min(mod(-coord2D.x, 1.0), mod(-coord2D.y, 1.0)));
    return 1.0 - smoothstep(0.005, 0.02, modDist);
  }

  void main() {
    vec4 mat = vec4(texture2D(tex, 9.0 * TextureUV).rgb * 0.55 + 0.45, 1.0);
    vec4 base = texture2DProj(tDiffuse, vUv);
    float t = onGrid(26.0 * TextureUV);
    gl_FragColor = (1.0 - t) * ((1.0 - alpha) * vec4(blendOverlay(base.rgb, color), 1.0) + alpha * mat) + t * vec4(0.3, 0.3, 0.3, 1.0);
  }
`;

export function createMatCapMaterial(tex_rgbk: Texture, colorArray: number[]): ShaderMaterial {

    const vertexShader: string = `
      attribute vec3 barycoord;
      varying vec3 vNormal;
      varying vec3 Barycoord;
  
      void main() {
        vNormal = (mat3(modelViewMatrix) * normal);
        Barycoord = barycoord;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  
    const fragmentShader: string = `
      ${matcapIncludes}
      uniform vec3 color;
      uniform vec3 edgeColor;
      uniform float edgeWidth;
  
      varying vec3 vNormal;
      varying vec3 Barycoord;
  
      ${common}
  
      void main(void) {
        float alpha = getEdgeFactor(Barycoord, vec3(1.,1.,1.), edgeWidth);
        gl_FragColor = lightSurfaceMat((1.-alpha) * color + alpha * edgeColor, normalize(vNormal).xy);
      }
    `;
  
    const color = new Color(colorArray[0], colorArray[1], colorArray[2]);

    const material = new ShaderMaterial({
      uniforms: {
        Matcap_rgbk: { value: tex_rgbk },
        color: { value: new Vector3(1, 1, 1) },
        edgeColor: { value: color },
        edgeWidth: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      side: DoubleSide
    });
  
    return material;
  }