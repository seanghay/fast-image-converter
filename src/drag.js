const SUPPORTED_MIME_TYPES = new Set([
  'image/svg+xml',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
  'image/heif',
  'image/heic',
  'image/heif-sequence',
  'image/heic-sequence',
  'application/xml',
  'text/xml',
]);


const supportsFileSystemAccessAPI =
  "getAsFileSystemHandle" in DataTransferItem.prototype;
const supportsWebkitGetAsEntry =
  "webkitGetAsEntry" in DataTransferItem.prototype;

async function* getFilesRecursively(entry) {
  if (entry.kind === "file") {
    const file = await entry.getFile();
    if (file !== null) {
      file.relativePath = getRelativePath(entry);
      yield file;
    }
  } else if (entry.kind === "directory") {
    for await (const handle of entry.values()) {
      yield* getFilesRecursively(handle);
    }
  }
}

export function createFileDropHandler(el, onDrop) {

  const handleDataTransfer = async (dataTransfer) => {
    const files = [];

    if (dataTransfer.items) {
      const promises = [...dataTransfer.items].filter(item => item.kind === 'file')
        .map(item => supportsFileSystemAccessAPI ?
          item.getAsFileSystemHandle() :
          supportsWebkitGetAsEntry ? item.webkitGetAsEntry() :
            item.getAsFile())

      const traverse = async (handle) => {
        if (handle.kind === 'directory' || handle.isDirectory) {
          for await (const entry of handle.values()) {
            await traverse(entry);
          }
        } else {
          const file = await handle.getFile();
          // heic/heif is an exception
          if (SUPPORTED_MIME_TYPES.has(file.type) || /\.(heif|heic)$/i.test(file.name)) {
            files.push(file);
          }
        }
      };

      for await (const handle of promises) {
        await traverse(handle);
      }

    } else {
      files.push(...dataTransfer.files)
    }

    onDrop(files);
  }


  document.onpaste = e => {
    e.preventDefault();
    const dataTransfer = (e.clipboardData || window.clipboardData);
    handleDataTransfer(dataTransfer)
  }

  el.ondrag = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  el.ondrop = async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    document.body.classList.remove('drag-over');
    await handleDataTransfer(ev.dataTransfer);
  }

  el.ondragstart = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  el.ondragend = e => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove('drag-over');
  };


  el.ondragover = e => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.add('drag-over');
  }

  el.ondragenter = e => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.add('drag-over');
  }

  el.dragleave = e => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove('drag-over');
  }
}
