import { IDBFactory, IDBDatabase } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { arrange } from '../domain/inventory';
import { createInitialState, renameHero } from '../domain/game';
import { IndexedDbRepository } from './indexedDbRepository';

afterEach(() => vi.restoreAllMocks());

async function writeRaw(factory: IDBFactory, value: unknown): Promise<void> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open('test', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('saves');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('saves', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
      tx.objectStore('saves').put(value, 'main');
    });
  } finally { db.close(); }
}

describe('adapter IndexedDB', () => {
  it('zwraca null tylko gdy zapisu jeszcze nie ma', async () => {
    expect(await new IndexedDbRepository(new IDBFactory(), 'test').load()).toBeNull();
  });
  it('odtwarza stan po utworzeniu nowego adaptera i nadpisuje poprawną nowszą zmianą', async () => {
    const factory = new IDBFactory();
    const state = createInitialState(1000);
    const repository = new IndexedDbRepository(factory, 'test');
    await repository.save(state);
    const reopened = new IndexedDbRepository(factory, 'test');
    expect(await reopened.load()).toEqual(state);
    const changed = renameHero(state, 'Kruk', 2000);
    await reopened.save(changed);
    expect(await repository.load()).toEqual(changed);
  });
  it('nie traktuje nowszej wersji jako pustej gry i nie usuwa surowych danych', async () => {
    const factory = new IDBFactory();
    await writeRaw(factory, { schemaVersion: 12, marker: 'keep' });
    const repository = new IndexedDbRepository(factory, 'test');
    await expect(repository.load()).rejects.toThrow('wersja');
    await expect(repository.load()).rejects.toThrow('wersja');
  });
  it('odrzuca błędny zapis przed zmianą poprzedniej poprawnej kopii', async () => {
    const repository = new IndexedDbRepository(new IDBFactory(), 'test');
    const state = createInitialState(1000);
    await repository.save(state);
    await expect(repository.save({ ...state, updatedAt: -1 })).rejects.toThrow();
    expect(await repository.load()).toEqual(state);
  });
  it('nie raportuje sukcesu po przerwaniu transakcji i zachowuje poprzedni stan', async () => {
    const repository = new IndexedDbRepository(new IDBFactory(), 'test');
    const state = createInitialState(1000);
    await repository.save(state);
    const original = IDBDatabase.prototype.transaction;
    const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
      const transaction = original.apply(this, args);
      queueMicrotask(() => transaction.abort());
      return transaction;
    });
    await expect(repository.save(renameHero(state, 'Kruk', 2000))).rejects.toThrow();
    spy.mockRestore();
    expect(await repository.load()).toEqual(state);
  });
});

describe('transakcje wyprawy', () => {
  it('odtwarza aktywną wyprawę i zachowuje rozliczenie po ponownym otwarciu', async () => {
    const { startExpedition, settleExpedition } = await import('../domain/game');
    const factory = new IDBFactory();
    const repository = new IndexedDbRepository(factory, 'test');
    const started = startExpedition(createInitialState(0), 1000);
    await repository.save(started, null);
    const reopened = new IndexedDbRepository(factory, 'test');
    const loaded = (await reopened.load())!;
    expect(loaded).toEqual(started);
    const settled = settleExpedition(loaded, loaded.activeExpedition!.id, 61000);
    const outcomes = await Promise.allSettled([repository.save(settled, loaded), reopened.save(settled, loaded)]);
    expect(outcomes.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(outcomes.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(await reopened.load()).toEqual(settled);
    const after = (await repository.load())!;
    expect(settleExpedition(after, loaded.activeExpedition!.id, 999999)).toBe(after);
    await expect(repository.save(renameHero(loaded, 'Kruk'), loaded)).rejects.toThrow('innej karcie');
    expect(await repository.load()).toEqual(settled);
  });
  it('przerwany odbiór pozostawia aktywną wyprawę bez częściowej nagrody', async () => {
    const { startExpedition, settleExpedition } = await import('../domain/game');
    const repository = new IndexedDbRepository(new IDBFactory(), 'test');
    const started = startExpedition(createInitialState(0), 1000);
    await repository.save(started, null);
    const original = IDBDatabase.prototype.transaction;
    const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
      const tx = original.apply(this, args);
      queueMicrotask(() => tx.abort());
      return tx;
    });
    const result = settleExpedition(started, started.activeExpedition!.id, 61000);
    await expect(repository.save(result, started)).rejects.toThrow();
    spy.mockRestore();
    expect(await repository.load()).toEqual(started);
    await repository.save(result, started);
    expect(await repository.load()).toEqual(result);
  });
  it('wczytuje v1 i zapisuje v10 dopiero przy udanej zmianie', async () => {
    const factory = new IDBFactory();
    const { lastReport: _, ...legacy } = createInitialState(0);
    await writeRaw(factory, { ...legacy, schemaVersion: 1 });
    const repository = new IndexedDbRepository(factory, 'test');
    const loaded = (await repository.load())!;
    expect(loaded.schemaVersion).toBe(11);
    await repository.save(renameHero(loaded, 'Kruk', 1000), loaded);
    expect((await repository.load())!.hero.name).toBe('Kruk');
  });
});

