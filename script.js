function toggleMenu() {
	document.querySelector(".mobile-menu").classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", function () {
	const quoteTextElement = document.getElementById("quote-text");
	const quoteAuthorElement = document.getElementById("quote-author");
	
	const dynamicMenu = document.getElementById("dynamicMenu");
	const exploringMenuItem = document.getElementById("open-gallery").parentElement;
	
//	const navbarNav = document.getElementById("navbarNav");

	const subPage = document.getElementById("subPage");
	const subPageContent = document.getElementById("subPageContent");
	const subPageOverlay = document.getElementById("subPageOverlay");

	// === Load Quotes ===
	fetch("quotes.json")
		.then(response => response.json())
		.then(quotes => {
			const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
			const author = randomQuote.author ? randomQuote.author : "";

			typeQuote(randomQuote.quote, author, quoteTextElement, quoteAuthorElement);
		})
		.catch(error => console.error("Error loading quotes:", error));

	// === Load Menu Items from JSON ===
	fetch("menu.json")
		.then(response => response.json())
		.then(menuData => {
			insertMenuItems(menuData);
		})
		.catch(error => console.error("Error loading menu:", error));

	function insertMenuItems(menuData) {
		Object.keys(menuData).reverse().forEach(category => {
			let dropdown = document.createElement("li");
			dropdown.classList.add("nav-item", "dropdown");
	
			dropdown.innerHTML = `
				<a class="nav-link dropdown-toggle" href="#" id="${category}Dropdown" role="button"
					data-bs-toggle="dropdown" aria-expanded="false">
					${capitalizeFirstLetter(category)}
				</a>
				<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="${category}Dropdown">
			`;
	
			let dropdownMenu = dropdown.querySelector(".dropdown-menu");
	
			menuData[category].forEach(entry => {
				let menuItem = document.createElement("li");
				menuItem.innerHTML = `<a class="dropdown-item menu-link" href="#" data-category="${category}" data-item="${entry.item}">${entry.item}</a>`;
				dropdownMenu.appendChild(menuItem);
			});
	
			dropdown.appendChild(dropdownMenu);
			dynamicMenu.insertBefore(dropdown, exploringMenuItem);
		});
	
		attachMenuEventListeners(menuData);
	}
	
	function attachMenuEventListeners(menuData) {
		document.querySelectorAll(".menu-link").forEach(item => {
			item.addEventListener("click", function (event) {
				event.preventDefault();

				const category = this.getAttribute("data-category");
				const itemName = this.getAttribute("data-item");

				const menuEntry = menuData[category].find(entry => entry.item === itemName);
				if (menuEntry) {
					
					let contentHTML = `<div class="sub-page-content-wrapper">`;
					
					// If an image is provided, include it
					if (menuEntry.image) {
						contentHTML += `<img src="${menuEntry.image}" alt="${menuEntry.item}" class="sub-page-image">`;
					}
					
					// Add the markdown content
					contentHTML += `<div class="markdown-content">${marked.parse(menuEntry.overview_md)}</div></div>`;
					
					subPageContent.innerHTML = contentHTML;

					subPage.classList.add("active");
					subPageOverlay.classList.add("active");

					// Ensure all links open in a new tab
					document.querySelectorAll(".markdown-content a").forEach(link => {
						link.setAttribute("target", "_blank");
						link.setAttribute("rel", "noopener noreferrer");
					});
					
					// Hide submenu
					document.querySelectorAll(".dropdown-menu.show").forEach(menu => {
						menu.classList.remove("show");
					});
				}
			});
		});
	}

	// === Clicking outside closes the markdown panel ===
	subPageOverlay.addEventListener("click", function () {
		subPage.classList.remove("active");
		subPageOverlay.classList.remove("active");
		subPageContent.innerHTML = "";
	});

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	const galleryModal = document.getElementById("gallery-modal");
	const openGallery = document.getElementById("open-gallery");
	const closeGallery = document.querySelector(".close-gallery");
	const modalDescription = document.getElementById("modal-description");	
	let currentImage = null;
	
	// === Load Gallery Images ===
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
						modalDescription.style.display = modalDescription.style.display === "none" ? "block" : "none";
					} else {
						modalDescription.textContent = this.getAttribute("data-description");
						modalDescription.style.display = "block";
						currentImage = this;
					}
				});
			});

			// Hide description when image changes (Bootstrap event)
			document.getElementById("carouselExample").addEventListener("slid.bs.carousel", function () {
				modalDescription.style.display = "none";
				currentImage = null;
			});
		})
		.catch(error => console.error("Error loading images:", error));

	// === Open/Close Gallery ===
	openGallery.addEventListener("click", (event) => {
		event.preventDefault();
		galleryModal.style.display = "flex";
	});

	closeGallery.addEventListener("click", () => {
		console.log("Close button clicked!");
		galleryModal.style.display = "none";
		modalDescription.style.display = "none";
	});

	galleryModal.addEventListener("click", (event) => {
		if (event.target === galleryModal) {
			galleryModal.style.display = "none";
			modalDescription.style.display = "none";
		}
	});
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
