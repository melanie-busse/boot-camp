import { Book } from "./models/Book.js";

const API_BASE_URL = "http://localhost:4730/books";

const titleDisplay = document.querySelector("#book-title") as HTMLHeadingElement;
const abstractDisplay = document.querySelector("#book-abstract") as HTMLElement;
const authorDisplay = document.querySelector("#book-author") as HTMLElement;
const publisherDisplay = document.querySelector("#book-publisher") as HTMLElement;
const pagesDisplay = document.querySelector("#book-pages") as HTMLElement;
const isbnDisplay = document.querySelector("#book-isbn") as HTMLElement;
const bookCover = document.querySelector("#book-cover") as HTMLImageElement;


async function fetchBook() {
    const urlParams = new URLSearchParams(window.location.search);
    const isbn = urlParams.get('isbn');

    if (!isbn) {
        console.error("Keine ISBN gefunden");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${isbn}`);
        if (!response.ok) throw new Error("Buch konnte nicht geladen werden");

        const book: Book = await response.json();

        renderDetails(book);
    } catch (error) {
        console.error("Fehler beim Laden:", error);
        if (titleDisplay) titleDisplay.textContent = "Buch nicht gefunden.";
    }
}

function renderDetails(book: Book) {

    titleDisplay.innerHTML = `
        ${book.title}<br />
        <small>${book.subtitle || ""}</small>
    `;
    abstractDisplay.innerHTML = book.abstract || "Kein Abstract vorhanden.";
    authorDisplay.innerHTML = book.author || "Autor unbekannt";
    publisherDisplay.innerHTML = book.publisher || "Verlag unbekannt";
    pagesDisplay.innerHTML = book.numPages ? `${book.numPages} Seiten` : "Seitenanzahl unbekannt";
    isbnDisplay.innerHTML = book.isbn || "ISBN unbekannt";

    if (bookCover && book.cover) {
        bookCover.src = book.cover;
        bookCover.alt = `Cover von ${book.title}`;
    }
}

fetchBook();