import { Process, DefaultFactory } from 'fluid-pipe';
import { Observable, Reaction, StateObservable, ReactionFn, ReactionType } from 'core/observable';
//******************************************************************************
export interface ObservableManager
{
  observable: (obj: any) => Observable;
  isObservable: (obj: any) => boolean;
  findObservable: (obj: any) => Observable | undefined;
  findRaw: (obs: Observable) => any | undefined;
  react: (reaction: Reaction) => void;
}
//------------------------------------------------------------------------------
type ProcessFactory = () => Process<any, any>
interface StateManagerCfg
{
  processFactory?: ProcessFactory
}
//------------------------------------------------------------------------------
const DFLT_PRC_FACT: ProcessFactory = () => DefaultFactory.newInstance();
//------------------------------------------------------------------------------
export class
  StateManager
implements
  ObservableManager
{
protected processFactory: ProcessFactory;
protected obsToRaw: WeakMap<Observable, any>;
protected rawToObs: WeakMap<any, Observable>;
protected mutations: Reaction[];
protected dependencies: Map<ReactionFn, Reaction[]>;
stateMap: Map<any, Observable>;
//------------------------------------------------------------------------------
constructor(config: StateManagerCfg)
{
  this.processFactory = config.processFactory || DFLT_PRC_FACT;
  this.obsToRaw = new WeakMap();
  this.rawToObs = new WeakMap();
  this.mutations = [];
  this.dependencies = new Map();
  this.stateMap = new Map();
}
//------------------------------------------------------------------------------
observable(obj: any): Observable
{
  return new StateObservable(obj, this);
}
//------------------------------------------------------------------------------
isObservable(obj: any): boolean
{
  return this.obsToRaw.has(obj);
}
//------------------------------------------------------------------------------
findObservable(raw: any): Observable | undefined
{
  return this.rawToObs.get(raw);
}
//------------------------------------------------------------------------------
findRaw(obs: Observable): any | undefined
{
  return this.obsToRaw.get(obs);
}
//------------------------------------------------------------------------------
react(reaction: Reaction): void
{
  if(reaction.type === ReactionType.DEL
  || reaction.type === ReactionType.SET)
  {
    this.mutations.push(reaction);
  }
  else
  {
    const deps = this.dependencies.get(reaction.reaction);
    if(deps === undefined)
      this.dependencies.set(reaction.reaction, [reaction]);
    else
      deps.push(reaction);
  }
}
//------------------------------------------------------------------------------
findState(id: any): Observable | undefined
{
  return this.stateMap.get(id);
}
//------------------------------------------------------------------------------
getState(id: any, init: any = {}): Observable
{
  let result = this.stateMap.get(id);
  if(result === undefined)
  {
    result = this.observable(init);
    this.stateMap.set(id, result);
  }
  return result;
}
//------------------------------------------------------------------------------
processMutations(): void
{
  const reactions: {reaction: ReactionFn, args: Reaction[]}[] = [];
  for(const mut of this.mutations)
  {
    const deps = this.dependencies.get(mut.reaction);
    if(deps === undefined)
      continue;
    for(const dep of deps)
    {
      if(mut.observable !== dep.observable)
        continue;
    }
  }
}
//------------------------------------------------------------------------------
}
//******************************************************************************