import { expect, it } from 'vitest';
import { createInitialState, settleExpedition, startExpedition } from './game';
import { arrange, moveItem, splitStack, mergeStacks } from './inventory';
import { equipItem, equipmentSlot, unequipItem, wornItems } from './equipment';
import { isGameState, validateSave } from './validation';
import type { InventoryEntry } from './types';

const gear = (itemId: string, id = itemId, condition = 60): InventoryEntry => ({ id, itemId, quantity: 1, condition });
const packed = (...items: InventoryEntry[]) => { const state = createInitialState(0);return arrange({ ...state, inventory: [...state.inventory, ...items] }); };

it.each(['helmet','jacket','boots','crowbar'])('zakłada i zdejmuje %s z zachowaniem ID, stanu i bez utraty przedmiotu', (itemId) => {
  const entry = gear(itemId);const state = packed(entry);const original = structuredClone(state);const slot = equipmentSlot(entry)!;
  const equipped = equipItem(state, entry.id, slot, 100);
  expect(equipped.equipped[slot]).toEqual(entry);expect(equipped.positions[entry.id]).toBeUndefined();
  expect(equipped.inventory.some((item) => item.id === entry.id)).toBe(false);expect(wornItems(equipped)).toEqual([entry]);
  expect(isGameState(equipped)).toBe(true);expect(equipped.hero).toEqual(state.hero);expect(equipped.backpack).toEqual(state.backpack);
  expect(equipItem(equipped, entry.id, slot, 101)).toBe(equipped);
  const removed = unequipItem(equipped, entry.id, undefined, 200);
  expect(removed.inventory).toContainEqual(entry);expect(removed.equipped[slot]).toBeNull();expect(isGameState(removed)).toBe(true);
  expect(unequipItem(removed, entry.id)).toBe(removed);expect(state).toEqual(original);
});

it('wymienia dwa egzemplarze, zachowując ich różne ID i stan', () => {
  const old = gear('helmet','old',30), next = gear('helmet','new',80);
  const state = equipItem(packed(old,next),'old','head',100);
  const position = state.positions.new;
  const result = equipItem(state,'new','head',200);
  expect(result.equipped.head).toEqual(next);expect(result.inventory).toContainEqual(old);
  expect(result.inventory.some((entry) => entry.id === 'new')).toBe(false);
  expect(result.positions.old).toEqual(position);expect(isGameState(result)).toBe(true);
});

it('zdejmuje do wskazanego prostokąta, ale kolizja i wystawanie niczego nie zmieniają', () => {
  const state = equipItem(packed(gear('jacket')),'jacket','body',100);
  expect(unequipItem(state,'jacket',{x:4,y:8},200)).toBe(state);
  expect(unequipItem(state,'jacket',state.positions['starter-water'],200)).toBe(state);
  const removed = unequipItem(state,'jacket',{x:0,y:5},200);
  expect(removed.positions.jacket).toEqual({x:0,y:5,page:-1});expect(isGameState(removed)).toBe(true);
});

it('pełny plecak nie zdejmuje rzeczy do skrytki ani odbioru; wymiana wykorzystuje zwolnione pola', () => {
  const initial = createInitialState(0);
  const full = arrange({ ...initial, inventory:Array.from({length:45},(_,i)=>({id:`b-${i}`,itemId:'bandage',quantity:1,condition:null})), positions:{}, equipped:{...initial.equipped,head:gear('helmet','old')} });
  expect(unequipItem(full,'old',undefined,100)).toBe(full);
  const entries = [gear('helmet','new'), ...Array.from({length:41},(_,i)=>({id:`b-${i}`,itemId:'bandage',quantity:1,condition:null}))];
  const ready = arrange({...full,inventory:entries,positions:{}});
  expect(ready.stash).toHaveLength(0);
  const swapped = equipItem(ready,'new','head',200);
  expect(swapped.equipped.head?.id).toBe('new');expect(swapped.inventory.some(e=>e.id==='old')).toBe(true);
  expect(swapped.stash).toEqual(ready.stash);expect(swapped.overflow).toEqual(ready.overflow);expect(isGameState(swapped)).toBe(true);
});

it('odrzuca zły slot, zapasy, plecak oraz rzecz pozostawioną w skrytce', () => {
  const state=packed(gear('helmet'));
  expect(equipItem(state,'helmet','feet')).toBe(state);expect(equipItem(state,'starter-water','head')).toBe(state);
  expect(equipItem(state,state.backpack.id,'head')).toBe(state);expect(unequipItem(state,state.backpack.id)).toBe(state);
  const stored=moveItem(state,'helmet',0,undefined,100);expect(equipItem(stored,'helmet','head',200)).toBe(stored);
  expect(mergeStacks(state,'helmet','starter-water')).toBe(state);expect(()=>splitStack(state,'helmet',1)).toThrow();
});

