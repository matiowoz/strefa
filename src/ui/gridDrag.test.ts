import { describe, expect, it } from 'vitest';
import { snapDrop } from './gridDrag';

describe('upuszczanie na całej powierzchni siatki', () => {
  const origin = { x: 10, y: 20 }; const pitch = { x: 54, y: 54 };
  it('pozwala upuścić 1x2 na środku dwóch pól, z kursorem pośrodku podglądu', () => {
    expect(snapDrop({ x: 10 + 2 * 54 + 26, y: 20 + 3 * 54 + 53 }, origin, { x: 26, y: 53 }, pitch)).toEqual({ x: 2, y: 3 });
  });
  it('środek 2x3 trafia na właściwy początek zamiast pod kursor', () => {
    expect(snapDrop({ x: 10 + 54 + 53, y: 20 + 2 * 54 + 80 }, origin, { x: 53, y: 80 }, pitch)).toEqual({ x: 1, y: 2 });
  });
  it('szczelina między polami jest zaokrąglana do najbliższego ułożenia', () => {
    expect(snapDrop({ x: 10 + 3 * 54 + 1, y: 20 + 54 + 53 }, origin, { x: 0, y: 53 }, pitch)).toEqual({ x: 3, y: 1 });
  });
  it('nie wciska wystającego przedmiotu na siłę do siatki', () => {
    expect(snapDrop({ x: 5, y: 10 }, origin, { x: 50, y: 50 }, pitch)).toEqual({ x: -1, y: -1 });
  });
});
