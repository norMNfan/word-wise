// CurrentDeck.js
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// This line is necessary to enable using 'chrome', otherwise eslint will complain
/*global chrome*/
const CurrentDeck = ({ superKey }) => {
  const [wordList, setWordList] = useState([]);

  /////////////////////////////////////////////////////
  // Updates wordList when chrome.storage is updated //
  /////////////////////////////////////////////////////
  useEffect(() => {
    // Define a function to handle changes in storage
    const handleStorageChange = (changes, area) => {
      if (area === "local") {
        // Check if the changes include the "all" key
        if (changes.hasOwnProperty("all")) {
          const newData = changes.all.newValue || [];
          const vocabList = newData.filter((item) => item.key === superKey.key);

          // Update the word list based on the changes
          if (vocabList.length > 0 && vocabList[0].words) {
            setWordList(vocabList[0].words);
          } else {
            setWordList([]);
          }
        }
      }
    };

    // Add the event listener
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Fetch initial data from Chrome storage
    chrome.storage.local.get({ all: [] }, (result) => {
      const allData = result.all || [];
      const vocabList = allData.filter((item) => item.key === superKey.key);

      // Set the initial word list
      if (vocabList.length > 0 && vocabList[0].words) {
        setWordList(vocabList[0].words);
      } else {
        setWordList([]);
      }
    });

    // Clean up by removing the event listener when the component unmounts
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [superKey.key]);

  ////////////////////////////////////
  // Deletes a word in the wordList //
  ////////////////////////////////////
  const handleDelete = (entry) => {
    console.log("Deleting word:", entry.word);

    // Fetch existing data from Chrome storage
    chrome.storage.local.get({ all: [] }, (result) => {
      const allData = result.all || [];

      // Filter out the word from the corresponding entry in allData
      const updatedAllData = allData.map((item) => {
        if (item.key === superKey.key) {
          const updatedWords = item.words.filter(
            (wordEntry) => wordEntry.word !== entry.word
          );
          return {
            ...item,
            words: updatedWords,
          };
        }
        return item;
      });

      // Update the specific entry in local storage
      chrome.storage.local.set({ all: updatedAllData }, () => {
        console.log("Word list updated successfully!");

        // Update state with the updated list
        setWordList(
          updatedAllData.find((item) => item.key === superKey.key)?.words || []
        );
      });
    });
  };

  return (
    <Container>
      <Typography variant="h4">{superKey.name}</Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Word</TableCell>
              <TableCell align="left">Definition</TableCell>
              <TableCell align="left"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wordList
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt in descending order
              .map((entry, index) => (
                <TableRow key={index}>
                  <TableCell align="left">{entry.word}</TableCell>
                  <TableCell align="left">{entry.definition}</TableCell>
                  <TableCell align="left" size="small">
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleDelete(entry)}
                    >
                      <DeleteIcon sx={{ fontSize: "small" }} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CurrentDeck;
