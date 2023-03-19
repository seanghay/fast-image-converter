import { createFileDropHandler } from "./drag.js";
import React, { useEffect, useId, useRef, useState } from "react";
import prettyBytes from "pretty-bytes";
import { nanoid } from "nanoid";
import { saveAs } from "file-saver";
import Footer from "./Footer.jsx";

function AppIcon() {
	return (
		<div className="app-icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 256 256"
			>
				<path
					fill="currentColor"
					d="M245.83 121.63a15.53 15.53 0 0 0-9.52-7.33a73.51 73.51 0 0 0-22.17-2.22c4-19.85 1-35.55-2.06-44.86a16.15 16.15 0 0 0-18.79-10.88a85.53 85.53 0 0 0-28.55 12.12a94.58 94.58 0 0 0-27.11-33.25a16.05 16.05 0 0 0-19.26 0a94.48 94.48 0 0 0-27.11 33.25a85.53 85.53 0 0 0-28.55-12.12a16.15 16.15 0 0 0-18.79 10.88c-3 9.31-6 25-2.06 44.86a73.51 73.51 0 0 0-22.17 2.22a15.53 15.53 0 0 0-9.52 7.33a16 16 0 0 0-1.6 12.27c3.39 12.57 13.8 36.48 45.33 55.32S113.13 208 128.05 208s42.67 0 74-18.78c31.53-18.84 41.94-42.75 45.33-55.32a16 16 0 0 0-1.55-12.27ZM59.14 72.14a.2.2 0 0 1 .23-.15a70.43 70.43 0 0 1 25.81 11.67A118.65 118.65 0 0 0 80 119.17c0 18.74 3.77 34 9.11 46.28A123.59 123.59 0 0 1 69.57 140C51.55 108.62 55.3 84 59.14 72.14Zm3 103.35C35.47 159.57 26.82 140.05 24 129.7a59.82 59.82 0 0 1 22.5-1.17a129.08 129.08 0 0 0 9.15 19.41a142.28 142.28 0 0 0 34 39.56a114.92 114.92 0 0 1-27.55-12.01ZM128 190.4c-9.33-6.94-32-28.23-32-71.23C96 76.7 118.38 55.24 128 48c9.62 7.26 32 28.72 32 71.19c0 42.98-22.67 64.27-32 71.21Zm42.82-106.74A70.43 70.43 0 0 1 196.63 72a.2.2 0 0 1 .23.15c3.84 11.85 7.59 36.47-10.43 67.85a123.32 123.32 0 0 1-19.54 25.48c5.34-12.26 9.11-27.54 9.11-46.28a118.65 118.65 0 0 0-5.18-35.54ZM232 129.72c-2.77 10.25-11.4 29.81-38.09 45.77a114.92 114.92 0 0 1-27.55 12a142.28 142.28 0 0 0 34-39.56a129.08 129.08 0 0 0 9.15-19.41a59.69 59.69 0 0 1 22.49 1.19Z"
				/>
			</svg>
		</div>
	);
}

function RadioItem({ checked, onChange, children, name, value }) {
	const id = useId();
	return (
		<div className="field">
			<input
				checked={checked}
				onChange={onChange}
				type="radio"
				name={name}
				value={value}
				id={id}
			/>
			<label htmlFor={id}>{children}</label>
		</div>
	);
}

function RadioGroup({ items, onChange, value }) {
	const id = useId();
	return (
		<div className="formats">
			{items.map((item) => (
				<RadioItem
					checked={value === item}
					onChange={() => onChange(item)}
					key={item}
					name={id}
					value={item}
				>
					{item}
				</RadioItem>
			))}
		</div>
	);
}

export function FileListView({ files }) {
	return (
		<div className="files">
			{files.map(({ file, id, ready, failed, blob, filename, format }) => (
				<div key={id} className="file">
					<div className="file-info">
						<div className="file-name truncate">{file.name}</div>
						<div className="file-size">
							{prettyBytes(file.size)}
							{"\u30fb"}
							{file.type.split("/")[1]}
							{" → "}
							{format.toLowerCase()}
							{blob ? <span>{"\u30fb"}<span className="color-primary">{prettyBytes(blob.size)}</span></span> : ""}
						</div>
					</div>
					{!ready && !failed ? <span className="loader"></span> : null}
					{ready || failed ? (
						<button
							onClick={() => saveAs(blob, filename)}
							className="small secondary"
							disabled={!ready}
						>
							{ready ? "Download" : failed ? "Failed 🙁" : "Processing…"}
						</button>
					) : null}
				</div>
			))}
		</div>
	);
}

export default function App({ worker }) {
	const formats = ["JPEG", "PNG"];
	const [format, setFormat] = useState(formats[0]);
	const [files, setFiles] = useState([]);
	const fileRef = useRef(null);

	const isSomeReady = files.some((e) => e.ready);
	const totalReadyCount = files.filter((it) => it.ready).length;

	useEffect(() => {
		worker.onmessage = ({ data }) => {
			setFiles(
				files.map((file) => {
					if (file.id === data.id) {
						return {
							...file,
							ready: true,
							blob: data.blob,
							filename: data.filename,
						};
					}
					return file;
				})
			);
		};
	}, [files, formats]);

	const postFiles = (uploadFiles) => {
		const transformedFiles = uploadFiles.map((file) => {
			const id = nanoid(11);
			return {
				id,
				file,
				format,
				ready: false,
				failed: false,
			};
		});

		// append files

		let _files = [...transformedFiles, ...files];
		setFiles(_files);

		worker.postMessage(_files);
	};

	useEffect(() => {
		createFileDropHandler(window, (uploadFiles) => {
			postFiles(uploadFiles);
		});
	}, [files, format]);

	const chooseFile = () => {
		fileRef.current.value = "";
		fileRef.current.click();
	};

	const onFileChange = (e) => {
		postFiles([...e.target.files]);
	};

	const saveAllFiles = () => {
		for (const { blob, ready, filename } of files) {
			if (!ready || !blob) continue;
			saveAs(blob, filename);
		}
	};

	return (
		<div className="container">
			<div className="card">
				<div className="card-body">
					<AppIcon />
					<h1 className="text-center color-primary">Fast Image Converter</h1>
					<p className="text-center color-secondary">
						Drop the files that you want to convert anywhere or clicking on
						browse files button below.
					</p>

					<button onClick={chooseFile}>Browse files</button>
					<input
						accept="image/"
						multiple
						onChange={onFileChange}
						type="file"
						hidden
						style={{ display: "none" }}
						ref={fileRef}
					/>

					<div className="format-container">
						<p className="color-secondary text-center text-sm uppercase">
							Output Format
						</p>

						<RadioGroup
							value={format}
							items={formats}
							onChange={(item) => setFormat(item)}
						/>
					</div>
				</div>

				<FileListView files={files} />

				{files.length > 0 ? (
					<div className="card-body">
						<div className="buttons">
							<button
								disabled={!files.length}
								onClick={() => setFiles([])}
								className="light"
							>
								Clear
							</button>
							<button
								disabled={!files.length || !isSomeReady}
								className="secondary"
								onClick={saveAllFiles}
							>
								Download all
							</button>
						</div>
					</div>
				) : null}
			</div>

			<Footer />
		</div>
	);
}
