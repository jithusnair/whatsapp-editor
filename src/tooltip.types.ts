export interface CursorPosition {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface TooltipPosition {
  position: "TOP" | "BOTTOM" | "LEFT" | "RIGHT";
  distance: number; // distance from the selected text (in px)
}
