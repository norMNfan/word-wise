import React from "react";
import { Tab } from "@mui/material";
import { Link } from "react-router-dom";

const CustomTab = ({ label, to, color }) => {
  return (
    <Tab
      label={label}
      to={to}
      component={Link}
      sx={{
        color: color,
        opacity: 1,
        "&:hover": {
          color: "#212121",
        },
      }}
    />
  );
};

export default CustomTab;
