// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This line is necessary to enable using 'chrome', otherwise eslint will complain
/*global chrome*/

chrome.storage.session.onChanged.addListener(async (changes) => {
  const lastWordChange = changes["lastWord"];

  if (!lastWordChange) {
    return;
  }

  // Fetch data from Chrome session storage
  const result = await new Promise((resolve) => {
    chrome.storage.session.get("superKey", (result) => {
      resolve(result);
    });
  });

  const key = result.superKey.key;
  const sourceLang = result.superKey.sourceLang;
  const targetLang = result.superKey.targetLang;
  console.log("Fetched key from Chrome session storage:", key);

  console.log("side-panels.js key: " + key);

  addWord(lastWordChange.newValue, sourceLang, targetLang, key);
});

async function addWord(word, sourceLang, targetLang, key) {
  console.log("adding word: " + word);

  // If the side panel was opened manually, rather than using the context menu,
  // we might not have a word to show the definition for.
  if (!word) return;

  translateTextWithGoogleTranslateAPI(word, sourceLang, targetLang)
    .then((translatedTextObject) => {
      console.log("Translated text object:", translatedTextObject);

      const translatedText =
        translatedTextObject.data.translations[0].translatedText;

      // Define the word and its definition
      const newWordDefinition = {
        word: word,
        definition: translatedText,
        createdAt: new Date().toISOString(),
        isChecked: false,
      };

      chrome.storage.local.get({ all: [] }, (result) => {
        const allData = result.all || [];

        // Find the selected entry by key
        const selectedEntryIndex = allData.findIndex(
          (item) => item.key === key
        );
        if (selectedEntryIndex !== -1) {
          const selectedEntry = allData[selectedEntryIndex];

          // Access the existing words array and other fields
          const existingWords = selectedEntry.words || [];

          // Add the new word definition to the existing list
          const updatedWords = [...existingWords, newWordDefinition];

          // Create the updated entry with the new words list
          const updatedEntry = {
            ...selectedEntry,
            words: updatedWords,
          };

          // Update the allData array with the updated entry
          const updatedAllData = [...allData];
          updatedAllData[selectedEntryIndex] = updatedEntry;

          console.log("Adding word to key:", key);
          console.log("All words:", updatedWords);

          // Store the updated allData back to local storage
          chrome.storage.local.set({ all: updatedAllData }, () => {
            console.log("Word definition added successfully!");
          });
        } else {
          console.error("Entry with key", key, "not found!");
        }
      });
    })
    .catch((error) => {
      console.error("Error while translating:", error);
    });
}

///////////////////////////////
// Call Google Translate API //
///////////////////////////////
async function translateTextWithGoogleTranslateAPI(
  sourceText,
  sourceLang,
  targetLang
) {
  const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  const requestBody = {
    q: sourceText,
    source: sourceLang,
    target: targetLang,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch translation");
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error("Translation error:", error);
    return null;
  }
}
