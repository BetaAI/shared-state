import { KNOWN_SYMBOLS } from 'core/util';
import { ObservableContext } from 'core/observable';

//******************************************************************************
export const dftlHandlerFactory =
  <T extends object = any>(context: ObservableContext): ProxyHandler<T> => new DfltHandler<T>(context);
//------------------------------------------------------------------------------
export type HandlerFactory = typeof dftlHandlerFactory;
//******************************************************************************
const HAS_PROP_TEST = Object.prototype.hasOwnProperty;
export class
  DfltHandler<T extends object>
implements
  ProxyHandler<T>
{
protected context: ObservableContext
//------------------------------------------------------------------------------
constructor(context: ObservableContext)
{
  this.context = context;
}
//------------------------------------------------------------------------------
get(target: T, key: PropertyKey, receiver: any): any
{
  const cntx = this.context;
  const result = Reflect.get(target, key, receiver);
  if(typeof key === 'symbol' && KNOWN_SYMBOLS.has(key))
    return result;
  cntx.reactGet(target, key);
  const observable = cntx.rawToProxy.get(target);
  if(result !== null && typeof result === 'object')
  {
    if(observable)
      return observable;
    const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    if(!descriptor
    || !(descriptor.writable && descriptor.configurable))
      return cntx.observable(result);
  }
  return observable || result;
}
//------------------------------------------------------------------------------
set(target: T, key: PropertyKey, value: any, receiver: any): boolean
{
  const cntx = this.context;
  if(value !== null && typeof value === 'object')
    value = cntx.proxyToRaw.get(value) || value;
  const hadKey = HAS_PROP_TEST.call(target, key);
  const prev = Reflect.get(target, key, receiver);
  const result = Reflect.set(target, key, value, receiver);
  return result;
}
//------------------------------------------------------------------------------
has(target: T, key: PropertyKey): boolean
{
  this.context.reactHas(target);
  return Reflect.has(target, key);;
}
//------------------------------------------------------------------------------
deleteProperty(target: T, key: PropertyKey): boolean
{
  return false;
}
//------------------------------------------------------------------------------
ownKeys(target: T): PropertyKey[]
{
  this.context.reactOwnKeys(target);
  return Reflect.ownKeys(target);
}
//------------------------------------------------------------------------------
}//DfltHandler
//******************************************************************************