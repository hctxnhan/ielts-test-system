export function getPosition(range: Range | null, container: HTMLElement | null): { x: number; y: number } {
  if (!range || !container) return { x: 0, y: 0 };

  const selectionRect = range.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const x = selectionRect.left - containerRect.left;
  const y = selectionRect.top - containerRect.top;

  return {
    x,
    y: y - 60, 
  };
}

