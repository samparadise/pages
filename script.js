function toggleMenu() {
	document.querySelector(".mobile-menu").classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", () => {
	const quoteTextElement = document.getElementById("quote-text");
	const quoteAuthorElement = document.getElementById("quote-author");

	fetch("quotes.json")
		.then(response => response.json())
		.then(quotes => {
			const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

			// Ensure author is always a string (empty if missing)
			const author = randomQuote.author ? randomQuote.author : "";

			typeQuote(randomQuote.quote, author, quoteTextElement, quoteAuthorElement);
			
			// quoteText.innerHTML = randomQuote.quote;
			// quoteAuthor.innerHTML = randomQuote.author;
		})
		.catch(error => console.error("Error loading quotes:", error));

	const dropdowns = document.querySelectorAll(".mobile-menu .dropdown > a");
		dropdowns.forEach(item => {
			item.addEventListener("click", (event) => {
				event.preventDefault(); // Prevent parent link from navigating
				const submenu = item.nextElementSibling;
				if (submenu) {
					submenu.classList.toggle("show");
				}
			});
		});

	const galleryModal = document.getElementById("gallery-modal");
		const openGallery = document.getElementById("open-gallery");
		const closeGallery = document.querySelector(".close-gallery");
		const modalDescription = document.getElementById("modal-description");
		let currentImage = null; // Track currently displayed image
		
		// Open gallery when "Gallery" in navbar is clicked
		openGallery.addEventListener("click", (event) => {
			event.preventDefault();
			galleryModal.style.display = "flex";
		});
		
		// Close gallery when clicking the close button
		closeGallery.addEventListener("click", () => {
			galleryModal.style.display = "none";
			modalDescription.style.display = "none"; // Hide description when closing
		});
		
		// Close gallery when clicking outside content
		galleryModal.addEventListener("click", (event) => {
			if (event.target === galleryModal) {
				galleryModal.style.display = "none";
				modalDescription.style.display = "none"; // Hide description when closing
			}
		});
		
		// Fetch images for the carousel
		fetch("images.json")
			.then(response => response.json())
			.then(images => {
				const carouselInner = document.getElementById("carousel-images");
		
				images.forEach((image, index) => {
					let div = document.createElement("div");
					div.classList.add("carousel-item");
					if (index === 0) div.classList.add("active");
		
					let img = document.createElement("img");
					img.src = `photos/${image.filename}`;
					img.classList.add("d-block", "w-100");
					img.alt = image.description;
					img.setAttribute("data-description", image.description);
		
					div.appendChild(img);
					carouselInner.appendChild(div);
		
					// Toggle description on click
					img.addEventListener("click", function () {
						if (currentImage === this) {
							// If same image clicked again, toggle visibility
							modalDescription.style.display = modalDescription.style.display === "none" ? "block" : "none";
						} else {
							// If a new image is clicked, show its description
							modalDescription.textContent = this.getAttribute("data-description");
							modalDescription.style.display = "block";
							currentImage = this;
						}
					});
				});
		
				// Hide description when image changes (Bootstrap event)
				document.getElementById("carouselExample").addEventListener("slid.bs.carousel", function () {
					modalDescription.style.display = "none";
					currentImage = null; // Reset current image tracker
				});
			})
			.catch(error => console.error("Error loading images:", error));

});

function typeQuote(quote, author, quoteElement, authorElement) {
	let index = 0;
	let cursor = `<span class="cursor">_</span>`;
	let lines = quote.split("\n"); // Split into lines for multi-line effect
	let currentLine = 0;

	function typeLine() {
		if (currentLine < lines.length) {
			let line = lines[currentLine].replace(/\n/g, "<br>");
			let lineIndex = 0;

			function typeCharacter() {
				if (lineIndex < line.length) {
					quoteElement.innerHTML = lines.slice(0, currentLine).join("<br>") + "<br>" +
						line.substring(0, lineIndex + 1) + cursor;
					lineIndex++;
					setTimeout(typeCharacter, 50); // Typing speed
				} else {
					currentLine++;
					if (currentLine < lines.length) {
						setTimeout(typeLine, 400); // Delay between lines
					} else {
						// quoteElement.innerHTML = quote + cursor; // Full quote with blinking cursor
						quoteElement.innerHTML = quote.replace(/\n/g, "<br>") + cursor; // Preserve line breaks
						setTimeout(() => {
							document.querySelector(".cursor").style.display = "inline-block"; // Keep cursor
							authorElement.innerHTML = author; // Show author after delay
						}, 1000);
					}
				}
			}

			typeCharacter();
		}
	}

	typeLine();
}
