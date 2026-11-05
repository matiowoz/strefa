export type Stance = 'even' | 'lift-left' | 'left' | 'lift-right' | 'right';

// A foot is lifted before it is replanted, including the return to even support.
export function startStances(change: (stance: Stance) => void, random = Math.random): () => void {
  let resting: 'even' | 'left' | 'right' = 'even';
  let timer: ReturnType<typeof setTimeout>;
  let stopped = false;
  function schedule() {
    timer = setTimeout(() => {
      if (stopped) return;
      const side = resting === 'even' ? (random() < .5 ? 'left' : 'right') : resting;
      const target = resting === 'even' ? side : 'even';
      change(side === 'left' ? 'lift-left' : 'lift-right');
      timer = setTimeout(() => {
        if (stopped) return;
        resting = target;
        change(target);
        schedule();
      }, 600);
    }, 5500 + random() * 4000);
  }
  schedule();
  return () => { stopped = true; clearTimeout(timer); change('even'); };
}
