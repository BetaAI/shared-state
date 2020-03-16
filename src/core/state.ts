//******************************************************************************
export interface ISharedState
{
  getObservable: (obj: any) => any;
  getRaw: (obj: any) => any;
  isObservable: (obj: any) => boolean;
}
//------------------------------------------------------------------------------
export class SharedState
implements ISharedState
{
protected toProxy: WeakMap<any, any>;
protected toRaw: WeakMap<any, any>;
//------------------------------------------------------------------------------
constructor(config: any)
{
  this.toProxy = new WeakMap();
  this.toRaw = new WeakMap();
}
//------------------------------------------------------------------------------
getObservable(obj: any): any
{
}
//------------------------------------------------------------------------------
getRaw(obj: any): any
{
  return this.toRaw.get(obj);
}
//------------------------------------------------------------------------------
isObservable(obj: any): boolean
{
  return this.toRaw.has(obj);
}
}//SharedState
//------------------------------------------------------------------------------
//******************************************************************************