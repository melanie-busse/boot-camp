import { Book } from "./models/Book.js";
import { getFavorites, toggleFavorite, updateNavCount } from "./services/favorites-service.js";

const API_URL = "http://localhost:4730/books";

const tableBody = document.querySelector("tbody") as HTMLTableSectionElement;
const headline = document.querySelector("h2") as HTMLHeadingElement;
const searchInput = document.querySelector("#search") as HTMLInputElement;
const publisherSelect = document.querySelector("#by-publisher") as HTMLSelectElement;

let allFavoritesBooks: Book[] = [];
async function loadFavorites() {
    const favoriteIsbns = getFavorites();

    try {
        const response = await fetch(API_URL);
        const allBooks: Book[] = await response.json();
        allFavoritesBooks = allBooks.filter(book => favoriteIsbns.includes(book.isbn));

        renderFavTable(allFavoritesBooks);
        fillPublisherDropdown(allFavoritesBooks);
    } catch (e) {
        console.error("Fehler beim Laden der Favoriten", e);
    }
}

function renderFavTable(books: Book[]) {
    tableBody.innerHTML = "";
    headline.textContent = `${books.length} Favorites on your list`;

    books.forEach(book => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <button class="button button-clear fav-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="fav">
                        <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" />
                    </svg>
                </button>
            </td>
            <td>${book.title}</td>
            <td>${book.isbn}</td>
            <td>${book.author}</td>
            <td>${book.publisher}</td>
            <td><button class="button detail-btn">Detail</button></td>
        `;

        const favoriteButton = tr.querySelector(".fav-btn") as HTMLButtonElement;
        favoriteButton.addEventListener("click", () => {
            toggleFavorite(book.isbn);
            loadFavorites();
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

    const filteredBooks = allFavoritesBooks.filter(book => {
        const matchesTitle = book.title.toLowerCase().includes(searchTerm);
        const matchesPublisher = selectedPublisher === "-" || book.publisher === selectedPublisher;
        return matchesTitle && matchesPublisher;
    });

    renderFavTable(filteredBooks);
}

// Event Listener registrieren
searchInput.addEventListener("input", applyFilters);
publisherSelect.addEventListener("change", applyFilters);


loadFavorites();