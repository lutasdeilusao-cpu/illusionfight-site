// Moldes de inimigo que as tretas da Vila revezam (GDD §6: o Bonde dos Prédio,
// 108, segura o térreo e a escada; Os Andar de Cima, 109, moram lá em cima).
// O escalarInimigo ajusta a força pro orçamento do ponto — o molde é só a cara.

// Térreo e pátio: a portaria, os vizinhos e o varal.
export const VILA_POOL_TERREO = [1110, 1112, 1210, 1310]
// A escada sem luz (andares 1–4): quem conhece o breu.
export const VILA_POOL_ESCADA = [1111, 1112, 1210, 1110]
// O meio do prédio (5–6): o condomínio e o zelador infiltrado.
export const VILA_POOL_MEIO = [1211, 1212, 1312]
// Lá em cima (7–9): Os Andar de Cima.
export const VILA_POOL_ALTO = [1407, 1408, 1211]
// O elevador quebrado: quem abre a porta na marra quando ele trava.
export const VILA_POOL_ELEVADOR = [1312, 1211, 1212]
