import "./reset.css";
import "./style.css";

fileDragOn(window);

function fileDragOn(element: Window | HTMLElement) {

  const handleDrop = (ev: DragEvent) => {
    ev.preventDefault();
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          console.log(`… file[${i}].name = ${file.name}`);
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.log(`… file[${i}].name = ${file.name}`);
      });
    }
  }

  const handleDragOver = (e: Event) => {
    e.preventDefault()
    console.log('dragover')
  };

  element.addEventListener('drop', e => handleDrop(e));
	element.addEventListener("drag", (e) => console.log('drag'));
	element.addEventListener("dragend", (e) => console.log('dragend'));
	element.addEventListener("dragover", (e) => handleDragOver(e));
	element.addEventListener("dragstart", (e) => console.log('dragstart'));
	element.addEventListener("dragleave", (e) => console.log('dragleave'));
}
