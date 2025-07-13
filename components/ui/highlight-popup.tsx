import React from "react";

interface HighlightPopupProps {
  top: number;
  left: number;
  onSelectColor: (color: string) => void;
  onRemoveHighlight: () => void;
}

const HIGHLIGHT_COLORS = [
  "#FEF08A",
  "#A7F3D0",
  "#BFDBFE",
  "#FBCFE8",
  "#DDD6FE",
  "#FDE68A"
];

export const HighlightPopup: React.FC<HighlightPopupProps> = ({
  top,
  left,
  onSelectColor,
  onRemoveHighlight,
}) => {
  console.log("==> top left", top, left)

  return (
  <div
    className="absolute z-50 flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-md px-3 py-2"
    style={{
      top: `${top}px`,
      left: `${left}px`,
    }}
  >
    {HIGHLIGHT_COLORS.map((color, idx) => (
      <button
        key={idx}
        onClick={() => onSelectColor(color)}
        style={{ backgroundColor: color }}
        className="w-6 h-6 rounded-md border-2 border-white hover:border-black focus:border-black"
      />
    ))}
    <div className="border-l h-6 mx-2"></div>
    <button
      onClick={onRemoveHighlight}
      className="text-red-500 hover:text-red-700 text-lg font-bold"
    >
      ×
    </button>
  </div>
);
};


