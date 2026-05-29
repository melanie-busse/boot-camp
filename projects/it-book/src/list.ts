import { Book } from "./models/Book.js";
import {getFavorites, toggleFavorite, updateNavCount} from "./services/favorites-service.js";

const API_URL = "http://localhost:4730/books";

const tableBody = document.querySelector("tbody") as HTMLTableSectionElement;
const countDisplay = document.querySelector("h2") as HTMLHeadingElement;
const searchInput = document.querySelector("#search") as HTMLInputElement;
const publisherSelect = document.querySelector("#by-publisher") as HTMLSelectElement;

let allBooks: Book[] = [];

async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("API Fehler");

        allBooks = await response.json();

        renderTable(allBooks);
        fillPublisherDropdown(allBooks);
    } catch (error) {
        console.error("Fehler beim Laden:", error);
        tableBody.innerHTML = '<tr><td colspan="6">Server nicht erreichbar. Hast du npx bookmonkey-api gestartet?</td></tr>';
    }
}

function renderTable(booksToDisplay: Book[]) {
    tableBody.innerHTML = "";
    const currentFavorites = getFavorites();

    countDisplay.textContent = `${booksToDisplay.length} Books displayed`;

    booksToDisplay.forEach(book => {
        const isFavorites = currentFavorites.includes(book.isbn);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <button class="button button-clear fav-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         fill="${isFavorites ? 'currentColor' : 'none'}" 
                         viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="fav">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </button>
            </td>
            <td>${book.title}</td>
            <td>${book.isbn}</td>
            <td>${book.author}</td>
            <td>${book.publisher}</td>
            <td>
                <button class="button detail-btn">Detail</button>
            </td>
        `;

        const favBtn = tr.querySelector(".fav-btn") as HTMLButtonElement;
        favBtn.addEventListener("click", () => {
            toggleFavorite(book.isbn);
            renderTable(booksToDisplay);
        });

        const detailBtn = tr.querySelector(".detail-btn") as HTMLButtonElement;
        detailBtn.addEventListener("click", () => {
            window.location.href = `detail.html?isbn=${book.isbn}`;
        });

        tableBody.appendChild(tr);
    });
    updateNavCount();
}

function fillPublisherDropdown(books: Book[]) {
    // Extrahiere alle Publisher und entferne Duplikate mit Set
    const publishers = [...new Set(books.map(book => book.publisher))];

    publisherSelect.innerHTML = '<option value="-">-</option>';

    // Für jeden Publisher eine neue Option erstellen
    publishers.forEach(publisher => {
        const option = document.createElement("option");
        option.value = publisher;
        option.textContent = publisher;
        publisherSelect.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedPublisher = publisherSelect.value;

    const filteredBooks = allBooks.filter(book => {
        const matchesTitle = book.title.toLowerCase().includes(searchTerm);
        const matchesPublisher = selectedPublisher === "-" || book.publisher === selectedPublisher;
        return matchesTitle && matchesPublisher;
    });

    renderTable(filteredBooks);
}

// Event Listener registrieren
searchInput.addEventListener("input", applyFilters);
publisherSelect.addEventListener("change", applyFilters);

fetchBooks();