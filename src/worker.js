if (import.meta.env.PROD && typeof document === "undefined") {
  Object.assign(globalThis, {
    document: {
      currentScript: {
        src: self.location.href,
      },
    },
  });
}
import { encode as encode_png, decode as decode_png } from '@jsquash/png';
import { encode as encode_jpeg, decode as decode_jpeg } from '@jsquash/jpeg';
import { decode as decode_webp } from '@jsquash/webp';
import avif_dec from '@jsquash/avif/codec/dec/avif_dec.js';
import { initEmscriptenModule } from '@jsquash/avif/utils.js'

let emscriptenModuleAVIF;

export async function decode_avif(buffer) {
  if (!emscriptenModuleAVIF) {
    emscriptenModuleAVIF = initEmscriptenModule(avif_dec);
  }
  const module = await emscriptenModuleAVIF;
  console.log(module)

  const result = module.decode(buffer);

  if (!result)
    throw new Error('Decoding error');
  return result;
}


addEventListener("message", async ({ data }) => {

  const encoders = {
    png: encode_png,
    // webp: encode_webp,
    jpeg: encode_jpeg,
  }

  const decoders = {
    png: decode_png,
    webp: decode_webp,
    jpeg: decode_jpeg,
    avif: decode_avif
  }

  const extensions = {
    jpeg: ".jpg",
    png: ".png",
    webp: ".webp",
    avif: ".avif"
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