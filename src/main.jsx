import "./reset.css";
import "./style.css";
import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import MyWorker from "./worker.js?worker";

const worker = new MyWorker();
const formats = ["JPEG", "PNG", "WEBP", "AVIF"];

let initialFormat = new URL(location.href).searchParams.get("format");

if (typeof initialFormat === "string") {
	initialFormat = initialFormat.toUpperCase();
}

if (!initialFormat || !formats.includes(initialFormat)) {
	initialFormat = formats[0];
}

ReactDOM.createRoot(document.getElementById("app")).render(
	<React.StrictMode>
		<App formats={formats} initialFormat={initialFormat} worker={worker} />
	</React.StrictMode>
);
