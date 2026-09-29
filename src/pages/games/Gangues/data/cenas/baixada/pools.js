// Moldes de inimigo que as tretas da Baixada revezam (ver GDD §17.6). O
// escalarInimigo ajusta a força pro orçamento do ponto — o molde é só a cara.
// A Baixada é dos três cacos do Sombra: cada treta do folgado tem o bonde de
// um deles.

// Rua da Baixada: gente dos três cacos misturada (encontro aleatório, rinha).
export const BAIXADA_POOL_RUA = [1107, 1108, 1109, 1207, 1208, 1209, 1307, 1308, 1309, 1405, 1406]
// O bonde da Sangria (o caco mais esquentado).
export const BAIXADA_POOL_SANGRIA = [1308, 1107, 1207, 1307]
// O bonde do Gelo (o caco mais calculado).
export const BAIXADA_POOL_GELO = [1309, 1108, 1208]
// Os Restos, da Sobra (o caco que sobrou).
export const BAIXADA_POOL_SOBRA = [1405, 1406, 1109, 1209]
