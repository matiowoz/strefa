// One pending timer, cancelled when motion stops or the portrait leaves the view.
export function startBlinking(change: (closed: boolean) => void, random = Math.random): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout>;
  function schedule() {
    timer = setTimeout(() => {
      if (stopped) return;
      change(true);
      timer = setTimeout(() => {
        if (stopped) return;
        change(false);
        schedule();
      }, 130);
    }, 2800 + random() * 4200);
  }
  schedule();
  return () => { stopped = true; clearTimeout(timer); change(false); };
}
