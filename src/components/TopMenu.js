import React from "react";
import { Box, Tabs } from "@mui/material";
import CustomTab from "./CustomTab";

const TopMenu = () => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#03a9f4" }}>
      <Tabs sx={{ marginLeft: "auto" }}>
        <CustomTab label="Current Deck" to="/" color="white" />
        <CustomTab label="Decks" to="/decks" color="white" />
        <CustomTab label="Account" to="/account" color="white" />
      </Tabs>
    </Box>
  );
};

export default TopMenu;
