//******************************************************************************
export interface ObservableManager
{
  observable: (obj: any) => any;
  isObservable: (obj: any) => boolean;
  raw: (obj: any) => any;
}
//------------------------------------------------------------------------------
export interface ObservableController
{
  reaction: () => any | undefined;
}
//------------------------------------------------------------------------------
export interface ObservableContext
{
  next: any;
  known: any;
  proxyToRaw: Map<any, any>;
  rawToProxy: Map<any, any>;
  observable: (obj: any) => any;
  reactGet: (target: any, key: PropertyKey) => void;
  reactSet: (target: any, key: PropertyKey) => void;
  reactHas: (target: any) => void;
  reactOwnKeys: (target: any) => void;
  reactDeleteProperty: (target: any) => void;
}
//******************************************************************************
export class
  StateManagerContext
{
protected viewToRaw: WeakMap<any, any>;
protected rawToView: WeakMap<any, any>;
protected mutations: any[];
protected reactionMap: Map<any, any>;
stateMap: Map<any, any>;
//------------------------------------------------------------------------------
constructor()
{
  this.viewToRaw = new WeakMap();
  this.rawToView = new WeakMap();
  this.mutations = [];
  this.reactionMap = new Map();
  this.stateMap = new Map();
}
//------------------------------------------------------------------------------
scheduleReaction(reaction: any)
{}
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
}
//******************************************************************************