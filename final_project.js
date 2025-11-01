
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
      enableRemoteModule: true 
    },
    title: 'ANITRACKER', 
  });

  mainWindow.loadFile('first_screen.html'); 

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});




function getWatchlist() {
    const list = localStorage.getItem('myAnimeTrackerList');
    return list ? JSON.parse(list) : [];
}

function getStatusOptions(currentStatus) {
    const statuses = ['Watching', 'Completed', 'Plan to Watch', 'Dropped', 'On Hold'];
    return statuses.map(status => 
        `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status}</option>`
    ).join('');
}


// FIRST SCREEN LOGIC


function searchAnime() {
    const name = document.getElementById("animetitle").value;
    const type = document.getElementById("searchType").value;
    const display = document.getElementById("display");

    display.innerHTML = '<h2>Loading results...</h2>'; // Loading feedback

    const apiUrl = `https://api.jikan.moe/v4/${type}?q=${name}&limit=10`;

    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            const animeList = data.data; 
            if (animeList.length === 0) {
                display.innerHTML = `<p>No ${type} results found for that title.</p>`;
                return;
            }

            const htmlContent = animeList.map(item => `
                <div class="anime-card">
                    <img src="${item.images.webp.large_image_url}" alt="${item.title} cover">
                    <h3>${item.title}</h3>
                    <p>Score: ${item.score || 'N/A'}</p>
                    <p>Type: ${item.type || 'N/A'}</p>
                    <a href="second_screen.html?id=${item.mal_id}&type=${type}" class="view-details">View Details</a>
                </div>
            `).join('');

            display.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            display.innerHTML = '<p>An error occurred while fetching data. Please try again.</p>';
        });
}


// SECOND SCREEN LOGIC 

//
function detail_anime() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const malId = urlParams.get('id');
    const type = urlParams.get('type'); 
    
    const detailsDisplay = document.getElementById('anime-details-display');

    if (!malId || !type) { 
        detailsDisplay.innerHTML = '<p>Error: Missing anime ID or Type in URL.</p>';
        return;
    }

  
    fetch(`https://api.jikan.moe/v4/${type}/${malId}/full`) 
        .then((response) => response.json())
        .then((data) => {
            const item = data.data; 

          
            const itemDetails = {
                mal_id: item.mal_id,
                title: item.title,
                image_url: item.images.webp.small_image_url || item.images.jpg.small_image_url,
                episodes: item.episodes || item.chapters || 0,
                type: type
            };
            sessionStorage.setItem('currentAnimeDetails', JSON.stringify(itemDetails));


            detailsDisplay.innerHTML = `
                <a href="first_screen.html" class="back-btn">← Back to Search</a>
                <h2>${item.title || 'N/A'}</h2>
                <div class="detail-info-container">
                    <img src="${item.images.jpg.large_image_url}" 
                              alt="${item.title || 'N/A'} cover" 
                              style="max-width: 300px; border-radius: 5px;">
                    
                    <div>
                        <p><strong>Type:</strong> ${item.type || 'no information'}</p>
                        <p><strong>Score:</strong> ${item.score || 'no information'}</p>
                        <p><strong>Rank:</strong> ${item.rank || 'no information'}</p>
                        <p><strong>Popularity:</strong> ${item.popularity || 'no information'}</p>
                        <p><strong>Source:</strong> ${item.source || 'no information'}</p>
                        <p><strong>Rating:</strong> ${ item.rating || 'no information'}</p>
                        <p><strong>Genres:</strong> ${item.genres?.map(g => g.name).join(', ') || 'no information'}</p>
                        
                        ${type === 'anime' ? 
                            `
                            <p><strong>Episodes:</strong> ${item.episodes || 'no information'}</p>
                            <p><strong>Producers:</strong> ${item.producers?.map(g => g.name).join(', ') || 'no information'}</p>
                            <p><strong>Releases (Aired):</strong> ${item.aired?.string || item.published?.string || 'no information'}</p>
                            <p><strong>Schedule:</strong> ${item.broadcast?.string || 'no information'}</p>
                            ` 
                            : 
                            `
                            <p><strong>Chapters:</strong> ${item.chapters || 'no information'}</p>
                            <p><strong>Volumes:</strong> ${item.volumes || 'no information'}</p>
                            <p><strong>Authors:</strong> ${item.authors?.map(g => g.name).join(', ') || 'no information'}</p>
                            <p><strong>Releases (Published):</strong> ${item.aired?.string || item.published?.string || 'no information'}</p>
                            `
                        }
                    </div>
                </div>

                <button class="add-to-watchlist-btn" onclick="addToWatchlist()">Add to Watchlist</button>
                
                <h3>Synopsis</h3>
                <p>${item.synopsis}</p>
                <p><a href="${item.url}" target="_blank">Link to MyAnimeList Website</a></p>
            `;
        })
        .catch(error => {
            console.error('Error fetching details:', error);
            detailsDisplay.innerHTML = '<p>An error occurred while loading details. Please check the ID and try again.</p>';
        });
}