it('nie zmienia wyposażenia w drodze; wraca z tym samym sprzętem', () => {
  const state=equipItem(packed(gear('boots'),gear('crowbar')),'boots','feet',100);
  const trip=startExpedition(state,1000,()=>.5);
  expect(()=>equipItem(trip,'crowbar','weapon',2000)).toThrow('powrocie');expect(()=>unequipItem(trip,'boots',undefined,2000)).toThrow('powrocie');
  const returned=settleExpedition(trip,trip.activeExpedition!.id,61000);
  expect(returned.equipped).toEqual(state.equipped);expect(returned.hero).toEqual(state.hero);
  expect(isGameState(equipItem(returned,'crowbar','weapon',62000))).toBe(true);
});

it('nie zapisuje niezgodnego slotu, powielonego ID, stosu sprzętu i błędnego stanu', () => {
  const state=equipItem(packed(gear('helmet')),'helmet','head',100);
  expect(isGameState({...state,equipped:{...state.equipped,feet:state.equipped.head}})).toBe(false);
  expect(isGameState({...state,equipped:{...state.equipped,head:{...state.equipped.head!,id:'starter-water'}}})).toBe(false);
  expect(isGameState({...state,equipped:{...state.equipped,head:{...state.equipped.head!,quantity:2}}})).toBe(false);
  expect(isGameState({...state,equipped:{...state.equipped,head:{...state.equipped.head!,condition:101}}})).toBe(false);
  expect(isGameState({...state,equipped:{}})).toBe(false);
});

it('migruje v8 bez zmiany wyprawy, raportu, rzeczy i położeń', () => {
  const trip=startExpedition(createInitialState(0),1000,()=>.5);
  const {equipped:_,...old}=trip;
  const loaded=validateSave({...old,schemaVersion:8});expect(loaded).toEqual({...trip, activeExpedition:{...trip.activeExpedition, health:null}});
  expect(()=>validateSave({...old,schemaVersion:8,positions:{}})).toThrow();
});

it('losuje sprzęt przy starcie i przyznaje osobne egzemplarze tylko raz, także w pełnych siatkach', () => {
  const values=[.5,.5,.5,.5,.99,.5,.1,.1,.1,.1,.99,.99];let i=0;
  const trip=startExpedition(createInitialState(0),1000,()=>values[i++]);
  expect(trip.activeExpedition!.cargo.loot).toContainEqual({itemId:'jacket',quantity:1});
  expect(trip.activeExpedition!.cargo.loot).toContainEqual({itemId:'helmet',quantity:1});
  expect(isGameState(trip)).toBe(true);
  const result=settleExpedition(validateSave(JSON.parse(JSON.stringify(trip))),trip.activeExpedition!.id,61000);
  const found=result.inventory.filter(e=>['jacket','helmet'].includes(e.itemId));expect(found).toHaveLength(2);
  expect(found.every(e=>e.quantity===1&&e.condition===60)).toBe(true);expect(new Set(found.map(e=>e.id)).size).toBe(2);
  expect(settleExpedition(result,trip.activeExpedition!.id,999999)).toBe(result);expect(isGameState(result)).toBe(true);
  const crowded=arrange({...trip,inventory:Array.from({length:117},(_,i)=>({id:`b-${i}`,itemId:'bandage',quantity:1,condition:null})),positions:{}});
  const overflow=settleExpedition(crowded,trip.activeExpedition!.id,61000);expect(overflow.overflow.filter(e=>['jacket','helmet'].includes(e.itemId))).toHaveLength(2);expect(isGameState(overflow)).toBe(true);
});

it('odrzuca sprzęt z niewłaściwego zdarzenia, stos sprzętu i błędne losowanie bonusu', () => {
  const state=createInitialState(0);
  const invalidRoll=[.5,.5,.5,.5,.99,.5,.1,NaN];let index=0;
  expect(()=>startExpedition(state,1000,()=>invalidRoll[index++])).toThrow('losowanie');
  const values=[.5,.5,.5,.5,.99,.5,.1,.1,.1,.1,.99,.99];index=0;
  const trip=startExpedition(state,1000,()=>values[index++]);
  const bad=structuredClone(trip);bad.activeExpedition!.events![0].loot.push({itemId:'crowbar',quantity:1});bad.activeExpedition!.cargo.loot.push({itemId:'crowbar',quantity:1});
  expect(isGameState(bad)).toBe(false);
  const stacked=structuredClone(trip);stacked.activeExpedition!.cargo.loot.find(e=>e.itemId==='helmet')!.quantity=2;
  expect(isGameState(stacked)).toBe(false);expect(state).toEqual(createInitialState(0));
});
