import JPEG_DEC_WASM from '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?url'
import JPEG_ENC_WASM from '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url'

import { init as initJpegDecode } from '@jsquash/jpeg/decode.js'
import { init as initJpegEncode } from '@jsquash/jpeg/encode.js'

import PNG_WASM from '@jsquash/png/codec/squoosh_png_bg.wasm?url'
import { init as initPngDecode } from '@jsquash/png/decode.js'
import { init as initPngEncode } from '@jsquash/png/encode.js'

import WEBP_ENC_WASM from '@jsquash/webp/codec/enc/webp_enc_simd.wasm?url'
import WEBP_DEC_WASM from '@jsquash/webp/codec/dec/webp_dec.wasm?url'
import { init as initWebpDecode } from '@jsquash/webp/decode.js'
import { init as initWebpEncode } from '@jsquash/webp/encode.js'

import AVIF_ENC_WASM from '@jsquash/avif/codec/enc/avif_enc.wasm?url'
import AVIF_DEC_WASM from '@jsquash/avif/codec/dec/avif_dec.wasm?url'
import { init as initAvifDecode } from '@jsquash/avif/decode.js'
// import { init as initAvifEncode } from '@jsquash/avif/encode.js'


export async function load() {
  const files = [
    [JPEG_DEC_WASM, initJpegDecode],
    [JPEG_ENC_WASM, initJpegEncode],
    [PNG_WASM, initPngDecode, initPngEncode],
    [WEBP_ENC_WASM, initWebpEncode],
    [WEBP_DEC_WASM, initWebpDecode],
    [AVIF_ENC_WASM, initAvifEncode],
    [AVIF_DEC_WASM, initAvifDecode],
  ]

  // for (const [file, initializer] of files) {
  //   const res = await fetch(file);
  //   const arrayBuffer = await res.arrayBuffer();
  //   console.log(arrayBuffer)
  // }

}

export const all = []