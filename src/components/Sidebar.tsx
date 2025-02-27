import React from "react";
import { List, ListItem, ListItemText } from "@mui/material";

const Sidebar: React.FC = () => {
  const menuItems = [
    "Dashboard",
    "Job application",
    "Qualifications",
    "About",
    "Contact",
  ];

  return (
    <div className="w-60 bg-gray-100 h-full shadow-md">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <List>
          {menuItems.map((text) => (
            <ListItem key={text} className="hover:bg-gray-200 rounded">
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default Sidebar;
