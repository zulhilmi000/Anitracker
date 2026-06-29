# Anitracker

🔗 **[Live Demo](https://anitracker.page.gd/)**

A desktop anime and manga discovery and tracking app built with **Electron**. Search titles from MyAnimeList, preview official trailers, and manage a personal watchlist with progress, status, and notes—all stored locally on your machine.

## Features
- **Search** — Look up anime series or manga by title via the [Jikan API](https://jikan.moe/) (MyAnimeList data).
- **Rich detail pages** — Scores, rankings, genres, episode/chapter counts, synopsis, and embedded YouTube trailers when available.
- **Personal watchlist** — Add titles from detail pages and track them in one place.
- **Progress tracking** — Set status (Watching, Completed, Plan to Watch, Dropped, On Hold), episode/chapter progress, and personal reviews or notes.
- **Local persistence** — Watchlist data is saved in the browser's `localStorage`; no account or server required.

## Tech stack
| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Desktop shell | [Electron](https://www.electronjs.org/) |
| UI            | HTML, CSS (`fyp.css`), JavaScript     |
| Data API      | [Jikan v4](https://docs.api.jikan.moe/) |

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- npm (included with Node.js)

## Getting started
1. **Clone or download** this repository.
2. **Install dependencies** from the project root:
```bash
   npm install
```
3. **Run the app**:
```bash
   npm start
```
   This launches the Electron window (1000×800) and opens the search screen.

## Usage
1. **Search** — On the home screen, choose **Anime Series** or **Manga Details**, enter a title, and click **Search**.
2. **View details** — Open a result to see full metadata, trailer, and synopsis. Use **Add to Watchlist** to save the entry.
3. **Manage watchlist** — Open **My Watchlist** to update status, progress, and notes, or remove items.

Data is stored under the key `myAnimeTrackerList` in `localStorage`.

## Project structure
