import './item-art.css';

// One local, transparent atlas keeps all eight illustrations in the same style.
// The order follows the atlas: four columns, two rows. No game-state changes.
const atlas: Record<string, readonly [number, number]> = {
  backpack: [0, 0],
  water: [1, 0],
  ration: [2, 0],
  bandage: [3, 0],
  scrap: [0, 1],
  'raw-water': [1, 1],
  food: [2, 1],
  cloth: [3, 1],
};

const gearAtlas: Record<string, readonly [number, number]> = { helmet: [0, 0], jacket: [1, 0], boots: [0, 1], crowbar: [1, 1] };

export function ItemArt({ itemId }: { itemId: string }) {
  const gear = gearAtlas[itemId];
  const cell = gear ?? atlas[itemId];
  if (!cell) return null;
  return <span className="item-art" aria-hidden="true" style={{
    backgroundPosition: `${cell[0] * (gear ? 100 : 100 / 3)}% ${cell[1] * 100}%`,
    ...(gear ? { backgroundImage: "url('/art/equipment-worn.webp')", backgroundSize: '200% 200%' } : {}),
  }} />;
}
