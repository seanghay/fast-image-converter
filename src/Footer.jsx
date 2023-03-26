const timestamp = new Date(BUILD_TIMESTAMP).toUTCString();

export default function Footer() {
	return (
		<>
			<footer className="footer">
				<p className="text-center color-secondary">
					Supported formats <br />
					.svg, .heif, .heic, .avif, .webp, .jpg, .png, .pdf VectorDrawable(.xml)
				</p>

				<p className="text-center text-sm color-secondary">
					Made with ❤️ by{" "}
					<a className="color-secondary" href="https://github.com/seanghay">
						@seanghay
					</a>
				</p>
				<p className="text-center text-sm color-secondary">{timestamp}</p>
			</footer>
		</>
	);
}
