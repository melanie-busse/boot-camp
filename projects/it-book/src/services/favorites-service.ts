const STORAGE_KEY = "it-book-favs";

export function getFavorites(): string[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function toggleFavorite(isbn: string): void {
    let favorites = getFavorites();

    if (favorites.includes(isbn)) {
        favorites = favorites.filter(id => id !== isbn);
    } else {
        favorites.push(isbn);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    updateNavCount();
}

export function updateNavCount(): void {
    const countSpan = document.querySelector(".mainnav-number");
    if (countSpan) {
        countSpan.textContent = getFavorites().length.toString();
    }
}