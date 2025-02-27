import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const Header: React.FC = () => {
  return (
    <AppBar position="static" className="bg-green-600">
      <Toolbar>
        <Typography variant="h6" component="div" className="font-bold">
          iZAM
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
