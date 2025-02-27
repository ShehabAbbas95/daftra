import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { NavItem } from "@/types/navigation";
import { navigationService } from "@/services/navigationService";
import { NavItemComponent } from "./NavItem";
import { Stack } from "@mui/material";
import {
  Close as CloseIcon,
  Check as CheckIcon,
  MenuOutlined,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

export const Navigation = () => {
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchNavigation = async () => {
      const data = await navigationService.getNavigation();
      setNavigation(data);
    };
    fetchNavigation();
  }, []);

  const handleDragEnd = async (
    draggedId: string,
    fromIndex: number,
    toIndex: number,
    level: number,
    parentId: string | null
  ) => {
    // Track analytics
    await navigationService.trackDragAndDrop({
      id: draggedId,
      from: fromIndex,
      to: toIndex,
      level,
      parentId,
    });

    // Create a deep copy of the navigation
    const newNavigation = JSON.parse(JSON.stringify(navigation));

    if (parentId === null) {
      // Handle top-level items
      const [removed] = newNavigation.splice(fromIndex, 1);
      newNavigation.splice(toIndex, 0, removed);
      setNavigation(newNavigation);
    } else {
      // Handle nested items
      const updateChildrenOrder = (items: NavItem[]) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === parentId) {
            // Found the parent, update its children
            if (items[i].children && items[i].children!.length > 0) {
              const [removed] = items[i].children!.splice(fromIndex, 1);
              items[i].children!.splice(toIndex, 0, removed);
              return true;
            }
            return false;
          }

          // Recursively search in children
          if (items[i].children && items[i].children!.length > 0) {
            if (updateChildrenOrder(items[i].children!)) {
              return true;
            }
          }
        }
        return false;
      };

      updateChildrenOrder(newNavigation);
      setNavigation(newNavigation);
    }
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    const updateTitle = (items: NavItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          items[i].title = newTitle;
          return true;
        }

        if (items[i].children && items[i].children!.length > 0) {
          if (updateTitle(items[i].children!)) {
            return true;
          }
        }
      }
      return false;
    };

    setNavigation((prevNav) => {
      const newNav = JSON.parse(JSON.stringify(prevNav));
      updateTitle(newNav);
      return newNav;
    });
  };

  const handleVisibilityChange = (id: string) => {
    const updateVisibility = (items: NavItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          items[i].visible = !items[i].visible;
          return true;
        }

        if (items[i].children && items[i].children!.length > 0) {
          if (updateVisibility(items[i].children!)) {
            return true;
          }
        }
      }
      return false;
    };

    setNavigation((prevNav) => {
      const newNav = JSON.parse(JSON.stringify(prevNav));
      updateVisibility(newNav);
      return newNav;
    });
  };

  const handleSave = async () => {
    await navigationService.saveNavigation(navigation);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    // Reload navigation from server
    const fetchNavigation = async () => {
      const data = await navigationService.getNavigation();
      setNavigation(data);
    };
    fetchNavigation();
    setIsEditMode(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLongPress = () => {
    setTimeout(() => {
      setIsEditMode(true);
    }, 2000);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const navigationContent = (
    <>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd} // Cancel on move
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, width: "full" }}
        >
          {isMobile && (
            <IconButton onClick={handleDrawerToggle}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6">Menu</Typography>
        </Box>
        {isEditMode && (
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={handleCancel}
              sx={{
                border: "2px solid #ef4444",
                borderRadius: "50%",
                color: "#ef4444",
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(239, 68, 68, 0.04)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleSave}
              sx={{
                border: "2px solid #22c55e",
                borderRadius: "50%",
                color: "#22c55e",
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(34, 197, 94, 0.04)",
                },
              }}
            >
              <CheckIcon style={{ fontSize: "20px" }} fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Box>
      <DndProvider backend={HTML5Backend}>
        <List>
          {navigation.map((item, index) => (
            <NavItemComponent
              key={item.id}
              item={item}
              index={index}
              isEditMode={isEditMode}
              onDragEnd={handleDragEnd}
              onTitleChange={handleTitleChange}
              onVisibilityChange={handleVisibilityChange}
              level={0}
              parentId={null} // Top-level items have null parentId
              handleLongPress={handleLongPress}
            />
          ))}
        </List>
      </DndProvider>
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            top: 10,
            right: 16,
            zIndex: 1200,
            bgcolor: "background.paper",
            boxShadow: 1,
            "&:hover": {
              bgcolor: "background.paper",
            },
          }}
        >
          <MenuOutlined />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={isMobile ? handleDrawerToggle : undefined}
        anchor={isMobile ? "right" : "left"}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          width: "auto",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isMobile ? "100%" : 280,
            boxSizing: "border-box",
            border: "none",
            ...(isMobile && {
              transition: theme.transitions.create("transform", {
                duration: theme.transitions.duration.standard,
              }),
            }),
          },
        }}
      >
        {navigationContent}
      </Drawer>
    </>
  );
};