describe('atomowe przygotowanie', () => {
  it('równoległe wytwarzanie nie powiela wyniku i przetrwa ponowne otwarcie', async () => {
    const { addResources, craft, quantity } = await import('../domain/preparation');
    const factory = new IDBFactory();
    const repository = new IndexedDbRepository(factory, 'test');
    const initial = createInitialState(0);
    const state = arrange({ ...initial, inventory: addResources(initial.inventory, [{ itemId: 'cloth', quantity: 2 }]) });
    await repository.save(state, null);
    const result = craft(state, 'bandage', 1000);
    const outcomes = await Promise.allSettled([repository.save(result, state), repository.save(result, state)]);
    expect(outcomes.filter((entry) => entry.status === 'fulfilled')).toHaveLength(1);
    const loaded = (await new IndexedDbRepository(factory, 'test').load())!;
    expect(quantity(loaded.inventory, 'bandage')).toBe(3);
    expect(quantity(loaded.inventory, 'cloth')).toBe(0);
  });
  it('przerwany start nie zmienia ekwipunku; ponowienie zapisuje wyprawę tylko raz', async () => {
    const { startExpedition } = await import('../domain/game');
    const { quantity } = await import('../domain/preparation');
    const repository = new IndexedDbRepository(new IDBFactory(), 'test');
    const initial = createInitialState(0);
    await repository.save(initial, null);
    const original = IDBDatabase.prototype.transaction;
    const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
      const tx = original.apply(this, args); queueMicrotask(() => tx.abort()); return tx;
    });
    const started = startExpedition(initial, 1000);
    await expect(repository.save(started, initial)).rejects.toThrow();
    spy.mockRestore();
    expect(await repository.load()).toEqual(initial);
    await repository.save(started, initial);
    await expect(repository.save(started, initial)).rejects.toThrow();
    expect(quantity((await repository.load())!.inventory, 'water')).toBe(3);
  });
});

describe('atomowy transfer między siatkami', () => {
  it('nie przenosi rzeczy przy przerwanej transakcji, a dwie karty nie duplikują transferu', async () => {
    const { moveItem } = await import('../domain/inventory');
    const factory = new IDBFactory();
    const repository = new IndexedDbRepository(factory, 'test');
    const initial = createInitialState(0);
    await repository.save(initial, null);
    const moved = moveItem(initial, initial.inventory[0].id, 0, undefined, 1000);
    const original = IDBDatabase.prototype.transaction;
    const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
      const tx = original.apply(this, args); queueMicrotask(() => tx.abort()); return tx;
    });
    await expect(repository.save(moved, initial)).rejects.toThrow(); spy.mockRestore();
    expect(await repository.load()).toEqual(initial);
    const outcomes = await Promise.allSettled([repository.save(moved, initial), repository.save(moved, initial)]);
    expect(outcomes.filter((entry) => entry.status === 'fulfilled')).toHaveLength(1);
    expect(await new IndexedDbRepository(factory, 'test').load()).toEqual(moved);
  });
});

it('migruje starą drugą stronę schowka i zachowuje kontrolę poprzedniego stanu przy zapisie', async () => {
  const { moveItem } = await import('../domain/inventory');
  const factory = new IDBFactory();
  const state = moveItem(createInitialState(0), 'starter-water', 0, undefined, 1000);
  await writeRaw(factory, { ...state, schemaVersion: 4, positions: { ...state.positions, 'starter-water': { x: 9, y: 5, page: 1 } } });
  const repository = new IndexedDbRepository(factory, 'test');
  const loaded = (await repository.load())!;
  expect(loaded.schemaVersion).toBe(11);
  expect(loaded.positions['starter-water'].page).toBe(0);
  const moved = moveItem(loaded, 'starter-water', -1, undefined, 2000);
  await repository.save(moved, loaded);
  expect(await repository.load()).toEqual(moved);
});

