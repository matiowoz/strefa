import { afterEach, expect, it, vi } from 'vitest';
import { startStances } from './stances';
afterEach(() => vi.useRealTimers());
it('przechodzi przez równy rozkład ciężaru między lewą i prawą nogą', () => {
  vi.useFakeTimers();const change = vi.fn();
  const random = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValueOnce(1).mockReturnValue(0);
  const stop = startStances(change, random);
  vi.advanceTimersByTime(5499);expect(change).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);expect(change).toHaveBeenLastCalledWith('left');
  vi.advanceTimersByTime(5500);expect(change).toHaveBeenLastCalledWith('even');
  vi.advanceTimersByTime(5500);expect(change).toHaveBeenLastCalledWith('right');
  expect(vi.getTimerCount()).toBe(1);stop();expect(change).toHaveBeenLastCalledWith('even');expect(vi.getTimerCount()).toBe(0);
});
it('sprzątanie przy wyłączeniu ruchu nie zostawia zmian pozycji w tle', () => {
  vi.useFakeTimers();const change = vi.fn();const stop = startStances(change, () => .5);
  stop();change.mockClear();vi.advanceTimersByTime(60000);expect(change).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
});
