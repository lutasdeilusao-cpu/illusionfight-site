const primitivos = {
  ProjetilEffect: (params) => console.log('[PRIMITIVO] ProjetilEffect', params),
  ImpactoEffect: (params) => console.log('[PRIMITIVO] ImpactoEffect', params),
  AuraEffect: (params) => console.log('[PRIMITIVO] AuraEffect', params),
  TrailEffect: (params) => console.log('[PRIMITIVO] TrailEffect', params),
  StatusEffect: (params) => console.log('[PRIMITIVO] StatusEffect', params),
  TextoEffect: (params) => console.log('[PRIMITIVO] TextoEffect', params),
  FlashEffect: (params) => console.log('[PRIMITIVO] FlashEffect', params),
  ShakeEffect: (params) => console.log('[PRIMITIVO] ShakeEffect', params),
}

export function executar(primitivo, params) {
  const fn = primitivos[primitivo]
  if (!fn) {
    console.warn('[EFFECT_RENDERER] primitivo desconhecido:', primitivo)
    return
  }
  fn(params)
}
