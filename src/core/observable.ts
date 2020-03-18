import { ObservableManager } from 'core/manager';
import { KNOWN_SYMBOLS } from 'core/util';

//******************************************************************************
const OWN_PROP_TEST = Object.prototype.hasOwnProperty;
//******************************************************************************
export enum ReactionType
{
  GET,
  SET,
  HAS,
  DEL,
  ITR,
}
//------------------------------------------------------------------------------
export type ReactionFn = (triggers?: Reaction[]) => any;
//------------------------------------------------------------------------------
export interface Reaction
extends
  Record<PropertyKey, any>
{
  observable: Observable;
  reaction: ReactionFn;
  type: ReactionType;
}
//******************************************************************************
export interface Observable
{
  view: any;
  raw: any;
  reaction: ReactionFn | undefined;
}
//------------------------------------------------------------------------------
export class
  StateObservable
implements
  Observable, ProxyHandler<any>
{
view: any;
raw: any;
reaction: ReactionFn | undefined;
protected manager: ObservableManager;
//------------------------------------------------------------------------------
constructor(target: any, manager: ObservableManager)
{
  this.view = new Proxy(target, this);
  this.raw = target;
  this.reaction = undefined;
  this.manager = manager;
}
//------------------------------------------------------------------------------
get(target: any, key: PropertyKey, receiver: any)
{
  const manager = this.manager;
  const result = Reflect.get(target, key, receiver);
  if(typeof key === 'symbol' && KNOWN_SYMBOLS.has(key))
    return result;
  if(this.reaction !== undefined)
    manager.react({
      observable: this,
      type: ReactionType.GET,
      reaction: this.reaction,
      key,
    });
  const observable = manager.findObservable(target);
  if(result !== null && typeof result === 'object')
  {
    if(observable)
      return observable;
    const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    if(!descriptor
    || !(descriptor.writable && descriptor.configurable))
      return manager.observable(result);
  }
  return observable || result;
}
//------------------------------------------------------------------------------
set(target: any, key: PropertyKey, value: any, receiver: any): boolean
{
  const manager = this.manager;
  if(value !== null && typeof value === 'object')
    value = manager.findRaw(value) || value;
  const add = !OWN_PROP_TEST.call(target, key);
  const prev = Reflect.get(target, key, receiver);
  const result = Reflect.set(target, key, value, receiver);
  //This is used to prevent reactions on prototype mutation
  //IS THIS NECESSARY
  if(target !== this.raw)
    return result;
  if(this.reaction !== undefined && prev !== value)
    manager.react({
      observable: this,
      type: ReactionType.SET,
      reaction: this.reaction,
      add,
      key,
      prev,
      next: value,
    });
  return result;
}
//------------------------------------------------------------------------------
deleteProperty(target: any, key: PropertyKey): boolean
{
  const hadKey = OWN_PROP_TEST.call(target, key);
  const result = Reflect.deleteProperty(target, key);
  if(hadKey && this.reaction !== undefined)
    this.manager.react({
      observable: this,
      type: ReactionType.DEL,
      reaction: this.reaction,
      key
    });
  return result;
}
//------------------------------------------------------------------------------
has(target: any, key: PropertyKey): boolean
{
  if(this.reaction !== undefined)
    this.manager.react({
      observable: this,
      type: ReactionType.HAS,
      reaction: this.reaction,
      key,
    });
  return Reflect.has(target, key);;
}
//------------------------------------------------------------------------------
ownKeys(target: any): PropertyKey[]
{
  if(this.reaction !== undefined)
    this.manager.react({
      observable: this,
      type: ReactionType.ITR,
      reaction: this.reaction,
    });
  return Reflect.ownKeys(target);
}
//------------------------------------------------------------------------------
}
//******************************************************************************