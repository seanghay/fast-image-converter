import './engine.js'

addEventListener("message", async ({ data }) => {

  const encoders = {
    png: encode_png,
    webp: encode_webp,
    jpeg: encode_jpeg,
    avif: encode_avif
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