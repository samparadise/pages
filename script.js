function toggleMenu() {
	document.querySelector(".mobile-menu").classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", function () {
	const quoteTextElement = document.getElementById("quote-text");
	const quoteAuthorElement = document.getElementById("quote-author");
	const refreshQuoteLink = document.getElementById("refresh-quote");

	const listsPage = document.getElementById("lists-page");
	const mainContent = document.querySelector(".content"); // Existing main content
	const showListsButton = document.getElementById("show-lists");
	
	const explainerDiv = document.getElementById("explanation-container");
	const explainerText = document.getElementById("explanation-text");
	const listsContainer = document.querySelector(".lists-container");
	
	// Show Lists Page
	showListsButton.addEventListener("click", function (event) {
		event.preventDefault();
		listsPage.classList.remove("d-none"); // Show lists
		mainContent.style.display = "none"; // Hide main content
	});
	// Tap on explanation text to hide it
	explainerDiv.addEventListener("click", function () {
		this.classList.toggle("hidden");
	});

	fetch("lists.json")
	.then(response => response.json())
	.then(data => {
		if (!data.lists || Object.keys(data.lists).length === 0) {
			explainerText.classList.remove("clickable");
			return;
		}
	
		// Replace explanation text with markdown-rendered intro
		explainerText.innerHTML = marked.parse(data.intro_md);
	
		// Generate lists dynamically
		listsContainer.innerHTML = ""; // Clear existing content
	
		Object.entries(data.lists).forEach(([listTitle, listData], listIndex) => {
			let listId = `list-${listIndex}`;
	
			let listHTML = `
				<div class="list-section">
					<div class="list-header" data-bs-toggle="collapse" data-bs-target="#${listId}">
						${listTitle} <span class="toggle-arrow">▼</span>
					</div>
					<div id="${listId}" class="collapse">
						<div class="list-description">${marked.parse(listData.intro_md)}</div>
						<ul class="list-group">
			`;
	
			listData.items.forEach((item, itemIndex) => {
				let itemId = `${listId}-item-${itemIndex}`;
				listHTML += `
					<li class="list-group-item">
						<div class="item-header" data-bs-toggle="collapse" data-bs-target="#${itemId}">
							${item.title} <span class="toggle-arrow">▼</span>
						</div>
						<div id="${itemId}" class="collapse">
							<div class="item-description">${marked.parse(item.info_md)}</div>
						</div>
					</li>
				`;
			});
	
			listHTML += `</ul></div></div><hr class="divider">`;
	
			listsContainer.innerHTML += listHTML;
		});
	})
	.catch(error => console.error("Error loading lists:", error));

	// Attach event listeners to LIST headers only
	document.querySelectorAll(".list-header").forEach(header => {
		const arrow = header.querySelector(".toggle-arrow");
		const collapseElement = document.querySelector(header.getAttribute("data-bs-target"));
	
		if (collapseElement && arrow) {
			collapseElement.addEventListener("show.bs.collapse", function () {
				arrow.style.transform = "rotate(180deg)"; // Expanded (arrow up)
			});
	
			collapseElement.addEventListener("hide.bs.collapse", function () {
				arrow.style.transform = "rotate(0deg)"; // Collapsed (arrow down)
			});
		}
	});
	
	// Attach event listeners to ITEM headers only
	document.querySelectorAll(".item-header").forEach(header => {
		const arrow = header.querySelector(".toggle-arrow");
		const collapseElement = document.querySelector(header.getAttribute("data-bs-target"));
	
		if (collapseElement && arrow) {
			collapseElement.addEventListener("show.bs.collapse", function (event) {
				arrow.style.transform = "rotate(180deg)"; // Expanded (arrow up)
				event.stopPropagation(); // Prevent affecting list header
			});
	
			collapseElement.addEventListener("hide.bs.collapse", function (event) {
				arrow.style.transform = "rotate(0deg)"; // Collapsed (arrow down)
				event.stopPropagation(); // Prevent affecting list header
			});
		}
	
		// Ensure clicking the item header does not affect the list header
		header.addEventListener("click", function (event) {
			event.stopPropagation(); // Prevent bubbling up
		});
	});
		
	let allQuotes = [];
	let shownQuotes = [];
	
	function getQuoteIdFromURL() {
		return window.location.hash ? window.location.hash.substring(1) : null;
	}
	
	const dynamicMenu = document.getElementById("dynamicMenu");
	const exploringMenuItem = document.getElementById("open-gallery").parentElement;
	
//	const navbarNav = document.getElementById("navbarNav");
	const navbarToggler = document.querySelector(".navbar-toggler");
	const navbarCollapse = document.querySelector(".navbar-collapse");
	
	document.querySelectorAll(".navbar-nav a").forEach(link => {
		link.addEventListener("click", function () {
			if (window.innerWidth < 992) { // Collapse only on small screens
				navbarToggler.click(); // Simulate toggle button click
			}
		});
	});


	const subPage = document.getElementById("subPage");
	const subPageContent = document.getElementById("subPageContent");
	const subPageOverlay = document.getElementById("subPageOverlay");

	fetch("quotes.json")
		.then(response => response.json())
		.then(quotes => {
			allQuotes = [...quotes];
			
			let quoteId = getQuoteIdFromURL();
			let selectedQuote;
			
			if (quoteId) {
				selectedQuote = quotes.find(q => q.id === quoteId);
				shownQuotes.push(selectedQuote);
			}
			
			// If no valid quote ID is found, select a new random quote on every page load
			if (!selectedQuote) {
				selectedQuote = selectNewQuote();
			
				// Update hash-based URL without preventing re-randomization on refresh
				window.location.replace(`#${selectedQuote.id}`);
			}
	
			// Display the quote
			typeQuote(selectedQuote.quote, selectedQuote.author, quoteTextElement, quoteAuthorElement, refreshQuoteLink);
		})
		.catch(error => console.error("Error loading quotes:", error));
		
		// Handle "Show me another one!" click
		refreshQuoteLink.addEventListener("click", function (event) {
			event.preventDefault(); // Prevent the default link behavior
		
			let newQuote = selectNewQuote();
			let allDone = (shownQuotes.length === allQuotes.length);
			
			quoteTextElement.innerHTML = "";
			quoteAuthorElement.innerHTML = "";
			
			typeQuote(newQuote.quote, newQuote.author, quoteTextElement, quoteAuthorElement, refreshQuoteLink, allDone);

			// Update hash-based URL without preventing re-randomization on refresh
			window.location.replace(`#${newQuote.id}`);
		});
		
		function selectNewQuote() {
			
			let remainingQuotes = allQuotes.filter(q => !shownQuotes.includes(q));
			let selectedQuote = remainingQuotes[Math.floor(Math.random() * remainingQuotes.length)];
			
			shownQuotes.push(selectedQuote); // Mark it as shown
			return selectedQuote;
		}
		
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

function typeQuote(quote, author, quoteElement, authorElement, refreshLink, done) {
	let index = 0;
	let cursor = `<span class="cursor">_</span>`;
	let lines = quote.split("\n"); // Split into lines for multi-line effect
	let currentLine = 0;

	// Immediately hide the refresh link so it fades in again later
	refreshLink.style.opacity = "0";
	refreshLink.style.visibility = "hidden"; // Ensure it disappears instantly

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
							
							setTimeout(() => {								
								if (done) {
									refreshLink.innerText = "that's all so far...";
									refreshLink.style.pointerEvents = "none"; // Disable clicking
									refreshLink.style.color = "#555"; // Make it look disabled
									refreshLink.style.display = "block"; // Ensure it's visible
								} 
								
								refreshLink.style.visibility = "visible";
								
								setTimeout(() => {
									refreshLink.classList.add("show"); // Apply fade-in effect
									refreshLink.style.opacity = "1";
								}, 50);
							}, 4200); // Adjust delay as needed
							
						}, 1000);
					}
				}
			}
			typeCharacter();
		}
	}
	typeLine();
}
