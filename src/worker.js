import './hack.js'
import { encode as encode_png, decode as decode_png } from '@jsquash/png';
import { encode as encode_jpeg, decode as decode_jpeg } from '@jsquash/jpeg';
import { decode as decode_webp } from '@jsquash/webp';
import { defaultOptions as webp_defaultOptions } from '@jsquash/webp/meta.js'
import { defaultOptions as avif_defaultOptions } from '@jsquash/avif/meta.js'

import avif_dec from '@jsquash/avif/codec/dec/avif_dec.js';
import avif_enc from '@jsquash/avif/codec/enc/avif_enc.js';
import webp_enc from '@jsquash/webp/codec/enc/webp_enc.js';

import wasm_heif from "@saschazar/wasm-heif";
import wasm_heif_url from "@saschazar/wasm-heif/wasm_heif.wasm?url";

import { initEmscriptenModule } from '@jsquash/avif/utils.js'
import { fileToArrayBuffer } from './buffer.js'
import resvgWasmUrl from '@resvg/resvg-wasm/index_bg.wasm?url';
import { initWasm as initResvg, Resvg } from '@resvg/resvg-wasm';
import * as pdfjs from 'pdfjs-dist/build/pdf.js'
import PDFWorker from 'pdfjs-dist/build/pdf.worker.js?worker'
import { nanoid } from 'nanoid';

let pdfReady = false;
let isResvgReady = false;
let emscriptenModuleAVIF;
let emscriptenModuleAVIF_ENC;
let emscriptenModuleWEBP;

async function decode_heif(buffer) {

  const heif_decoder = await (new Promise(r => {
    wasm_heif({
      locateFile: () => wasm_heif_url,
      noInitialRun: true,
      onRuntimeInitialized() {
        r(this)
      },
    })
  }))

  const arrayBuffer = new Uint8Array(buffer);
  const pixels = heif_decoder.decode(arrayBuffer, arrayBuffer.length, false);
  const { width, height } = heif_decoder.dimensions();
  const imageData = new ImageData(width, height);
  const data = imageData.data;
  let t = 0;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = pixels[t];
    data[i + 1] = pixels[t + 1];
    data[i + 2] = pixels[t + 2];
    data[i + 3] = 255;
    t += 3;
  }

  heif_decoder.free();
  return imageData;
}


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

  if (!result) {
    throw new Error('Decoding error');
  }

  return result;
}

async function decode_svg(data, { target }) {
  const isJpeg = target === 'jpeg';

  if (!isResvgReady) {
    await initResvg(fetch(resvgWasmUrl))
    isResvgReady = true;
  }
  const opts = {};

  if (isJpeg) {
    opts['background'] = 'white';
  }

  const resvg = new Resvg(new Uint8Array(data), opts);
  const { pixels, width, height } = resvg.render();
  const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
  return imageData;
}

async function decode_pdf(data) {

  if (!pdfReady) {
    const worker = new PDFWorker();
    pdfjs.GlobalWorkerOptions.workerPort = worker;
    pdfReady = true;  
  }
  
  const document = {
    fonts: self.fonts,
    createElement: (name) => {
      if (name == 'canvas') {
        return new OffscreenCanvas(1, 1);
      }
      return null;
    },
  };

  const doc = await pdfjs.getDocument({
    data, ownerDocument: document
  }).promise;

  const imageDataCollection = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const pageViewport = page.getViewport({ scale: 2 });
    const canvas = new OffscreenCanvas(pageViewport.width, pageViewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({
      canvasContext: ctx,
      viewport: pageViewport,
    }).promise

    imageDataCollection.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }
  return imageDataCollection;
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
    heif: decode_heif,
    heic: decode_heif,
    'svg+xml': decode_svg,
    pdf: decode_pdf,
  }

  const extensions = {
    jpeg: ".jpg",
    png: ".png",
    webp: ".webp",
    avif: ".avif",
    heif: ".heif",
    heic: ".heic",
    pdf: ".pdf",
  }

  const emit = async ({ 
    id,
    enc, rawBuffer, filename, target
   }) => {
    const imageData = await enc(rawBuffer);
    const arr = new Uint8Array(imageData);
    const blob = new Blob([arr], { type: "image/" + target });

    postMessage({
      id,
      blob,
      filename,
    });
  }

  for (const _file of data) {
    const { id, file, format } = _file;
    const target = format.toLowerCase();

    const src = file.type.split('/')[1];
    const enc = encoders[target];
    const dec = decoders[src];

    if (!enc || !dec) continue;

    const arrayBuffer = await fileToArrayBuffer(file);
    const rawBuffer = await dec(arrayBuffer, { target });

    if (Array.isArray(rawBuffer)) {
      const items = rawBuffer.map((raw, i) => {
        return {
          ..._file,
          id: nanoid(11),
          bufferedIndex: i,
        }
      })

      postMessage({
        id,
        items,
        emitMultiple: true,
        length: rawBuffer.length,
      })

      for (const item of items) {
        const rf = rawBuffer[item.bufferedIndex];
        const ext = extensions[target];
        let filename = file.name.replace(/\.(jpe?g|pdf|png|webp|heic|heif|svg)$/i, '');
        filename += `-${item.bufferedIndex + 1}` + ext;

        await emit({ id: item.id, enc, rawBuffer: rf, filename, target });
      }

      continue;
    }

    const ext = extensions[target];
    let filename = file.name.replace(/\.(jpe?g|pdf|png|webp|heic|heif|svg)$/i, '');
    filename += ext;

    await emit({
      id,
      enc, 
      rawBuffer,
      file,
      target,
      filename,
    })

    // const imageData = await enc(rawBuffer);
    // const arr = new Uint8Array(imageData);
    // const blob = new Blob([arr], { type: "image/" + target });
    

    // postMessage({
    //   id,
    //   blob,
    //   filename,
    // })
  }
})

