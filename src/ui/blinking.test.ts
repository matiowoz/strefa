import { afterEach, expect, it, vi } from 'vitest';
import { startBlinking } from './blinking';

afterEach(() => vi.useRealTimers());
it('mruga krótko w nieregularnych odstępach i ma tylko jeden oczekujący zegar', () => {
  vi.useFakeTimers();const change = vi.fn();const random = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(1).mockReturnValue(0.5);
  const stop = startBlinking(change, random);
  vi.advanceTimersByTime(2799);expect(change).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);expect(change).toHaveBeenLastCalledWith(true);expect(vi.getTimerCount()).toBe(1);
  vi.advanceTimersByTime(129);expect(change).toHaveBeenLastCalledWith(true);
  vi.advanceTimersByTime(1);expect(change).toHaveBeenLastCalledWith(false);
  vi.advanceTimersByTime(6999);expect(change).toHaveBeenCalledTimes(2);
  vi.advanceTimersByTime(1);expect(change).toHaveBeenLastCalledWith(true);
  stop();expect(vi.getTimerCount()).toBe(0);expect(change).toHaveBeenLastCalledWith(false);
});
it('wyłączenie ruchu lub odmontowanie otwiera oczy i usuwa dalsze mrugnięcia', () => {
  vi.useFakeTimers();const change = vi.fn();const stop = startBlinking(change, () => 0);
  vi.advanceTimersByTime(2800);expect(change).toHaveBeenLastCalledWith(true);
  stop();change.mockClear();vi.advanceTimersByTime(30000);expect(change).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
});
