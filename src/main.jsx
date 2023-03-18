import "./reset.css";
import "./style.css";
import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";

const worker = new Worker(new URL("./worker.js", import.meta.url), {
	type: "module",
});

ReactDOM.createRoot(document.getElementById("app")).render(
	<React.StrictMode>
		<App worker={worker} />
	</React.StrictMode>
);
