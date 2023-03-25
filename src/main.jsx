import "./reset.css";
import "./style.css";
import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import MyWorker from "./worker.js?worker";
import resvg_wasm_url from "@resvg/resvg-wasm/index_bg.wasm?url";

const worker = new MyWorker();

ReactDOM.createRoot(document.getElementById("app")).render(
	<React.StrictMode>
		<App worker={worker} />
	</React.StrictMode>
);