// Saves the current item to the watchlist in Local Storage
function addToWatchlist() {
    const detailsString = sessionStorage.getItem('currentAnimeDetails');
    if (!detailsString) {
        alert('Error: Anime details not found in session.');
        return;
    }

    const itemDetails = JSON.parse(detailsString);
    let watchlist = getWatchlist();
    
    // Check for duplicates
    const existingItem = watchlist.find(item => item.mal_id === itemDetails.mal_id);
    if (existingItem) {
        alert('Item is already in your watchlist!');
        return;
    }

    
    const newItem = {
        ...itemDetails,
        status: 'Plan to Watch', 
        progress: 0, 
        review: '', 
        dateAdded: new Date().toLocaleDateString()
    };
    
    watchlist.push(newItem);
    
    try {
        localStorage.setItem('myAnimeTrackerList', JSON.stringify(watchlist));
        alert(`Success: '${itemDetails.title}' has been added to your watchlist!`); // Success feedback 
    } catch (e) {
        alert('Error: Failed to save to local storage.'); // Failure feedback 
    }
}


//THIRD SCREEN LOGIC 

// Displays the saved watchlist items on third_screen.html
function displayWatchlist() {
    const watchlist = getWatchlist();
    const displayElement = document.getElementById('watchlist-display');

    if (watchlist.length === 0) {
        displayElement.innerHTML = '<p>Your watchlist is currently empty. Start searching to add items!</p>';
        return;
    }

    const htmlContent = watchlist.map(item => `
        <div class="anime-card watchlist-card" id="card-${item.mal_id}">
            <div class="watchlist-info">
                <img src="${item.image_url}" alt="${item.title}" style="max-width: 100px;">
                <div>
                    <h3>${item.title}</h3>
                    <p>Type: ${item.type}</p>
                    <p>Total: ${item.episodes} ${item.type === 'anime' ? 'episodes' : 'chapters'}</p>
                    <p>Added: ${item.dateAdded}</p>
                </div>
            </div>
            
            <div class="watchlist-crud">
                
                <div class="crud-control">
                    <label for="status-${item.mal_id}">Status:</label>
                    <select id="status-${item.mal_id}">
                        ${getStatusOptions(item.status)}
                    </select>
                </div>

                <div class="crud-control">
                    <label for="progress-${item.mal_id}">Progress:</label>
                    <input type="number" id="progress-${item.mal_id}" 
                           min="0" max="${item.episodes}" value="${item.progress}" 
                           placeholder="Episodes/Chapters Watched"> / ${item.episodes}
                </div>

                <div class="crud-control full-width">
                    <label for="review-${item.mal_id}">Review/Notes:</label>
                    <textarea id="review-${item.mal_id}" rows="2" placeholder="Your review or notes...">${item.review}</textarea>
                </div>

                <button onclick="updateItem(${item.mal_id})" class="update-btn">Save Changes (Update)</button>
                <button onclick="deleteItem(${item.mal_id})" class="delete-btn">Delete Item</button>
            </div>
        </div>
    `).join('');

    displayElement.innerHTML = htmlContent;
}

//  Saves progress, status, and review changes to Local Storage
function updateItem(malId) {
    let watchlist = getWatchlist();
    const itemIndex = watchlist.findIndex(item => item.mal_id === malId);

    if (itemIndex > -1) {
      
        const newStatus = document.getElementById(`status-${malId}`).value;
        const newProgress = parseInt(document.getElementById(`progress-${malId}`).value, 10);
        const newReview = document.getElementById(`review-${malId}`).value;
        const maxEpisodes = watchlist[itemIndex].episodes;

        // Input validate
        if (newProgress < 0 || newProgress > maxEpisodes) {
            alert(`Error: Progress must be between 0 and ${maxEpisodes}.`);
            return;
        }

        // Apply updates
        watchlist[itemIndex].status = newStatus;
        watchlist[itemIndex].progress = newProgress;
        watchlist[itemIndex].review = newReview;

        try {
            localStorage.setItem('myAnimeTrackerList', JSON.stringify(watchlist));
            alert(`Success: Watchlist for '${watchlist[itemIndex].title}' updated successfully!`); // Success feedback 
            displayWatchlist(); 
        } catch (e) {
            alert('Error: Failed to save updates to local storage.'); // Failure feedback 
        }
    } else {
        alert('Error: Item not found in watchlist.');
    }
}

//  Removes an item from the watchlist
function deleteItem(malId) {
    if (!confirm('Are you sure you want to remove this item from your watchlist?')) {
        return;
    }

    let watchlist = getWatchlist();
    const originalLength = watchlist.length;

    // Filter out the item to be deleted
    const newWatchlist = watchlist.filter(item => item.mal_id !== malId);

    if (newWatchlist.length < originalLength) {
        try {
            localStorage.setItem('myAnimeTrackerList', JSON.stringify(newWatchlist));
            alert(' Success: Item removed from watchlist.'); // Success feedback 
            displayWatchlist(); 
        } catch (e) {
            alert(' Error: Failed to remove item from local storage.'); // Failure feedback 
        }
    } else {
        alert(' Error: Item not found in watchlist.');
    }
}

