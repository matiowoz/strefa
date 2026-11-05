export type Stance = 'even' | 'left' | 'right';

// Always pass through even support before moving weight onto the other leg.
export function startStances(change: (stance: Stance) => void, random = Math.random): () => void {
  let current: Stance = 'even';
  let timer: ReturnType<typeof setTimeout>;
  let stopped = false;
  function schedule() {
    timer = setTimeout(() => {
      if (stopped) return;
      current = current === 'even' ? (random() < .5 ? 'left' : 'right') : 'even';
      change(current);
      schedule();
    }, 5500 + random() * 4000);
  }
  schedule();
  return () => { stopped = true; clearTimeout(timer); change('even'); };
}
