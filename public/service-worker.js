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

// The next lines are necessary to not have a build error
/* eslint-disable no-restricted-globals */

// import { precacheAndRoute } from "workbox-precaching";

// Precache assets during service worker installation
// precacheAndRoute(self.__WB_MANIFEST || []);

function setupContextMenu() {
  console.log("Setting up context");

  chrome.contextMenus.create({
    id: "define-word",
    title: "Translate",
    contexts: ["selection"],
  });

  console.log("Setting sourceLang, targetLang and key");
  chrome.storage.session.set({ sourceLang: "de" });
  chrome.storage.session.set({ targetLang: "en" });
  chrome.storage.session.set({ key: "1711534088596" });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
  console.log("Storing the last word");

  // Store the last word in chrome.storage.session.
  chrome.storage.session.set({ lastWord: data.selectionText });

  // Make sure the side panel is open.
  chrome.sidePanel.open({ tabId: tab.id });
});

// Used for debugging, logs any changes to storage
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
