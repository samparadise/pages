document.addEventListener("DOMContentLoaded", () => {
	const quoteText = document.getElementById("quote-text");
	const quoteAuthor = document.getElementById("quote-author");

	fetch("quotes.json")
		.then(response => response.json())
		.then(quotes => {
			const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
			// typeQuote(randomQuote.quote, randomQuote.author, quoteText, quoteAuthor);
			quoteText.innerHTML = randomQuote.quote;
			quoteAuthor.innerHTML = randomQuote.author;
		})
		.catch(error => console.error("Error loading quotes:", error));
});

// function typeQuote(quote, author, quoteText, quoteAuthor) {
// 	let index = 0;
// 	const speed = 50;
// 
// 	const cursor = document.createElement("span");
// 	cursor.classList.add("cursor");
// 	cursor.textContent = "|";
// 	quoteText.appendChild(cursor);
// 
// 	function typeCharacter() {
// 		if (index < quote.length) {
// 			quoteText.textContent = quote.substring(0, index + 1);
// 			quoteText.appendChild(cursor); // 🔥 Ensures cursor stays at the end
// 			index++;
// 			setTimeout(typeCharacter, speed);
// 		} else {
// 			setTimeout(() => typeAuthor(author, 0), 500);
// 		}
// 	}
// 
// 	function typeAuthor(author, authorIndex) {
// 		if (authorIndex === 0) {
// 			quoteText.removeChild(cursor);
// 			quoteAuthor.appendChild(cursor); // 🔥 Moves cursor to author name
// 		}
// 
// 		if (authorIndex < author.length) {
// 			quoteAuthor.textContent = author.substring(0, authorIndex + 1);
// 			quoteAuthor.appendChild(cursor);
// 			authorIndex++;
// 			setTimeout(() => typeAuthor(author, authorIndex), speed);
// 		} else {
// 			cursor.style.animation = "blink 0.6s infinite";
// 		}
// 	}
// 
// 	typeCharacter();
// }