it('dwie karty nie zużywają tej samej sztuki i nie duplikują skutku', async () => {
  const { useItem } = await import('../domain/useItem');
  const repository = new IndexedDbRepository(new IDBFactory(), 'test');
  const initial = createInitialState(0);await repository.save(initial, null);
  const next = useItem(initial, 'starter-water', 1000);
  const outcomes = await Promise.allSettled([repository.save(next, initial), repository.save(next, initial)]);
  expect(outcomes.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect((await repository.load())!.inventory.find((item) => item.id === 'starter-water')!.quantity).toBe(2);
});

it('przerwany zapis ostatniej użytej sztuki zachowuje przedmiot i jego pola', async () => {
  const { useItem } = await import('../domain/useItem');
  const repository = new IndexedDbRepository(new IDBFactory(), 'test');
  const state = createInitialState(0); state.inventory.find((entry) => entry.id === 'starter-water')!.quantity = 1;
  await repository.save(state, null);
  const next = useItem(state, 'starter-water', 1000);
  const original = IDBDatabase.prototype.transaction;
  const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
    const tx = original.apply(this, args);queueMicrotask(() => tx.abort());return tx;
  });
  await expect(repository.save(next, state)).rejects.toThrow();spy.mockRestore();
  expect(await repository.load()).toEqual(state);
});

it('naprawa stołu jest atomowa i nie pobiera materiałów po przerwaniu lub ponowieniu w drugiej karcie', async () => {
  const { addResources, quantity, repairWorkbench } = await import('../domain/preparation');
  const factory = new IDBFactory();
  const repository = new IndexedDbRepository(factory, 'test');
  const initial = createInitialState(0);
  const state = arrange({ ...initial, progress: { workshopVisited: true, workbenchRepaired: false }, inventory: addResources(initial.inventory, [{ itemId: 'scrap', quantity: 2 }, { itemId: 'cloth', quantity: 2 }]) });
  await repository.save(state, null);
  const repaired = repairWorkbench(state, 1000);
  const original = IDBDatabase.prototype.transaction;
  const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
    const tx = original.apply(this, args); queueMicrotask(() => tx.abort()); return tx;
  });
  await expect(repository.save(repaired, state)).rejects.toThrow(); spy.mockRestore();
  expect(await repository.load()).toEqual(state);
  const results = await Promise.allSettled([repository.save(repaired, state), repository.save(repaired, state)]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  const loaded = (await new IndexedDbRepository(factory, 'test').load())!;
  expect(loaded.progress.workbenchRepaired).toBe(true);
  expect(quantity(loaded.inventory, 'scrap')).toBe(0);
  expect(quantity(loaded.inventory, 'cloth')).toBe(0);
  expect(repairWorkbench(loaded)).toBe(loaded);
});

it('migruje v6 z plecakiem poza siatkę i zapisuje nowy stan z kontrolą współbieżności', async () => {
  const initial = createInitialState(0);
  const old = arrange({ ...initial, inventory: [initial.backpack, ...initial.inventory], positions: {} });
  const factory = new IDBFactory();
  await writeRaw(factory, { ...old, schemaVersion: 6 });
  const repository = new IndexedDbRepository(factory, 'test');
  const loaded = (await repository.load())!;
  expect(loaded.backpack).toEqual(initial.backpack);
  expect(loaded.inventory.some((entry) => entry.itemId === 'backpack')).toBe(false);
  await repository.save(renameHero(loaded, 'Kruk', 1000), loaded);
  const reopened = (await new IndexedDbRepository(factory, 'test').load())!;
  expect(reopened.hero.name).toBe('Kruk');
  expect(reopened.backpack).toEqual(initial.backpack);
  expect(reopened.inventory).toEqual(initial.inventory);
});

