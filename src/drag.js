export function createFileDropHandler(el, onDrop) {

  el.ondrag = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  el.ondrop = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    document.body.classList.remove('drag-over');

    const files = [];

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          files.push(file);
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      files.push(...ev.dataTransfer.files)
    }

    onDrop(files);
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
