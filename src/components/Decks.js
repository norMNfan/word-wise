import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Radio,
  Fab,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  TableContainer,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import languages from "../languages.json";

// This line is necessary to enable using 'chrome', otherwise eslint will complain
/*global chrome*/

const Decks = ({ selectedKeyInput, onCurrentListChange }) => {
  const [allWordLists, setAllWordLists] = useState([]);
  const [open, setOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [selectedKey, setSelectedKey] = useState(selectedKeyInput);
  const [anchorEl, setAnchorEl] = useState({});

  const handleClick = (event, key) => {
    setAnchorEl((prevAnchorEl) => ({
      ...prevAnchorEl,
      [key]: event.currentTarget,
    }));
  };

  const handleCloseButton = (key) => {
    setAnchorEl((prevAnchorEl) => ({
      ...prevAnchorEl,
      [key]: null,
    }));
  };

  useEffect(() => {
    // Fetch data from Chrome storage local
    chrome.storage.local.get({ all: [] }, (result) => {
      setAllWordLists(result.all);
    });
  }, []);

  const handleAddButtonClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    const timestamp = new Date().getTime();
    const newData = {
      key: timestamp.toString(),
      name: nameInput,
      sourceLang,
      targetLang,
      words: [],
    };

    // Fetch existing data from Chrome storage
    chrome.storage.local.get({ all: [] }, (result) => {
      const allData = result.all || [];
      const updatedData = [...allData, newData];

      // Set the updated data back to Chrome storage
      chrome.storage.local.set({ all: updatedData }, () => {
        console.log("New data added successfully!");
        // Trigger a re-render by updating a state variable
        setAllWordLists(updatedData);
        setOpen(false);
        // Reset state variables
        setNameInput("");
        setSourceLang("");
        setTargetLang("");
      });
    });
  };

  const handleRename = (key) => {
    console.log("handleRename key: " + key);

    // Prompt the user to enter a new name
    const newName = window.prompt("Enter a new name:");

    if (newName !== null && newName !== "") {
      // Update the entry in the local state
      const updatedWordLists = allWordLists.map((item) =>
        item.key === key ? { ...item, name: newName } : item
      );
      setAllWordLists(updatedWordLists);

      // Close the actions dropdown menu
      handleCloseButton();

      // Update the entry in Chrome storage
      chrome.storage.local.get({ all: [] }, (result) => {
        const allData = result.all || [];
        const updatedData = allData.map((item) =>
          item.key === key ? { ...item, name: newName } : item
        );
        chrome.storage.local.set({ all: updatedData }, () => {
          console.log("Entry renamed successfully!");
        });
      });
    }
  };

  const handleExport = (key) => {
    console.log("handleExport key: " + key);

    // Find the allWordsLists entry that matches the key
    const exportTarget = allWordLists.find((item) => item.key === key);

    // Access the value of the key if exportTarget is not undefined
    const exportWordList = exportTarget ? exportTarget.words : undefined;

    if (exportWordList) {
      // Convert the word list to a CSV string
      const csv = exportWordList
        .map((entry) => `${entry.word},${entry.definition}`)
        .join("\n");

      // Create a Blob object from the CSV string
      const blob = new Blob([csv], { type: "text/csv" });

      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a link element
      const a = document.createElement("a");
      a.href = url;

      // Set the filename for the download
      a.download = `word_list_${key}.csv`;

      // Simulate a click on the link to trigger the download
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
    } else {
      console.error("Word list not found for the provided key.");
    }
  };

  const handleDelete = (key) => {
    console.log("handleDelete key: " + key);

    const confirmed = window.confirm(
      "Are you sure you want to delete this entry?"
    );

    if (confirmed) {
      // Fetch existing data from Chrome storage
      chrome.storage.local.get({ all: [] }, (result) => {
        const allData = result.all || [];
        // Filter out the entry with the matching key
        const updatedList = allData.filter((item) => item.key !== key);

        // Set the updated data back to Chrome storage
        chrome.storage.local.set({ all: updatedList }, () => {
          console.log("Entry deleted successfully!");
          // Update state with the updated list
          setAllWordLists(updatedList);
        });
      });
    }
  };

  const handleRadioChange = (event) => {
    const selectedKey = event.target.value; // Get the selected key from the event
    setSelectedKey(selectedKey); // Set the selected key
    onCurrentListChange({ key: selectedKey }); // Call the onCurrentListChange callback with the selected key
  };

  return (
    <Container>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="all decks">
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Name</TableCell>
              <TableCell></TableCell>
              <TableCell>Num Words</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allWordLists.map((element) => (
              <TableRow
                key={element.key}
                style={{
                  backgroundColor:
                    selectedKey === element.key ? "#f0f0f0" : "inherit",
                }}
              >
                <TableCell>
                  <Radio
                    checked={selectedKey === element.key}
                    onChange={handleRadioChange}
                    value={element.key}
                  />
                </TableCell>
                <TableCell>{element.name}</TableCell>
                <TableCell>
                  {element.sourceLang}
                  <KeyboardDoubleArrowRightIcon />
                  {element.targetLang}
                </TableCell>
                <TableCell>{element.words.length}</TableCell>
                <TableCell>
                  <Button onClick={(event) => handleClick(event, element.key)}>
                    Actions
                    <ArrowDropDownIcon />
                  </Button>

                  <Menu
                    anchorEl={anchorEl[element.key]}
                    open={Boolean(anchorEl[element.key])}
                    onClose={() => handleCloseButton(element.key)}
                  >
                    <MenuItem
                      onClick={() => {
                        handleRename(element.key);
                      }}
                    >
                      Rename
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleExport(element.key);
                      }}
                    >
                      Export
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDelete(element.key);
                      }}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Fab
        color="primary"
        onClick={handleAddButtonClick}
        style={{ position: "fixed", bottom: "16px", right: "16px" }}
      >
        <AddIcon />
      </Fab>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Add New List</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Source Language</InputLabel>
            <Select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              {languages.map((language) => (
                <MenuItem key={language.value} value={language.value}>
                  <span>{language.icon}</span> {language.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Target Language</InputLabel>
            <Select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {languages.map((language) => (
                <MenuItem key={language.value} value={language.value}>
                  <span>{language.icon}</span> {language.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!sourceLang || !targetLang}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Decks;
