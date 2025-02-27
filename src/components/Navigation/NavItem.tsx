import { useRef, useState } from "react";
import {
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
} from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import {
  DragIndicator,
  Edit as EditIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { NavItem } from "@/types/navigation";

interface NavItemProps {
  item: NavItem & {
    visible: boolean;
    children?: NavItem[];
  };
  index: number;
  level?: number;
  parentId?: string | null;
  isEditMode: boolean;
  onDragEnd: (
    id: string,
    fromIndex: number,
    toIndex: number,
    level: number,
    parentId: string | null
  ) => void;
  onTitleChange: (id: string, newTitle: string) => void;
  onVisibilityChange: (id: string) => void;
  handleLongPress: () => void;
}

export const NavItemComponent = ({
  item,
  index,
  isEditMode,
  onDragEnd,
  onTitleChange,
  onVisibilityChange,
  level = 0,
  parentId = null,
  handleLongPress,
}: NavItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress();
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Create a unique type for each level AND parent to prevent dragging between different hierarchies
  const itemType = `NAV_ITEM_LEVEL_${level}_PARENT_${parentId || "root"}`;

  const [{ isDragging }, drag] = useDrag({
    type: itemType,
    item: () => ({
      id: item.id,
      originalIndex: index,
      level,
      parentId,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => isEditMode, // Only allow dragging in edit mode
    end: (draggedItem, monitor) => {
      // If the drop was not successful, we don't need to do anything
      if (!monitor.didDrop()) {
        return;
      }

      // The drop result contains the final index where the item was dropped
      const dropResult = monitor.getDropResult<{
        index: number;
        level: number;
        parentId: string | null;
      }>();

      if (
        dropResult &&
        draggedItem.originalIndex !== dropResult.index &&
        draggedItem.level === dropResult.level &&
        draggedItem.parentId === dropResult.parentId
      ) {
        onDragEnd(
          draggedItem.id,
          draggedItem.originalIndex,
          dropResult.index,
          draggedItem.level,
          draggedItem.parentId
        );
      }
    },
  });

  const [, drop] = useDrop({
    // Only accept items from the same level and parent
    accept: itemType,
    hover: (
      draggedItem: {
        id: string;
        originalIndex: number;
        level: number;
        parentId: string | null;
      },
      monitor
    ) => {
      if (!ref.current || !isEditMode) return;

      // Only allow hovering if the levels and parents match
      if (draggedItem.level !== level || draggedItem.parentId !== parentId)
        return;

      const dragIndex = draggedItem.originalIndex;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Update the index for visual feedback, but don't call onDragEnd yet
      draggedItem.originalIndex = hoverIndex;
    },
    drop: () => {
      // Return the current index, level and parentId so the end handler in useDrag can use it
      return { index, level, parentId };
    },
  });

  drag(drop(ref));

  return (
    <>
      <ListItem
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        component="div"
        ref={ref}
        sx={{
          opacity: isDragging ? 0.5 : 1,
          cursor: isEditMode && !isEditing ? "move" : "default",
          px: 2,
          pl: level > 0 ? `${level * 16 + 32}px` : 2,
          bgcolor: "background.paper",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            background: level === 0 ? "#F5F5F5" : "transparent",
            padding: "12px",
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isEditMode && !isEditing && (
              <IconButton size="small">
                <DragIndicator sx={{ color: "text.secondary", fontSize: 18 }} />
              </IconButton>
            )}
          </Box>

          {isEditing ? (
            <TextField
              value={item.title}
              onChange={(e) => onTitleChange(item.id, e.target.value)}
              variant="standard"
              fullWidth
              sx={{ mx: 2 }}
              autoFocus
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                }
              }}
            />
          ) : (
            <ListItemText
              primary={item.title}
              sx={{
                ml: 1,
                "& .MuiListItemText-primary": {
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: item.visible ? "text.primary" : "text.disabled",
                },
              }}
            />
          )}

          <Box
            sx={{ ml: "auto", display: "flex", gap: 0.5, alignItems: "center" }}
          >
            {item.children && item.children.length > 0 && (
              <IconButton
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ExpandLessIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                ) : (
                  <ExpandMoreIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                )}
              </IconButton>
            )}
            {isEditMode && (
              <>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? (
                    <CheckIcon sx={{ fontSize: 18, color: "success.main" }} />
                  ) : (
                    <EditIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onVisibilityChange(item.id)}
                >
                  {item.visible ? (
                    <VisibilityIcon
                      sx={{ fontSize: 18, color: "primary.main" }}
                    />
                  ) : (
                    <VisibilityOffIcon
                      sx={{ fontSize: 18, color: "text.disabled" }}
                    />
                  )}
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      </ListItem>

      {isExpanded && item.children && item.children.length > 0 && (
        <Box>
          {item.children.map((child, childIndex) => (
            <NavItemComponent
              key={child.id}
              item={{ ...child, visible: child.visible ?? true }}
              index={childIndex}
              isEditMode={isEditMode}
              onDragEnd={onDragEnd}
              onTitleChange={onTitleChange}
              onVisibilityChange={onVisibilityChange}
              level={level + 1}
              parentId={item.id} // Pass the current item's ID as the parent ID for children
              handleLongPress={handleLongPress}
            />
          ))}
        </Box>
      )}
    </>
  );
};
