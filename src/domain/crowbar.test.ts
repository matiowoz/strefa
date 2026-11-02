import { expect, it } from 'vitest';
import { createInitialState, settleExpedition, startExpedition } from './game';
import { arrange, moveItem } from './inventory';
import { equipItem } from './equipment';
import { eventLoot } from './expeditionEvents';
import { isGameState, validateSave } from './validation';

const packed = () => { const state=createInitialState(0);return arrange({...state, inventory:[...state.inventory,{id:'bar',itemId:'crowbar',quantity:1,condition:60}]}); };
const random = (attempt=.1) => { const values=[.5,.5,.5,.5,.1,.5,.99,.99,attempt,.5,.5,.99,.99];let i=0;return ()=>{if(i>=values.length)throw new Error('Ponowne losowanie');return values[i++];}; };

it.each(['carried','equipped'])('łom %s pozwala otworzyć skrzynię i utrwala dodatkowy wynik', kind=>{
  const state=kind==='equipped'?equipItem(packed(),'bar','weapon',0):packed();
  const started=startExpedition(state,1000,random());
  const chest=started.activeExpedition!.events!.find(e=>e.id==='locked-cache')!;
  expect(chest).toEqual({id:'locked-cache',cacheResult:'opened',loot:[{itemId:'scrap',quantity:2},{itemId:'cloth',quantity:2}]});
  expect(started.activeExpedition!.cargo.loot).toEqual(eventLoot(started.activeExpedition!.events!));
  const loaded=validateSave(JSON.parse(JSON.stringify(started)));
  // Removing the tool after the return cannot change the already saved outcome.
  const changed=kind==='carried'?moveItem(loaded,'bar',0,undefined,61000):loaded;
  const result=settleExpedition(changed,started.activeExpedition!.id,61000);
  expect(result.lastReport!.events).toEqual(started.activeExpedition!.events);
  expect(result.equipped).toEqual(state.equipped);
  expect(settleExpedition(result,started.activeExpedition!.id,999999)).toBe(result);
  expect(isGameState(result)).toBe(true);
});

it.each(['none','stash','overflow'])('łom poza zabranym ekwipunkiem (%s) nie otwiera skrzyni', kind=>{
  let state=kind==='none'?createInitialState(0):packed();
  if(kind==='stash')state=moveItem(state,'bar',0,undefined,0);
  if(kind==='overflow'){const bar=state.inventory.find(e=>e.id==='bar')!;const positions={...state.positions};delete positions.bar;state={...state,positions,inventory:state.inventory.filter(e=>e.id!=='bar'),overflow:[bar]};}
  const started=startExpedition(state,1000,random());
  expect(started.activeExpedition!.events!.find(e=>e.id==='locked-cache')).toEqual({id:'locked-cache',loot:[],cacheResult:'no-tool'});
  expect(isGameState(started)).toBe(true);
});

it('nie gwarantuje otwarcia i nie zużywa łomu ani nie zmienia zdrowia',()=>{
  const state=packed(),started=startExpedition(state,1000,random(.99));
  expect(started.activeExpedition!.events!.find(e=>e.id==='locked-cache')!.cacheResult).toBe('jammed');
  const result=settleExpedition(started,started.activeExpedition!.id,61000);
  expect(result.inventory.find(e=>e.id==='bar')).toEqual(state.inventory.find(e=>e.id==='bar'));expect(result.hero).toEqual(state.hero);
});

it('odrzuca błędny wynik lub nagrodę skrzyni, ale czyta wcześniejszy dziennik',()=>{
  const state=startExpedition(packed(),1000,random());const chest=state.activeExpedition!.events!.find(e=>e.id==='locked-cache')!;
  expect(isGameState(state)).toBe(true);chest.cacheResult='jammed';expect(isGameState(state)).toBe(false);
  const legacy=startExpedition(createInitialState(0),1000,random());delete legacy.activeExpedition!.events!.find(e=>e.id==='locked-cache')!.cacheResult;
  expect(validateSave(legacy)).toEqual(legacy);
});

it('łom znaleziony dopiero na wyprawie nie zastępuje zabranego narzędzia',()=>{
  const state={...createInitialState(0),selectedLocationId:'workshop'};
  const values=[.5,.5,.5,.1,.5,.5,.1,.99,.99,.99,.99];let i=0;
  const started=startExpedition(state,1000,()=>values[i++]);
  expect(started.activeExpedition!.cargo.loot).toContainEqual({itemId:'crowbar',quantity:1});
  expect(started.activeExpedition!.events!.find(e=>e.id==='locked-cache')!.cacheResult).toBe('no-tool');
});
