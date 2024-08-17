import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TopMenu from "./components/TopMenu";
import CurrentDeck from "./components/CurrentDeck";
import Decks from "./components/Decks";
import Account from "./components/Account";

// This line is necessary to enable using 'chrome', otherwise eslint will complain
/*global chrome*/

const App = () => {
  //////////////////
  // Define state //
  //////////////////
  const [selectedKey, setSelectedKey] = useState("");
  const [superKey, setSuperKey] = useState({});

  //////////////////////////////////////
  // Function to handle state changes //
  //////////////////////////////////////
  const handleCurrentListKeyChange = (obj) => {
    console.log("Setting selectedKey to: " + obj.key);
    setSelectedKey(obj.key);

    chrome.storage.local.get({ all: [] }, (result) => {
      const allData = result.all || [];

      // Find the entry corresponding to the selected key
      const selectedEntry = allData.find((item) => item.key === obj.key);

      if (selectedEntry) {
        // Create the superKey from the selectedEntry
        const superKey = {
          key: obj.key,
          name: selectedEntry.name,
          sourceLang: selectedEntry.sourceLang,
          targetLang: selectedEntry.targetLang,
        };

        setSuperKey(superKey);

        // Set the value of 'superKey' in Chrome session storage
        chrome.storage.session.set({ superKey: superKey }, () => {
          console.log("Key set in Chrome session storage:", obj.key);
          console.log(
            "SourceLang set in Chrome session storage:",
            selectedEntry.sourceLang
          );
          console.log(
            "TargetLang set in Chrome session storage:",
            selectedEntry.targetLang
          );
        });
      }
    });
  };

  return (
    <Router>
      <TopMenu />

      <Routes>
        <Route path="/" element={<CurrentDeck superKey={superKey} />} />
        <Route
          path="/decks"
          element={
            <Decks
              selectedKeyInput={selectedKey}
              onCurrentListChange={handleCurrentListKeyChange}
            />
          }
        />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
};

export default App;
