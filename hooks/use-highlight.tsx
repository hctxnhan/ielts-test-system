"use client";


import { useEffect, useState } from "react";


const DEFAULT_HIGHLIGHT_COLOR = "#FEF08A";


export function useHighlightHandler(
 contentRef: React.RefObject<HTMLDivElement | null>,
 getPosition: (range: Range | null, container: HTMLElement | null) => { x: number; y: number }
) {
 const [popover, setPopover] = useState<{
   top: number;
   left: number;
   range: Range;
 } | null>(null);


 const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_HIGHLIGHT_COLOR);


 //debug
 // function createDebugBox({ x, y }: { x: number; y: number }) {
 //   const existingBox = document.getElementById("debug-highlight-box");
 //   if (existingBox) {
 //     existingBox.style.left = `${x}px`;
 //     existingBox.style.top = `${y}px`;
 //     return;
 //   }
 //   const box = document.createElement("div");
 //   box.id = "debug-highlight-box";
 //   box.style.position = "absolute";
 //   box.style.left = `${x}px`;
 //   box.style.top = `${y}px`;
 //   box.style.width = "10px";
 //   box.style.height = "10px";
 //   box.style.backgroundColor = "red";
 //   box.style.border = "1px solid black";
 //   box.style.zIndex = "9999";
 //   box.style.pointerEvents = "none";
 //   document.body.appendChild(box);
 // }


 useEffect(() => {
   const handleMouseUp = () => {
     const selection = window.getSelection();
     if (!selection || selection.rangeCount === 0) return;
     const range = selection.getRangeAt(0);
     const selectedText = selection.toString();


     if (
       !selectedText.trim() ||
       range.startContainer?.parentElement?.closest("input") ||
       range.endContainer?.parentElement?.closest("input")
     ) {
       setPopover(null);
       return;
     }
     const span = document.createElement("mark");
     span.style.backgroundColor = selectedColor;
     span.className = "custom-highlight";


     try {
       range.surroundContents(span);
     } catch (err) {
       // console.warn("Failed to highlight range:", err);
       return;
     }
     const popupPosition = getPosition(range, contentRef.current);
     setPopover({
       top: popupPosition.y,
       left: popupPosition.x,
       range,
     })
   };


   const container = contentRef?.current;
   if (!container) return;


   container.addEventListener("mouseup", handleMouseUp);


   return () => {
     container.removeEventListener("mouseup", handleMouseUp);
   };
 }, [selectedColor, contentRef, getPosition]);


 const applyHighlight = (color: string) => {
   setSelectedColor(color);
   if (!popover) return;
   const span = document.createElement("mark");
   span.style.backgroundColor = color;
   span.className = "custom-highlight";
   try {
     popover.range.surroundContents(span);
   } catch (err) {
     console.warn("Failed to apply highlight:", err);
   }
   setPopover(null);
 };


 const removeHighlight = () => {
   const selection = window.getSelection();
   if (!selection || selection.rangeCount === 0) return;


   const range = selection.getRangeAt(0);
   const selectedText = selection.toString();


   const clonedContent = range.cloneContents();
   const markElements = clonedContent.querySelectorAll("mark.custom-highlight");


   if (!markElements.length) return;


   markElements.forEach((mark) => {
     const originalMark = [...document.querySelectorAll("mark.custom-highlight")]
       .find((el) => el.textContent === mark.textContent);


     if (originalMark) {
       const textNode = document.createTextNode(originalMark.textContent || "");
       originalMark.replaceWith(textNode);
     }
   });


   selection.removeAllRanges();
   setPopover(null);
 };




 return {
   popover,
   applyHighlight,
   removeHighlight,
   selectedColor,
 };
}