it('rozdzielenie stosu przetrwa ponowne otwarcie, a dwie karty nie powielą sztuk', async () => {
  const { splitStack } = await import('../domain/inventory');
  const { quantity } = await import('../domain/preparation');
  const factory = new IDBFactory();
  const repository = new IndexedDbRepository(factory, 'test');
  const initial = createInitialState(0); await repository.save(initial, null);
  const next = splitStack(initial, 'starter-water', 1, 1000);
  const results = await Promise.allSettled([repository.save(next, initial), repository.save(next, initial)]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  const loaded = (await new IndexedDbRepository(factory, 'test').load())!;
  expect(loaded).toEqual(next);
  expect(quantity(loaded.inventory, 'water')).toBe(3);
  expect(loaded.inventory.filter((entry) => entry.itemId === 'water')).toHaveLength(2);
});

it('przerwany podział nie zmniejsza źródła i nie dodaje nowego stosu ani pozycji', async () => {
  const { splitStack } = await import('../domain/inventory');
  const repository = new IndexedDbRepository(new IDBFactory(), 'test');
  const initial = createInitialState(0); await repository.save(initial, null);
  const next = splitStack(initial, 'starter-water', 1, 1000);
  const original = IDBDatabase.prototype.transaction;
  const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
    const tx = original.apply(this, args); queueMicrotask(() => tx.abort()); return tx;
  });
  await expect(repository.save(next, initial)).rejects.toThrow(); spy.mockRestore();
  expect(await repository.load()).toEqual(initial);
});

it('połączenie stosów jest trwałe i dwie karty nie podwajają ilości', async () => {
  const { mergeStacks, splitStack } = await import('../domain/inventory');
  const factory = new IDBFactory();
  const repository = new IndexedDbRepository(factory, 'test');
  const state = splitStack(createInitialState(0), 'starter-water', 1, 100);
  const source = state.inventory.find((entry) => entry.itemId === 'water' && entry.id !== 'starter-water')!;
  await repository.save(state, null);
  const next = mergeStacks(state, source.id, 'starter-water', 200);
  const results = await Promise.allSettled([repository.save(next, state), repository.save(next, state)]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(await new IndexedDbRepository(factory, 'test').load()).toEqual(next);
  expect(next.inventory.find((entry) => entry.id === 'starter-water')!.quantity).toBe(3);
  expect(mergeStacks(next, source.id, 'starter-water', 300)).toBe(next);
});

it('przerwany zapis łączenia zachowuje oba stosy, ilości i pola', async () => {
  const { mergeStacks, splitStack } = await import('../domain/inventory');
  const repository = new IndexedDbRepository(new IDBFactory(), 'test');
  const state = splitStack(createInitialState(0), 'starter-water', 1, 100);
  const source = state.inventory.find((entry) => entry.itemId === 'water' && entry.id !== 'starter-water')!;
  await repository.save(state, null);
  const next = mergeStacks(state, source.id, 'starter-water', 200);
  const original = IDBDatabase.prototype.transaction;
  const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
    const tx = original.apply(this, args); queueMicrotask(() => tx.abort()); return tx;
  });
  await expect(repository.save(next, state)).rejects.toThrow(); spy.mockRestore();
  expect(await repository.load()).toEqual(state);
});

it('migruje wyprawę i raport v7 bez dopisywania historii, a zapis zachowuje kontrolę współbieżności', async () => {
  const { startExpedition, settleExpedition } = await import('../domain/game');
  const factory = new IDBFactory();
  const first = startExpedition(createInitialState(0), 1000, () => .5);
  const returned = settleExpedition(first, first.activeExpedition!.id, 61000);
  const next = startExpedition(returned, 62000, () => .99);
  const { events: _, ...active } = next.activeExpedition!;
  const { events: _report, ...report } = next.lastReport!;
  await writeRaw(factory, { ...next, schemaVersion: 7, activeExpedition: active, lastReport: report });
  const repository = new IndexedDbRepository(factory, 'test');
  const loaded = (await repository.load())!;
  expect(loaded.activeExpedition).toEqual({ ...active, events: null, health: null });
  expect(loaded.lastReport).toEqual({ ...report, events: null, health: null });
  const changed = renameHero(loaded, 'Kruk', 63000);
  await repository.save(changed, loaded);
  expect(await new IndexedDbRepository(factory, 'test').load()).toEqual(changed);
  await expect(repository.save(loaded, loaded)).rejects.toThrow('innej karcie');
});

it('nie nadpisuje aktualnego zapisu z niezgodnym dziennikiem i łupami', async () => {
  const { startExpedition } = await import('../domain/game');
  const factory = new IDBFactory();
  const started = startExpedition(createInitialState(0), 1000, () => .5);
  started.activeExpedition!.events = [{ id: 'blocked-road', loot: [] }];
  await writeRaw(factory, started);
  const repository = new IndexedDbRepository(factory, 'test');
  await expect(repository.load()).rejects.toThrow('nieprawidłowy');
  await expect(repository.save(createInitialState(0))).rejects.toThrow();
  await expect(repository.load()).rejects.toThrow('nieprawidłowy');
});

