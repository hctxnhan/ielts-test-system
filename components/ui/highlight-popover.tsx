const highlightColors = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Purple", value: "#e9d5ff" },
  { name: "Orange", value: "#fed7aa" },
];

function HighlightPopover({ editor, range, onClose }) {
  return (
    <div className="absolute p-2 rounded shadow bg-white border z-50">
      {highlightColors.map((c) => (
        <button
          key={c.value}
          className="block w-full text-left p-1 hover:bg-gray-200"
          onClick={() => {
            editor
              .chain()
              .focus()
              .setTextSelection(range)
              .setHighlight({ color: c.value })
              .run();
            onClose();
          }}
        >
          {c.name}
        </button>
      ))}

      <button
        className="text-red-500 mt-2"
        onClick={() => {
          editor.chain().focus().unsetHighlight().run();
          onClose();
        }}
      >
        Remove Highlight
      </button>
    </div>
  );
}
