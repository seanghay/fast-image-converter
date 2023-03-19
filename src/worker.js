import './hack.js'
import { encode as encode_png, decode as decode_png } from '@jsquash/png';
import { encode as encode_jpeg, decode as decode_jpeg } from '@jsquash/jpeg';
import { decode as decode_webp } from '@jsquash/webp';
import { defaultOptions as webp_defaultOptions } from '@jsquash/webp/meta.js'
import { defaultOptions as avif_defaultOptions } from '@jsquash/avif/meta.js'

import avif_dec from '@jsquash/avif/codec/dec/avif_dec.js';
import avif_enc from '@jsquash/avif/codec/enc/avif_enc.js';
import webp_enc from '@jsquash/webp/codec/enc/webp_enc.js';

import { initEmscriptenModule } from '@jsquash/avif/utils.js'

let emscriptenModuleAVIF;
let emscriptenModuleAVIF_ENC;
let emscriptenModuleWEBP;


async function encode_avif(image) {

  if (!emscriptenModuleAVIF_ENC) {
    emscriptenModuleAVIF_ENC = initEmscriptenModule(avif_enc);
  }

  const module = await emscriptenModuleAVIF_ENC;
  const result = module.encode(image.data, image.width, image.height, avif_defaultOptions);

  if (!result)
    throw new Error('Decoding error');

  return result;
}


async function encode_webp(image) {

  if (!emscriptenModuleWEBP) {
    emscriptenModuleWEBP = initEmscriptenModule(webp_enc);
  }

  const module = await emscriptenModuleWEBP;
  const result = module.encode(image.data, image.width, image.height, webp_defaultOptions);

  if (!result)
    throw new Error('Decoding error');

  return result;
}

async function decode_avif(buffer) {

  if (!emscriptenModuleAVIF) {
    emscriptenModuleAVIF = initEmscriptenModule(avif_dec);
  }

  const module = await emscriptenModuleAVIF;
  const result = module.decode(buffer);

  if (!result)
    throw new Error('Decoding error');
  return result;
}


addEventListener("message", async ({ data }) => {

  const encoders = {
    png: encode_png,
    webp: encode_webp,
    jpeg: encode_jpeg,
    avif: encode_avif,
  }

  const decoders = {
    png: decode_png,
    webp: decode_webp,
    jpeg: decode_jpeg,
    avif: decode_avif,
  }

  const extensions = {
    jpeg: ".jpg",
    png: ".png",
    webp: ".webp",
    avif: ".avif",
    heif: ".heif",
    heic: ".heic",
  }

  for (const { id, file, format } of data) {
    const target = format.toLowerCase();

    const src = file.type.split('/')[1];
    const enc = encoders[target];
    const dec = decoders[src];

    if (!enc || !dec) continue;

    const arrayBuffer = await fileToArrayBuffer(file);
    const rawBuffer = await dec(arrayBuffer);
    const imageData = await enc(rawBuffer);
    const arr = new Uint8Array(imageData);
    const blob = new Blob([arr], { type: "image/" + target });
    const ext = extensions[target];
    let filename = file.name.replace(/\.(jpe?g|png|webp)$/, '');
    filename += ext;

    postMessage({
      id,
      blob,
      filename,
    })
  }
})


async function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject();
    reader.readAsArrayBuffer(file);
  })
}