it('wymiana założonego sprzętu jest atomowa i dwie karty nie powielają egzemplarzy', async () => {
  const { equipItem } = await import('../domain/equipment');
  const initial = createInitialState(0);
  const packed = arrange({ ...initial, inventory: [...initial.inventory, { id:'old-helmet',itemId:'helmet',quantity:1,condition:30 }, {id:'new-helmet',itemId:'helmet',quantity:1,condition:80}] });
  const state = equipItem(packed,'old-helmet','head',100);
  const factory = new IDBFactory();const repository = new IndexedDbRepository(factory,'test');await repository.save(state,null);
  const next = equipItem(state,'new-helmet','head',200);
  const original = IDBDatabase.prototype.transaction;
  const spy = vi.spyOn(IDBDatabase.prototype,'transaction').mockImplementation(function(this:IDBDatabase,...args:Parameters<typeof original>){const tx=original.apply(this,args);queueMicrotask(()=>tx.abort());return tx;});
  await expect(repository.save(next,state)).rejects.toThrow();spy.mockRestore();expect(await repository.load()).toEqual(state);
  const results=await Promise.allSettled([repository.save(next,state),repository.save(next,state)]);
  expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
  const loaded=(await new IndexedDbRepository(factory,'test').load())!;
  expect(loaded).toEqual(next);expect(loaded.equipped.head?.id).toBe('new-helmet');expect(loaded.inventory.filter(e=>e.id==='old-helmet')).toHaveLength(1);
});

it('przerwane zdejmowanie zachowuje sprzęt na postaci i nie zajmuje pól plecaka', async () => {
  const { equipItem,unequipItem }=await import('../domain/equipment');
  const initial=createInitialState(0);const state=equipItem(arrange({...initial,inventory:[...initial.inventory,{id:'boots',itemId:'boots',quantity:1,condition:60}]}),'boots','feet',100);
  const repository=new IndexedDbRepository(new IDBFactory(),'test');await repository.save(state,null);const next=unequipItem(state,'boots',undefined,200);
  const original=IDBDatabase.prototype.transaction;const spy=vi.spyOn(IDBDatabase.prototype,'transaction').mockImplementation(function(this:IDBDatabase,...args:Parameters<typeof original>){const tx=original.apply(this,args);queueMicrotask(()=>tx.abort());return tx;});
  await expect(repository.save(next,state)).rejects.toThrow();spy.mockRestore();expect(await repository.load()).toEqual(state);
  await repository.save(next,state);expect(await repository.load()).toEqual(next);
});

it('migruje v8 do pustych slotów i zapisuje v9 bez zmiany rozpoczętej wyprawy',async()=>{
  const {startExpedition}=await import('../domain/game');const started=startExpedition(createInitialState(0),1000,()=>.5);
  const {equipped:_,...old}=started;const factory=new IDBFactory();await writeRaw(factory,{...old,schemaVersion:8});
  const repository=new IndexedDbRepository(factory,'test');const loaded=(await repository.load())!;expect(loaded).toEqual({...started,activeExpedition:{...started.activeExpedition,health:null}});
  const next=renameHero(loaded,'Kruk',2000);await repository.save(next,loaded);expect(await new IndexedDbRepository(factory,'test').load()).toEqual(next);
});

it('zachowuje wynik otwarcia skrzyni po ponownym otwarciu i przyznaje łup tylko raz',async()=>{
  const {startExpedition,settleExpedition}=await import('../domain/game');
  const initial=createInitialState(0);const packed=arrange({...initial,inventory:[...initial.inventory,{id:'bar',itemId:'crowbar',quantity:1,condition:60}]});
  const values=[.5,.5,.5,.5,.1,.5,.99,.99,.1,.5,.5,.99,.99];let i=0;
  const trip=startExpedition(packed,1000,()=>values[i++]);const factory=new IDBFactory();const repository=new IndexedDbRepository(factory,'test');await repository.save(trip,null);
  const loaded=(await new IndexedDbRepository(factory,'test').load())!;expect(loaded.activeExpedition).toEqual(trip.activeExpedition);
  const result=settleExpedition(loaded,loaded.activeExpedition!.id,61000);
  const writes=await Promise.allSettled([repository.save(result,loaded),repository.save(result,loaded)]);
  expect(writes.filter(e=>e.status==='fulfilled')).toHaveLength(1);expect(await repository.load()).toEqual(result);
});

