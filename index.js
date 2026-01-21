// 1. GLOBAL VARIABLES

var API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";


// 2. INITIAL APP STATE
var state = {
    currentWordData: null,
    savedWords: JSON.parse(localStorage.getItem("wordly_saved")) || []
};


// 3. DOM ELEMENTS TO BE MANIPULATED
var searchForm = document.getElementById("searchForm");
var wordInput = document.getElementById("wordInput");
var resultsCard = document.getElementById("results-card");
var savedSection = document.getElementById("savedSection");
var savedWordsList = document.getElementById("savedWordsList");
var toggleSavedBtn = document.getElementById("toggleSaved");
var closeSavedBtn = document.getElementById("closeSaved");


// 4. INITIALIZE APP
function init() {
    renderSavedList();
    setupEventListeners();
}

// 5. LISTEN FOR EVENTS
function setupEventListeners() {
    searchForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var word = wordInput.value.trim();
        if (word) {
            fetchWordData(word);
        }
    });

    toggleSavedBtn.onclick = function() {
        savedSection.classList.add("open");
    };

    closeSavedBtn.onclick = function() {
        savedSection.classList.remove("open");
    };
}


// 6. FUNCTIONS

// 6.1 Fetches data from API and handles errors
function fetchWordData(word) {
    resultsCard.innerHTML = ""; // Clear previous
    var loading = document.createElement("p");
    loading.textContent = "Fetching word from dictionary...";
    resultsCard.appendChild(loading);

    fetch(API_URL + word)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Term not found.");
            }
            return response.json();
        })
        .then(function(data) {
            state.currentWordData = data[0];
            renderResult(state.currentWordData);
        })
        .catch(function(err) {
            resultsCard.innerHTML = "";
            var errorMsg = document.createElement("p");
            errorMsg.className = "error-message";
            errorMsg.style.display = "block";
            errorMsg.textContent = err.message;
            resultsCard.appendChild(errorMsg);
        });
}

// 6.2 build element for displaying the data
function renderResult(data) {
    resultsCard.innerHTML = ""; 

    // 1. Title
    var h1 = document.createElement("h1");
    h1.className = "word-title";
    h1.textContent = data.word;
    resultsCard.appendChild(h1);

    // 2. Meta Info Container (Phonetic, Audio, Save)
    var metaDiv = document.createElement("div");
    metaDiv.className = "meta-info";

    var phoneticSpan = document.createElement("span");
    phoneticSpan.className = "phonetic";
    phoneticSpan.textContent = data.phonetic || "";
    metaDiv.appendChild(phoneticSpan);

    // Audio Button
    var audioUrl = null;
    for (var i = 0; i < data.phonetics.length; i++) {
        if (data.phonetics[i].audio) {
            audioUrl = data.phonetics[i].audio;
            break;
        }
    }

    if (audioUrl) {
        var listenBtn = document.createElement("button");
        listenBtn.className = "audio-btn";
        listenBtn.textContent = "Audio";
        listenBtn.onclick = function() { playAudio(audioUrl); };
        metaDiv.appendChild(listenBtn);
    }

    // Save Button
    var saveBtn = document.createElement("button");
    saveBtn.className = "audio-btn";
    saveBtn.style.borderColor = "var(--accent)";
    saveBtn.style.color = "var(--accent)";
    saveBtn.textContent = state.savedWords.indexOf(data.word) !== -1 ? "✓ Saved" : "Save";
    saveBtn.onclick = function() { toggleSaveWord(data.word); };
    metaDiv.appendChild(saveBtn);

    resultsCard.appendChild(metaDiv);

    // 3. Loop through Meanings (Parts of Speech)
    for (var j = 0; j < data.meanings.length; j++) {
        var m = data.meanings[j];
        
        var meaningBlock = document.createElement("div");
        meaningBlock.className = "meaning-block";

        var posTag = document.createElement("span");
        posTag.className = "tag";
        posTag.textContent = m.partOfSpeech;
        meaningBlock.appendChild(posTag);

        var definition = document.createElement("p");
        definition.className = "definition-text";
        definition.textContent = m.definitions[0].definition;
        meaningBlock.appendChild(definition);

        if (m.definitions[0].example) {
            var example = document.createElement("p");
            example.className = "example-text";
            example.textContent = '"' + m.definitions[0].example + '"';
            meaningBlock.appendChild(example);
        }

        // Synonyms
        if (m.synonyms && m.synonyms.length > 0) {
            var synContainer = document.createElement("div");
            synContainer.className = "synonym-container";
            
            var synLabel = document.createElement("span");
            synLabel.style.fontSize = "0.7rem";
            synLabel.style.fontWeight = "700";
            synLabel.style.textTransform = "uppercase";
            synLabel.textContent = "Synonyms: ";
            synContainer.appendChild(synLabel);

            for (var k = 0; k < Math.min(m.synonyms.length, 5); k++) {
                var synTag = document.createElement("span");
                synTag.className = "synonym-tag";
                synTag.textContent = m.synonyms[k];
                synContainer.appendChild(synTag);
            }
            meaningBlock.appendChild(synContainer);
        }

        resultsCard.appendChild(meaningBlock);
    }
}

/**
 * Handles playing the audio
 */
function playAudio(url) {
    var fullUrl = url.indexOf("http") === 0 ? url : "https:" + url;
    var audio = new Audio(fullUrl);
    audio.play();
}

/**
 * Updates State and LocalStorage for saved words
 */
function toggleSaveWord(word) {
    var index = state.savedWords.indexOf(word);
    if (index !== -1) {
        state.savedWords.splice(index, 1);
    } else {
        state.savedWords.push(word);
    }
    localStorage.setItem("wordly_saved", JSON.stringify(state.savedWords));
    renderSavedList();
    renderResult(state.currentWordData);
}

//Renders the sidebar list
function renderSavedList() {
    savedWordsList.innerHTML = "";
    for (var i = 0; i < state.savedWords.length; i++) {
        (function() {
            var word = state.savedWords[i];
            var li = document.createElement("li");
            li.textContent = word;
            li.onclick = function() { fetchWordData(word); };
            savedWordsList.appendChild(li);
        })();
    }
    toggleSavedBtn.textContent = "Favorites (" + state.savedWords.length + ")";
}


function removeWord(word) {
    var index = state.savedWords.indexOf(word);
    if (index !== -1) {
        state.savedWords.splice(index, 1); // Remove from array
        localStorage.setItem("wordly_saved", JSON.stringify(state.savedWords)); // Update storage
        renderSavedList(); // Refresh sidebar UI
        
    }
}


// start the app
init();