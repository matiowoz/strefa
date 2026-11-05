import { afterEach, expect, it, vi } from 'vitest';
import { startStances } from './stances';
afterEach(() => vi.useRealTimers());
it('unosi stopę przed zmianą podparcia i powrotem na obie nogi', () => {
  vi.useFakeTimers();const change = vi.fn();const stop = startStances(change, () => 0);
  vi.advanceTimersByTime(5500);expect(change).toHaveBeenLastCalledWith('lift-left');
  vi.advanceTimersByTime(599);expect(change).toHaveBeenLastCalledWith('lift-left');
  vi.advanceTimersByTime(1);expect(change).toHaveBeenLastCalledWith('left');
  vi.advanceTimersByTime(5500);expect(change).toHaveBeenLastCalledWith('lift-left');
  vi.advanceTimersByTime(600);expect(change).toHaveBeenLastCalledWith('even');
  expect(vi.getTimerCount()).toBe(1);stop();expect(vi.getTimerCount()).toBe(0);
});
it('obsługuje drugą nogę i sprząta zegar w środku kroku', () => {
  vi.useFakeTimers();const change = vi.fn();const stop = startStances(change, () => .75);
  vi.advanceTimersByTime(8500);expect(change).toHaveBeenLastCalledWith('lift-right');
  stop();expect(change).toHaveBeenLastCalledWith('even');change.mockClear();
  vi.advanceTimersByTime(60000);expect(change).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
});