it('choroba zapisana przy starcie przetrwa odczyt, a dwie karty nie zużyją dwóch dawek',async()=>{
  const {startExpedition,settleExpedition}=await import('../domain/game');const {useItem}=await import('../domain/useItem');
  const initial=createInitialState(0);const packed=arrange({...initial,inventory:[...initial.inventory,{id:'med',itemId:'antibiotic',quantity:2,condition:null}]});
  const trip=startExpedition(packed,1000,()=>0);const factory=new IDBFactory();const repository=new IndexedDbRepository(factory,'test');await repository.save(trip,null);
  const loaded=(await new IndexedDbRepository(factory,'test').load())!;expect(loaded).toEqual(trip);
  const cured=useItem(loaded,'med',61000);const results=await Promise.allSettled([repository.save(cured,loaded),repository.save(cured,loaded)]);
  expect(results.filter(e=>e.status==='fulfilled')).toHaveLength(1);expect(await repository.load()).toEqual(cured);
  const returned=settleExpedition(cured,trip.activeExpedition!.id,61000);await repository.save(returned,cured);
  expect((await repository.load())!.illness).toBeNull();expect(returned.inventory.find(e=>e.id==='med')?.quantity).toBe(1);
});

it('przerwane leczenie nie usuwa choroby ani ostatniej dawki i jej pola',async()=>{
  const {useItem}=await import('../domain/useItem');const initial=createInitialState(0);
  const state=arrange({...initial,illness:{startedAt:0,endsAt:10000},inventory:[...initial.inventory,{id:'med',itemId:'antibiotic',quantity:1,condition:null}]});
  const repository=new IndexedDbRepository(new IDBFactory(),'test');await repository.save(state,null);const next=useItem(state,'med',1000);
  const original=IDBDatabase.prototype.transaction;const spy=vi.spyOn(IDBDatabase.prototype,'transaction').mockImplementation(function(this:IDBDatabase,...args:Parameters<typeof original>){const tx=original.apply(this,args);queueMicrotask(()=>tx.abort());return tx;});
  await expect(repository.save(next,state)).rejects.toThrow();spy.mockRestore();expect(await repository.load()).toEqual(state);
});

it('migruje v9 bez zmiany terminu powrotu ani dopisywania choroby',async()=>{
  const {startExpedition}=await import('../domain/game');const started=startExpedition(createInitialState(0),1000,()=>.5);const {illness:_,...old}=started;const {health:__,...active}=started.activeExpedition!;
  const factory=new IDBFactory();await writeRaw(factory,{...old,schemaVersion:9,activeExpedition:active});const repository=new IndexedDbRepository(factory,'test');const loaded=(await repository.load())!;
  expect(loaded.illness).toBeNull();expect(loaded.activeExpedition).toEqual({...active,health:null});const next=renameHero(loaded,'Kruk',2000);await repository.save(next,loaded);expect(await repository.load()).toEqual(next);
});

it('nagroda zadania i znacznik zapisują się razem, druga karta nie powiela nagrody', async () => {
  const { claimQuest } = await import('../domain/quests');
  const repository = new IndexedDbRepository(new IDBFactory(), 'test');
  const state = { ...createInitialState(1000), quests: { completed: ['workbench' as const], claimed: [] } };
  await repository.save(state);
  const first = (await repository.load())!;
  const second = (await repository.load())!;
  await repository.save(claimQuest(first, 'workbench', 2000), first);
  await expect(repository.save(claimQuest(second, 'workbench', 2001), second)).rejects.toThrow('innej karcie');
  const loaded = (await repository.load())!;
  expect(loaded.quests.claimed).toEqual(['workbench']);
  expect(loaded.inventory.filter((e) => e.itemId === 'antibiotic').reduce((sum, e) => sum + e.quantity, 0)).toBe(1);
});

it('przerwana transakcja nagrody pozostawia możliwość odbioru', async () => {
  const { claimQuest } = await import('../domain/quests');
  const repository = new IndexedDbRepository(new IDBFactory(), 'test');
  const state = { ...createInitialState(1000), quests: { completed: ['workbench' as const], claimed: [] } };
  await repository.save(state);
  const original = IDBDatabase.prototype.transaction;
  const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
    const transaction = original.apply(this, args);
    queueMicrotask(() => transaction.abort());
    return transaction;
  });
  await expect(repository.save(claimQuest(state, 'workbench', 2000), state)).rejects.toThrow();
  spy.mockRestore();
  expect(await repository.load()).toEqual(state);
  await repository.save(claimQuest(state, 'workbench', 2000), state);
  expect((await repository.load())!.quests.claimed).toEqual(['workbench']);
});
