//******************************************************************************
export const KNOWN_SYMBOLS = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map(key => (Symbol as any)[key])
    .filter(val => typeof val === 'symbol')
)
//******************************************************************************