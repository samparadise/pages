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
