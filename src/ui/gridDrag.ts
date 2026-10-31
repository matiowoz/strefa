// Nearest top-left cell, using the centered drag preview as the cursor anchor.
// The whole grid is a drop target, including gaps and occupied cells.
export function snapDrop(pointer: { x: number; y: number }, origin: { x: number; y: number }, grab: { x: number; y: number }, pitch: { x: number; y: number }) {
  return { x: Math.round((pointer.x - origin.x - grab.x) / pitch.x), y: Math.round((pointer.y - origin.y - grab.y) / pitch.y) };
}
