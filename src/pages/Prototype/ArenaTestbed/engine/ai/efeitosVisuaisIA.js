export function mostrarBannerAtaqueIA(atacanteNome, t, setAttackBanner) {
  const bannerText = `${atacanteNome} ${t('prototype.arena_testbed.ia_attack_banner')}`
  setAttackBanner({ texto: bannerText })
  setTimeout(() => setAttackBanner(null), 1500)
}
