import { expect, it } from 'vitest';
import { createInitialState, settleExpedition, startExpedition } from './game';
import { arrange, moveItem } from './inventory';
import { equipItem } from './equipment';
import { expeditionDuration, illnessRules, isSick } from './illness';
import { useItem } from './useItem';
import { isGameState, validateSave } from './validation';

const medicine = () => { const s=createInitialState(0);return arrange({...s,inventory:[...s.inventory,{id:'med',itemId:'antibiotic',quantity:2,condition:null},{id:'coat',itemId:'jacket',quantity:1,condition:60}]}); };
const risk = (chance:number) => {let i=0;return ()=>i++===0?0:chance;}; // blocked road, then the exposure roll

it.each([0,.499999,.5,.999999])('próg 50/50: los %s',chance=>{
  const s=createInitialState(0),trip=startExpedition(s,1000,risk(chance));
  expect(trip.activeExpedition!.health?.contracted).toBe(chance<.5);
  expect(isSick(trip,1000)).toBe(false);
  expect(isSick(trip,61000)).toBe(chance<.5);
  expect(trip.activeExpedition!.expectedReturnAt).toBe(61000);
  expect(isGameState(trip)).toBe(true);expect(s.illness).toBeNull();
});

it.each(['worn','carried','stash'])('chroni założona kurtka, wariant %s',where=>{
  let s=medicine();if(where==='worn')s=equipItem(s,'coat','body',0);if(where==='stash')s=moveItem(s,'coat',0,undefined,0);
  const trip=startExpedition(s,1000,risk(0));expect(trip.activeExpedition!.health?.contracted).toBe(where!=='worn');
  expect(trip.equipped).toEqual(s.equipped);expect(trip.hero).toEqual(s.hero);
});

it('choroba ustępuje dokładnie po czasie, także bez odbioru raportu i po nieobecności',()=>{
  const trip=startExpedition(createInitialState(0),1000,risk(0));
  const end=61000+illnessRules.durationMs;
  expect(trip.illness).toEqual({startedAt:61000,endsAt:end});expect(isSick(trip,61000)).toBe(true);expect(isSick(trip,end-1)).toBe(true);expect(isSick(trip,end)).toBe(false);
  const loaded=validateSave(JSON.parse(JSON.stringify(trip)));
  const result=settleExpedition(loaded,trip.activeExpedition!.id,end+1000);
  expect(isSick(result,end+1000)).toBe(false);expect(result.lastReport!.health?.contracted).toBe(true);
});

it('choroba wydłuża wyjście o 50%, nie przedłuża samej choroby i nie zmienia terminu po wyzdrowieniu',()=>{
  const base=createInitialState(0);const sick={...base,illness:{startedAt:0,endsAt:2000}};
  const trip=startExpedition(sick,1000,()=>.5);expect(trip.activeExpedition!.expectedReturnAt).toBe(91000);
  expect(trip.activeExpedition!.health).toMatchObject({sickAtStart:true,contracted:false});expect(trip.illness).toEqual(sick.illness);
  expect(expeditionDuration(sick,60000,1000)).toBe(90000);expect(expeditionDuration(sick,60000,2000)).toBe(60000);
  const returned=settleExpedition(trip,trip.activeExpedition!.id,91000);expect(startExpedition(returned,92000,()=>.5).activeExpedition!.expectedReturnAt).toBe(152000);
});

it.each(['carried','stash'])('antybiotyk z %s leczy raz, zużywa jedną sztukę i skraca następne wyjście',where=>{
  let s={...medicine(),illness:{startedAt:0,endsAt:100000}};if(where==='stash')s=moveItem(s,'med',0,undefined,100) as typeof s;
  const next=useItem(s,'med',1000);expect(next.illness).toBeNull();expect([...next.inventory,...next.stash].find(e=>e.id==='med')?.quantity).toBe(1);
  expect(useItem(next,'med',1001)).toBe(next);expect(expeditionDuration(next,60000,1001)).toBe(60000);expect(isGameState(next)).toBe(true);
});

it('nie marnuje antybiotyku zdrowej postaci; ostatnia sztuka zwalnia pole',()=>{
  const s=medicine();expect(useItem(s,'med',1000)).toBe(s);
  const sick={...s,illness:{startedAt:0,endsAt:10000},inventory:s.inventory.map(e=>e.id==='med'?{...e,quantity:1}:e)};
  const next=useItem(sick,'med',1000);expect(next.inventory.some(e=>e.id==='med')).toBe(false);expect(next.positions.med).toBeUndefined();expect(isGameState(next)).toBe(true);
});

it('leczenie po powrocie przed odbiorem nie powoduje ponownego zachorowania przy rozliczeniu',()=>{
  const trip=startExpedition(medicine(),1000,risk(0));expect(()=>useItem(trip,'med',2000)).toThrow('powrocie');
  const cured=useItem(trip,'med',61000);expect(cured.illness).toBeNull();
  const result=settleExpedition(cured,trip.activeExpedition!.id,61000);expect(result.illness).toBeNull();expect(result.lastReport!.health?.contracted).toBe(true);
});

it('choroba jest utrwalona niezależnie od kurtki znalezionej lub założonej po powrocie',()=>{
  const trip=startExpedition(medicine(),1000,risk(0));const changed=equipItem(trip,'coat','body',61000);
  expect(changed.illness).toEqual(trip.illness);expect(settleExpedition(changed,trip.activeExpedition!.id,61000).illness).toEqual(trip.illness);
});

it('nowe wyprawy mogą dać antybiotyk, przyznany tylko raz',()=>{
  const v=[.5,.5,.5,.5,.99,.5,.99,.99,.1,.99];let i=0;
  const trip=startExpedition(createInitialState(0),1000,()=>v[i++]);
  expect(trip.activeExpedition!.cargo.loot).toContainEqual({itemId:'antibiotic',quantity:1});
  const result=settleExpedition(trip,trip.activeExpedition!.id,61000);expect(result.inventory.find(e=>e.itemId==='antibiotic')?.quantity).toBe(1);
  expect(settleExpedition(result,trip.activeExpedition!.id,100000)).toBe(result);expect(isGameState(result)).toBe(true);
});

it('migruje v9 bez losowania choroby i bez zmiany terminów ani raportów',()=>{
  const initial=createInitialState(0);const trip=startExpedition(initial,1000,()=>.5);
  const {illness:_,...old}=trip;const {health:__,...active}=trip.activeExpedition!;
  const result=validateSave({...old,schemaVersion:9,activeExpedition:active});
  expect(result.illness).toBeNull();expect(result.activeExpedition).toEqual({...active,health:null});expect(result.inventory).toEqual(initial.inventory);
});

it('odrzuca uszkodzoną chorobę i niezgodne skutki ochrony kurtki',()=>{
  const trip=startExpedition(createInitialState(0),1000,risk(0));
  expect(isGameState({...trip,illness:undefined})).toBe(false);
  expect(isGameState({...trip,illness:{startedAt:1,endsAt:0}})).toBe(false);
  expect(isGameState({...trip,illness:{startedAt:NaN,endsAt:100}})).toBe(false);
  expect(isGameState({...trip,activeExpedition:{...trip.activeExpedition,health:{jacketWorn:true,sickAtStart:false,contracted:true}}})).toBe(false);
  expect(isGameState({...trip,activeExpedition:{...trip.activeExpedition,health:undefined}})).toBe(false);
  expect(()=>startExpedition(createInitialState(0),1000,risk(NaN))).toThrow('losowanie');
});
