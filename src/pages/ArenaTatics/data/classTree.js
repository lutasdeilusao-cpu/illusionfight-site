/**
 * CLASS TREE — Árvore de Evolução das 6 Classes Base
 *
 * Estrutura: Classe Base → 2 Ramos (Nv40) → 2 Sub-ramos cada (Nv70)
 * Caminho evolutivo do roster é pré-definido por lore.
 * ZEPHYRA, IGNIS, NAMI: sub-ramos a definir futuramente.
 */

export const CLASS_TREE = {
  karuak: {
    id: 'karuak',
    nome: 'KARUAK',
    tipo: 'Mãos Livres',
    papel: 'Tanque',
    desc: 'Guerreiro Bruto. Corpo fechado, pegada que desmonta. Quanto mais bate, mais resistente fica.',
    desc_en: 'Brute Warrior. Dense body, crushing grip. The more he hits, the tougher he gets.',
    atributos_base: { forca: 14, velocidade: 8, resistencia: 16, energia: 6, precisao: 7, tenacidade: 12 },
    sprite: { corpo: 'square', cor_primaria: '#8B4513', cor_secundaria: '#D2691E' },
    passiva: { nome: 'Pele de Pedra', desc: '-15% dano recebido. Acumula até -30% após 3 turnos consecutivos causando dano.' },
    skills_base: [
      { id: 'soco_pesado', nome: 'Soco Pesado', custo: 2, alcance: 1, dano: 1.2, tipo: 'fisico', desc: 'Golpe frontal. Empurra inimigo 1 casa.' },
      { id: 'postura_defensiva', nome: 'Postura Defensiva', custo: 1, alcance: 0, dano: 0, tipo: 'buff', desc: 'Reduz dano recebido em 50% por 1 turno.' },
      { id: 'pisao_tremendo', nome: 'Pisão Tremendo', custo: 3, alcance: 2, dano: 0.7, tipo: 'fisico', desc: 'Atinge área 2×2. Inimigos atordoados 1 turno.' },
    ],
    ramos: {
      muralha: {
        id: 'muralha',
        nome: 'KARUAK — MURALHA',
        desc: 'Escudo de pedra envolve o corpo. A defesa que protege aliados.',
        bonusAtributos: { resistencia: 3, forca: 2 },
        bonusHp: 0.20,
        bonusSp: 0.10,
        passiva: { nome: 'Pele de Pedra +', desc: '-25% dano recebido. Acumula até -50% após 3 turnos.' },
        skills_novas: [
          { id: 'muralha_escudo', nome: 'Muralha de Escudo', custo: 3, alcance: 0, dano: 0, tipo: 'buff', desc: 'Aliados adjacentes recebem -30% dano por 2 turnos.' },
          { id: 'investida_colossal', nome: 'Investida Colossal', custo: 4, alcance: 3, dano: 1.5, tipo: 'fisico', desc: 'Corre em linha reta. Derruba todos no caminho.' },
        ],
        fraseLore: 'A rocha que não quebra. O escudo que não cai.',
        subRamos: {
          bastiao: {
            id: 'bastiao',
            nome: 'KARUAK — BASTIÃO',
            desc: 'A muralha que protege todos. Ninguém passa.',
            bonusAtributos: { resistencia: 3, tenacidade: 2 },
            bonusHp: 0.15,
            bonusSp: 0.10,
            passiva: { nome: 'Muralha Viva', desc: 'Aliados atrás de KARUAK recebem -30% dano.' },
            skills_novas: [
              { id: 'fortaleza_cerco', nome: 'Fortaleza de Cerco', custo: 4, alcance: 0, dano: 0, tipo: 'buff', desc: 'Imóvel por 1 turno: reduz -60% dano em área 3×3.' },
              { id: 'escudo_esmagador', nome: 'Escudo Esmagador', custo: 5, alcance: 1, dano: 2.0, tipo: 'fisico', desc: 'Golpe com escudo. Atordoamento 1 turno. Empurra 2 casas.' },
            ],
            fraseLore: 'Nenhum exército passa por onde eu estou.',
          },
          fortaleza: {
            id: 'fortaleza',
            nome: 'KARUAK — FORTALEZA',
            desc: 'Ninguém passa. Nunca.',
            bonusAtributos: { resistencia: 5 },
            bonusHp: 0.25,
            bonusSp: 0.05,
            passiva: { nome: 'Campo de Proteção', desc: 'Regenera 5% HP por turno em área 2×2.' },
            skills_novas: [
              { id: 'pele_granito', nome: 'Pele de Granito', custo: 3, alcance: 0, dano: 0, tipo: 'buff', desc: 'Ganha +40% DEF pesada por 2 turnos. Auto-cura 10% HP.' },
              { id: 'muro_impenetravel', nome: 'Muro Impenetrável', custo: 6, alcance: 0, dano: 0, tipo: 'buff', desc: 'Aliados em área 3×3 recebem -50% dano por 2 turnos.' },
            ],
            fraseLore: 'Eu sou a muralha. E muralhas não caem.',
          },
        },
      },
      avalanche: {
        id: 'avalanche',
        nome: 'KARUAK — AVALANCHE',
        desc: 'A muralha agora avança. Dano e defesa em igual medida.',
        bonusAtributos: { forca: 3, resistencia: 2 },
        bonusHp: 0.15,
        bonusSp: 0.15,
        passiva: { nome: 'Força Bruta', desc: 'Skills de dano causam +15% se KARUAK moveu neste turno.' },
        skills_novas: [
          { id: 'terremoto', nome: 'Terremoto', custo: 5, alcance: 3, dano: 1.8, tipo: 'fisico', desc: 'Área 3×3. Dano + atordoamento 1 turno.' },
          { id: 'furia_da_terra', nome: 'Fúria da Terra', custo: 6, alcance: 1, dano: 2.5, tipo: 'fisico', desc: 'Golpe final. Dano máximo se HP < 30%.' },
        ],
        fraseLore: 'A montanha que anda. Nada a detém.',
        subRamos: {
          colosso: {
            id: 'colosso',
            nome: 'KARUAK — COLOSSO',
            desc: 'Gigante imparável. Dano bruto.',
            bonusAtributos: { forca: 5 },
            bonusHp: 0.20,
            bonusSp: 0.10,
            passiva: { nome: 'Impacto Colossal', desc: 'Skills de dano causam +20% se KARUAK não moveu no turno.' },
            skills_novas: [
              { id: 'esmagamento_total', nome: 'Esmagamento Total', custo: 6, alcance: 2, dano: 3.0, tipo: 'fisico', desc: 'Área 2×2. Ignora 30% DEF. Esmagado 1 turno.' },
              { id: 'investida_catastrofe', nome: 'Investida Catástrofe', custo: 4, alcance: 4, dano: 1.5, tipo: 'fisico', desc: 'Corre 4 casas. Derruba todos no caminho. Pode parar em inimigo.' },
            ],
            fraseLore: 'O chão treme. O céu some. Só resta o impacto.',
          },
          cataclisma: {
            id: 'cataclisma',
            nome: 'KARUAK — CATACLISMA',
            desc: 'A fúria da terra personificada.',
            bonusAtributos: { forca: 3, tenacidade: 2 },
            bonusHp: 0.15,
            bonusSp: 0.15,
            passiva: { nome: 'Onda de Choque', desc: 'Ao matar um inimigo, causa 50% do dano em área 2×2.' },
            skills_novas: [
              { id: 'juizo_final', nome: 'Juízo Final', custo: 8, alcance: 3, dano: 3.5, tipo: 'fisico', desc: 'Dano massivo em área 2×2. Uma vez por batalha.' },
              { id: 'ira_tectonica', nome: 'Ira Tectônica', custo: 5, alcance: 2, dano: 2.0, tipo: 'fisico', desc: 'Área 3×3. Empurra todos os inimigos 2 casas para borda.' },
            ],
            fraseLore: 'A terra se abre. O inimigo cai. O silêncio vence.',
          },
        },
      },
    },
  },

  moraki: {
    id: 'moraki',
    nome: 'MORAKI',
    tipo: 'Mãos Livres',
    papel: 'DPS/Disruptor',
    desc: 'Monge dos Ventos. Velocidade pura. Some e reaparece onde ninguém espera.',
    desc_en: 'Wind Monk. Pure speed. Vanishes and reappears where no one expects.',
    atributos_base: { forca: 10, velocidade: 18, resistencia: 7, energia: 12, precisao: 14, tenacidade: 5 },
    sprite: { corpo: 'triangular', cor_primaria: '#4A90D9', cor_secundaria: '#7EC8E3' },
    passiva: { nome: 'Passos do Vento', desc: 'Após usar skill, pode mover 1 casa extra. (máx 1 vez por turno)' },
    skills_base: [
      { id: 'soco_vento', nome: 'Soco do Vento', custo: 1, alcance: 2, dano: 0.8, tipo: 'fisico', desc: 'Golpe rápido a distância. Reduz velocidade do alvo em 20%.' },
      { id: 'desvio_fantasma', nome: 'Desvio Fantasma', custo: 2, alcance: 0, dano: 0, tipo: 'buff', desc: 'Esquiva do próximo ataque recebido. Pode contra-atacar.' },
      { id: 'rajada_ciclonica', nome: 'Rajada Ciclônica', custo: 3, alcance: 2, dano: 1.0, tipo: 'fisico', desc: 'Atinge 3 inimigos em cone. Empurra 1 casa.' },
    ],
    ramos: {
      fantasma: {
        id: 'fantasma',
        nome: 'MORAKI — FANTASMA',
        desc: 'O vento veste o lutador. Imprevisível como nunca.',
        bonusAtributos: { velocidade: 3, precisao: 2 },
        bonusHp: 0.10,
        bonusSp: 0.20,
        passiva: { nome: 'Passos do Vento +', desc: 'Após usar skill, pode mover 2 casas extras. (máx 1 vez por turno)' },
        skills_novas: [
          { id: 'teleporte_combate', nome: 'Teleporte de Combate', custo: 2, alcance: 4, dano: 0, tipo: 'mov', desc: 'Teletransporta para qualquer casa vazia no alcance.' },
          { id: 'cem_golpes', nome: 'Cem Golpes', custo: 4, alcance: 1, dano: 1.8, tipo: 'fisico', desc: 'Múltiplos golpes. Dano aumenta 10% por golpe consecutivo no mesmo alvo.' },
        ],
        fraseLore: 'O vento não se prende. O vento não se vê. O vento só se sente quando passa.',
        subRamos: {
          espectro: {
            id: 'espectro',
            nome: 'MORAKI — ESPECTRO',
            desc: 'Entre a realidade e a ilusão, o espectro ataca.',
            bonusAtributos: { velocidade: 5 },
            bonusHp: 0.10,
            bonusSp: 0.20,
            passiva: { nome: 'Ventania', desc: 'Passos do Vento: pode mover 3 casas extras. (máx 1 vez por turno)' },
            skills_novas: [
              { id: 'multiplicar_vento', nome: 'Multiplicar Vento', custo: 4, alcance: 2, dano: 1.5, tipo: 'fisico', desc: 'Cria 2 cópias que atacam alvos diferentes. 1.5 DMG cada.' },
              { id: 'surgimento', nome: 'Surgimento', custo: 3, alcance: 0, dano: 0, tipo: 'buff', desc: 'Fica invisível por 1 turno. Próximo ataque causa +100% dano.' },
            ],
            fraseLore: 'Você piscou. Eu já passei. Você caiu.',
          },
          sombra: {
            id: 'sombra',
            nome: 'MORAKI — SOMBRA',
            desc: 'A sombra do vento é mais cortante que o vento.',
            bonusAtributos: { velocidade: 3, precisao: 2 },
            bonusHp: 0.05,
            bonusSp: 0.25,
            passiva: { nome: 'Sombra do Vento', desc: 'Ao usar Teleporte, deixa uma ilusão que pode ser atacada no lugar.' },
            skills_novas: [
              { id: 'golpe_sombra', nome: 'Golpe Sombrio', custo: 3, alcance: 1, dano: 2.0, tipo: 'fisico', desc: 'Ataque garantido. Ignora esquiva. Causa medo 1 turno.' },
              { id: 'teia_ventos', nome: 'Teia de Ventos', custo: 5, alcance: 3, dano: 1.2, tipo: 'fisico', desc: 'Área 3×3. Imobiliza inimigos por 1 turno. MORAKI sai da área.' },
            ],
            fraseLore: 'Minha sombra chega antes de mim. E você já caiu.',
          },
        },
      },
      tufao: {
        id: 'tufao',
        nome: 'MORAKI — TUFÃO',
        desc: 'A tempestade se torna uma só com o lutador.',
        bonusAtributos: { forca: 2, velocidade: 3 },
        bonusHp: 0.15,
        bonusSp: 0.15,
        passiva: { nome: 'Olho da Tempestade', desc: 'Rajada Ciclônica tem área +1 e empurra +1 casa.' },
        skills_novas: [
          { id: 'olho_tufao', nome: 'Olho do Tufão', custo: 5, alcance: 3, dano: 2.0, tipo: 'fisico', desc: 'Área circular 3×3. Puxa inimigos para o centro.' },
          { id: 'vento_cortante', nome: 'Vento Cortante', custo: 3, alcance: 5, dano: 1.2, tipo: 'fisico', desc: 'Linha reta. Ignora obstáculos. Sangramento 2 turnos.' },
        ],
        fraseLore: 'A tempestade não pede licença. Ela chega.',
        subRamos: {
          ciclone: {
            id: 'ciclone',
            nome: 'MORAKI — CICLONE',
            desc: 'O centro da tempestade. Onde tudo é destruído.',
            bonusAtributos: { forca: 3, velocidade: 2 },
            bonusHp: 0.20,
            bonusSp: 0.10,
            passiva: { nome: 'Ciclone Furioso', desc: 'Skills de dano em área causam +25% dano.' },
            skills_novas: [
              { id: 'furia_tempestade', nome: 'Fúria da Tempestade', custo: 6, alcance: 4, dano: 2.5, tipo: 'fisico', desc: 'Área 4×4. Dano massivo. Atordoa 1 turno.' },
              { id: 'sopro_divino', nome: 'Sopro Divino', custo: 4, alcance: 3, dano: 1.8, tipo: 'fisico', desc: 'Cone. Empurra 3 casas. Derruba.' },
            ],
            fraseLore: 'O vento que derruba muralhas. O sopro que apaga estrelas.',
          },
          vortice: {
            id: 'vortice',
            nome: 'MORAKI — VÓRTICE',
            desc: 'O olho do furacão. O silêncio antes da destruição.',
            bonusAtributos: { velocidade: 2, precisao: 3 },
            bonusHp: 0.10,
            bonusSp: 0.20,
            passiva: { nome: 'Campo de Pressão', desc: 'Inimigos na área do Olho do Tufão têm -2 MOV por 1 turno.' },
            skills_novas: [
              { id: 'sugar_vortex', nome: 'Sugar Vórtice', custo: 5, alcance: 4, dano: 1.5, tipo: 'fisico', desc: 'Puxa todos inimigos em área 3×3 para centro. Imobiliza 1 turno.' },
              { id: 'olho_furacao', nome: 'Olho do Furacão', custo: 4, alcance: 0, dano: 0, tipo: 'buff', desc: 'Próximas 2 skills têm alcance +2 e dano +30%.' },
            ],
            fraseLore: 'O centro do caos. Onde tudo gira. Onde tudo acaba.',
          },
        },
      },
    },
  },

  tivara: {
    id: 'tivara',
    nome: 'TIVARA',
    tipo: 'Armas',
    papel: 'DPS',
    desc: 'Xamã Arqueira. Flechas carregadas de energia elemental. Precisão cirúrgica.',
    desc_en: 'Shaman Archer. Arrows charged with elemental energy. Surgical precision.',
    atributos_base: { forca: 8, velocidade: 13, resistencia: 7, energia: 15, precisao: 18, tenacidade: 6 },
    sprite: { corpo: 'elipse', cor_primaria: '#2ECC71', cor_secundaria: '#A8E6CF' },
    passiva: { nome: 'Olho de Águia', desc: '+20% precisão em alcance 3+. Acerto crítico causa +50% dano.' },
    skills_base: [
      { id: 'flecha_certeira', nome: 'Flecha Certeira', custo: 1, alcance: 4, dano: 0.9, tipo: 'arma', desc: 'Tiro preciso. Ignora bônus de defesa.' },
      { id: 'chuva_flechas', nome: 'Chuva de Flechas', custo: 3, alcance: 3, dano: 0.7, tipo: 'arma', desc: 'Área 2×2. Dano em todos na área.' },
      { id: 'marca_cacador', nome: 'Marca do Caçador', custo: 2, alcance: 4, dano: 0, tipo: 'debuff', desc: 'Marca inimigo. Próximo ataque contra ele causa +40% dano.' },
    ],
    ramos: {
      precisao: {
        id: 'precisao',
        nome: 'TIVARA — PRECISÃO',
        desc: 'Cada flecha encontra seu alvo. Sem exceção.',
        bonusAtributos: { precisao: 3, energia: 2 },
        bonusHp: 0.05,
        bonusSp: 0.20,
        passiva: { nome: 'Olho de Águia +', desc: '+30% precisão em alcance 3+. Crítico causa +75% dano.' },
        skills_novas: [
          { id: 'flecha_perfurante', nome: 'Flecha Perfurante', custo: 3, alcance: 5, dano: 1.3, tipo: 'arma', desc: 'Atravessa inimigos em linha. Dano reduz 10% por alvo.' },
          { id: 'tiro_triplo', nome: 'Tiro Triplo', custo: 4, alcance: 3, dano: 1.5, tipo: 'arma', desc: 'Três flechas em alvos diferentes (máx 2 casas entre alvos).' },
        ],
        fraseLore: 'O olho que não erra. A flecha que não falha.',
        subRamos: {
          perfuracao: {
            id: 'perfuracao',
            nome: 'TIVARA — PERFURAÇÃO',
            desc: 'A flecha que atravessa tudo.',
            bonusAtributos: { precisao: 3, forca: 2 },
            bonusHp: 0.10,
            bonusSp: 0.15,
            passiva: { nome: 'Flecha Fantasma', desc: 'Ataques à distância ignoram 20% da DEF do alvo.' },
            skills_novas: [
              { id: 'rajada_perfurante', nome: 'Rajada Perfurante', custo: 5, alcance: 6, dano: 2.0, tipo: 'arma', desc: 'Dispara 3 flechas em linha. Cada uma atravessa. Dano acumula.' },
              { id: 'olho_falcao', nome: 'Olho de Falcão', custo: 2, alcance: 0, dano: 0, tipo: 'buff', desc: 'Próximos 2 ataques têm alcance +2 e +30% crítico.' },
            ],
            fraseLore: 'Nem a distância me protege de você.',
          },
          miragem: {
            id: 'miragem',
            nome: 'TIVARA — MIRAGEM',
            desc: 'Onde você vê uma flecha, na verdade são três.',
            bonusAtributos: { precisao: 2, energia: 3 },
            bonusHp: 0.05,
            bonusSp: 0.25,
            passiva: { nome: 'Miragem', desc: 'Ataques têm 20% de chance de acertar um segundo alvo adjacente.' },
            skills_novas: [
              { id: 'chuva_estrelas', nome: 'Chuva de Estrelas', custo: 6, alcance: 5, dano: 2.2, tipo: 'arma', desc: 'Área 3×3. Múltiplas flechas. Chance de crítico +20%.' },
              { id: 'flecha_ilusao', nome: 'Flecha Ilusória', custo: 3, alcance: 4, dano: 1.0, tipo: 'arma', desc: 'Cria 2 cópias da flecha. Inimigo não sabe qual é a verdadeira.' },
            ],
            fraseLore: 'Você viu uma. Mas a que vai te acertar é outra.',
          },
        },
      },
      arco_ancestral: {
        id: 'arco_ancestral',
        nome: 'TIVARA — ARCO ANCESTRAL',
        desc: 'O arco desperta. Flechas que rasgam o céu.',
        bonusAtributos: { energia: 3, precisao: 2 },
        bonusHp: 0.10,
        bonusSp: 0.20,
        passiva: { nome: 'Flecha Elemental', desc: 'Flechas ganham o elemental do usuário. +15% dano contra desvantagem.' },
        skills_novas: [
          { id: 'flecha_ancestral', nome: 'Flecha Ancestral', custo: 6, alcance: 5, dano: 2.5, tipo: 'arma', desc: 'Máximo de energia elemental. Dano massivo em área 2×2.' },
          { id: 'olho_falcao_ancestral', nome: 'Visão Ancestral', custo: 2, alcance: 0, dano: 0, tipo: 'buff', desc: 'Próximos 2 ataques têm alcance +3 e +40% crítico.' },
        ],
        fraseLore: 'O arco que veio dos deuses. A flecha que volta para eles.',
        subRamos: {
          arco_sagrado: {
            id: 'arco_sagrado',
            nome: 'TIVARA — ARCO SAGRADO',
            desc: 'Luz e flecha. Cura e punição.',
            bonusAtributos: { energia: 5 },
            bonusHp: 0.15,
            bonusSp: 0.20,
            passiva: { nome: 'Luz Sagrada', desc: 'Ataques curam aliados adjacentes em 10% do dano causado.' },
            skills_novas: [
              { id: 'flecha_luz', nome: 'Flecha de Luz', custo: 4, alcance: 5, dano: 1.8, tipo: 'arma', desc: 'Cura aliado mais próximo em 50% do dano. Purifica debuffs.' },
              { id: 'julgamento', nome: 'Julgamento', custo: 7, alcance: 6, dano: 3.0, tipo: 'arma', desc: 'Dano massivo. Inimigos mortos não podem ser reanimados nesta batalha.' },
            ],
            fraseLore: 'A luz guia minha flecha. E a luz não erra o caminho.',
          },
          arco_negro: {
            id: 'arco_negro',
            nome: 'TIVARA — ARCO NEGRO',
            desc: 'A escuridão também tem seus arqueiros.',
            bonusAtributos: { precisao: 2, tenacidade: 3 },
            bonusHp: 0.10,
            bonusSp: 0.20,
            passiva: { nome: 'Sombra Elemental', desc: 'Ataques causam medo por 1 turno em 20% dos acertos.' },
            skills_novas: [
              { id: 'flecha_trevas', nome: 'Flecha das Trevas', custo: 4, alcance: 5, dano: 2.0, tipo: 'arma', desc: 'Cega alvo por 1 turno. Dano aumenta 20% se alvo já está cego.' },
              { id: 'chuva_negra', nome: 'Chuva Negra', custo: 6, alcance: 4, dano: 2.5, tipo: 'arma', desc: 'Área 3×3. Cegueira + sangramento por 2 turnos.' },
            ],
            fraseLore: 'A escuridão não erra. A escuridão não perdoa.',
          },
        },
      },
    },
  },

  zephyra: {
    id: 'zephyra',
    nome: 'ZEPHYRA',
    tipo: 'Poder',
    papel: 'Suporte/Controle',
    desc: 'Feiticeira das Marés. Manipula água e emoções. Cura e confunde.',
    desc_en: 'Tide Sorceress. Manipulates water and emotions. Heals and confuses.',
    atributos_base: { forca: 5, velocidade: 9, resistencia: 8, energia: 20, precisao: 10, tenacidade: 10 },
    sprite: { corpo: 'gota', cor_primaria: '#1E90FF', cor_secundaria: '#87CEEB' },
    passiva: { nome: 'Fluxo Contínuo', desc: 'Skills de cura curam +20%. Aliados curados ganham 1 de Energia Mental.' },
    skills_base: [
      { id: 'jato_dagua', nome: 'Jato D\'Água', custo: 1, alcance: 3, dano: 0.6, tipo: 'poder', desc: 'Dano leve. Reduz velocidade do alvo em 1 casa no próximo turno.' },
      { id: 'onda_curativa', nome: 'Onda Curativa', custo: 2, alcance: 2, dano: 0, tipo: 'cura', desc: 'Cura 25% HP máximo de um aliado.' },
      { id: 'névoa_confusao', nome: 'Névoa da Confusão', custo: 3, alcance: 3, dano: 0, tipo: 'debuff', desc: 'Área 2×2. Inimigos têm 40% de chance de errar ações por 1 turno.' },
    ],
    ramos: {
      sirena: {
        id: 'sirena',
        nome: 'ZEPHYRA — SIRENA',
        desc: 'O canto da sereia confunde até os mais fortes.',
        bonusAtributos: { energia: 3, tenacidade: 2 },
        bonusHp: 0.10,
        bonusSp: 0.25,
        passiva: { nome: 'Canto Hipnótico', desc: 'Skills de debuff têm +20% de chance de aplicar.' },
        skills_novas: [
          { id: 'canto_sereia', nome: 'Canto da Sereia', custo: 3, alcance: 4, dano: 0, tipo: 'debuff', desc: 'Inimigo age 1 turno a favor do aliado mais próximo.' },
          { id: 'mare_vital', nome: 'Maré Vital', custo: 4, alcance: 3, dano: 0, tipo: 'cura', desc: 'Cura 40% HP de TODOS os aliados na área 2×2.' },
        ],
        fraseLore: 'O canto que acalma. O canto que controla. O canto que mata.',
        subRamos: {
          mare_alta: { id: 'mare_alta', nome: 'ZEPHYRA — MARÉ ALTA', desc: 'A maré sobe. E leva tudo.', bonusAtributos: { energia: 3, resistencia: 2 }, bonusHp: 0.15, bonusSp: 0.25, passiva: { nome: 'Maré Cheia', desc: 'Skills de cura curam +30%. Aliados curados ganham +1 MOV no próximo turno.' }, skills_novas: [{ id: 'mare_cheia', nome: 'Maré Cheia', custo: 5, alcance: 4, dano: 0, tipo: 'cura', desc: 'Cura 50% HP de todos aliados + buff de movimento.' }, { id: 'abracao_mar', nome: 'Abraço do Mar', custo: 6, alcance: 3, dano: 2.0, tipo: 'poder', desc: 'Prende inimigos em área 2×2 por 2 turnos. Cura aliados na área.' }], fraseLore: 'O mar abraça. O mar afoga. O mar decide.' },
          oceano_prof: { id: 'oceano_prof', nome: 'ZEPHYRA — OCEANO PROFUNDO', desc: 'Nas profundezas, ninguém ouve você gritar.', bonusAtributos: { energia: 5 }, bonusHp: 0.10, bonusSp: 0.30, passiva: { nome: 'Pressão Abissal', desc: 'Debuffs duram +1 turno.' }, skills_novas: [{ id: 'abismo', nome: 'Abismo', custo: 5, alcance: 4, dano: 1.5, tipo: 'poder', desc: 'Área 3×3. Imobiliza + silencia por 2 turnos.' }, { id: 'correnteza', nome: 'Correnteza', custo: 3, alcance: 5, dano: 0, tipo: 'debuff', desc: 'Puxa alvo 4 casas na direção de ZEPHYRA. Imobiliza 1 turno.' }], fraseLore: 'O fundo do mar guarda segredos. E corpos.' },
        },
      },
      tsunami: {
        id: 'tsunami',
        nome: 'ZEPHYRA — TSUNAMI',
        desc: 'A feiticeira se torna a tempestade. Cura e destruição em igual medida.',
        bonusAtributos: { energia: 2, forca: 2, velocidade: 1 },
        bonusHp: 0.15,
        bonusSp: 0.20,
        passiva: { nome: 'Maré de Sangue', desc: 'Habilidades de dano curam ZEPHYRA em 30% do dano causado.' },
        skills_novas: [
          { id: 'tsunami_skill', nome: 'Tsunami', custo: 6, alcance: 4, dano: 1.8, tipo: 'poder', desc: 'Onda massiva em cone. Dano + empurra 2 casas + atordoamento.' },
          { id: 'renovacao', nome: 'Renovação', custo: 5, alcance: 2, dano: 0, tipo: 'cura', desc: 'Cura 60% HP + remove todos os debuffs de um aliado.' },
        ],
        fraseLore: 'A onda não escolhe. A onda leva.',
        subRamos: {
          tempestade: { id: 'tempestade', nome: 'ZEPHYRA — TEMPESTADE', desc: 'O céu e o mar se encontram. E tudo se desfaz.', bonusAtributos: { energia: 3, precisao: 2 }, bonusHp: 0.10, bonusSp: 0.25, passiva: { nome: 'Fúria da Tempestade', desc: 'Habilidades de dano em área causam +30% dano.' }, skills_novas: [{ id: 'furia_mares', nome: 'Fúria dos Mares', custo: 7, alcance: 5, dano: 2.8, tipo: 'poder', desc: 'Área 4×4. Dano massivo. Atordoa 2 turnos. Uma vez por batalha.' }, { id: 'rajada_maritima', nome: 'Rajada Marítima', custo: 3, alcance: 3, dano: 1.2, tipo: 'poder', desc: 'Cone. Empurra 2 casas. Derruba voadores.' }], fraseLore: 'A tempestade sou eu. E eu não peço licença.' },
          calmaria: { id: 'calmaria', nome: 'ZEPHYRA — CALMARIA', desc: 'O olho da tempestade. Onde tudo se acalma.', bonusAtributos: { resistencia: 3, energia: 2 }, bonusHp: 0.20, bonusSp: 0.20, passiva: { nome: 'Olho da Calmaria', desc: 'No início de cada turno, cura 5% HP de todos aliados.' }, skills_novas: [{ id: 'calmaria_skill', nome: 'Calmaria', custo: 4, alcance: 0, dano: 0, tipo: 'cura', desc: 'Remove todos debuffs de aliados. Cura 30% HP. Silencia inimigos 1 turno.' }, { id: 'brisa_suave', nome: 'Brisa Suave', custo: 2, alcance: 3, dano: 0, tipo: 'cura', desc: 'Cura 20% HP + remove sangramento/queimadura de um aliado.' }], fraseLore: 'Depois da tempestade vem a calmaria. E na calmaria, a renovação.' },
        },
      },
    },
  },

  ignis: {
    id: 'ignis',
    nome: 'IGNIS',
    tipo: 'Poder',
    papel: 'DPS/Burst',
    desc: 'Piromante Instável. Fogo que consome tudo — inclusive o próprio usuário.',
    desc_en: 'Unstable Pyromancer. Fire that consumes everything — including the user.',
    atributos_base: { forca: 4, velocidade: 11, resistencia: 5, energia: 22, precisao: 12, tenacidade: 8 },
    sprite: { corpo: 'chama', cor_primaria: '#FF4500', cor_secundaria: '#FFD700' },
    passiva: { nome: 'Chamas Caóticas', desc: 'Skills têm 20% de chance de causar queimadura (dano 5% HP por turno).' },
    skills_base: [
      { id: 'bola_fogo', nome: 'Bola de Fogo', custo: 2, alcance: 3, dano: 1.1, tipo: 'poder', desc: 'Dano médio. Chance 30% de queimadura.' },
      { id: 'explosao', nome: 'Explosão', custo: 3, alcance: 2, dano: 1.5, tipo: 'poder', desc: 'Área 2×2. Dano alto. Autodano 10% HP.' },
      { id: 'chama_rapida', nome: 'Chama Rápida', custo: 1, alcance: 2, dano: 0.5, tipo: 'poder', desc: 'Dano baixo. Aplica queimadura garantida por 2 turnos.' },
    ],
    ramos: {
      labareda: {
        id: 'labareda',
        nome: 'IGNIS — LABAREDA',
        desc: 'O fogo controlado é mais perigoso que o fogo solto.',
        bonusAtributos: { energia: 3, precisao: 2 },
        bonusHp: 0.05,
        bonusSp: 0.25,
        passiva: { nome: 'Chamas Controladas', desc: 'Queimadura causa +2% HP por turno. Chance de queimadura +15%.' },
        skills_novas: [
          { id: 'labareda_skill', nome: 'Labareda', custo: 4, alcance: 4, dano: 1.8, tipo: 'poder', desc: 'Linha reta. Queimadura garantida + dano em área no final.' },
          { id: 'combustao', nome: 'Combustão', custo: 3, alcance: 2, dano: 1.3, tipo: 'poder', desc: 'Inimigos queimados recebem +50% dano desta skill.' },
        ],
        fraseLore: 'O fogo que obedece. O fogo que destrói sob comando.',
        subRamos: {
          chama_eterna: { id: 'chama_eterna', nome: 'IGNIS — CHAMA ETERNA', desc: 'O fogo que nunca se apaga.', bonusAtributos: { energia: 5 }, bonusHp: 0.10, bonusSp: 0.30, passiva: { nome: 'Eternidade', desc: 'Queimadura não expira. Dura o combate inteiro.' }, skills_novas: [{ id: 'chama_eterna_skill', nome: 'Chama Eterna', custo: 5, alcance: 3, dano: 2.0, tipo: 'poder', desc: 'Aplica queimadura permanente. Dano em área 2×2.' }, { id: 'pira_eterna', nome: 'Pira Eterna', custo: 6, alcance: 4, dano: 2.5, tipo: 'poder', desc: 'Inimigos queimados recebem +100% dano. Explodem ao morrer.' }], fraseLore: 'O fogo que nunca se apaga. A chama que queima até o fim dos tempos.' },
          fogo_fatuo: { id: 'fogo_fatuo', nome: 'IGNIS — FOGO FÁTUO', desc: 'O fogo que engana. Que ilude. Que queima por trás.', bonusAtributos: { precisao: 3, velocidade: 2 }, bonusHp: 0.05, bonusSp: 0.30, passiva: { nome: 'Chama Enganosa', desc: '20% de chance de criar uma chama falsa que distrai o inimigo.' }, skills_novas: [{ id: 'ilusao_fogo', nome: 'Ilusão de Fogo', custo: 3, alcance: 4, dano: 1.0, tipo: 'poder', desc: 'Cria 2 chamas falsas. Inimigo pode atacar a chama em vez de IGNIS.' }, { id: 'explosao_fatua', nome: 'Explosão Fátua', custo: 5, alcance: 3, dano: 2.2, tipo: 'poder', desc: 'Chamas falsas explodem. +50% dano por chama no campo.' }], fraseLore: 'O fogo que você vê não é o que queima. O que queima você não vê.' },
        },
      },
      sol_negro: {
        id: 'sol_negro',
        nome: 'IGNIS — SOL NEGRO',
        desc: 'A chama que não se apaga. O sol que queima até a escuridão.',
        bonusAtributos: { forca: 2, energia: 3 },
        bonusHp: 0.10,
        bonusSp: 0.20,
        passiva: { nome: 'Núcleo de Fogo', desc: 'Habilidades custam -1 de Energia Mental se IGNIS está com menos de 30% HP.' },
        skills_novas: [
          { id: 'sol_negro_skill', nome: 'Sol Negro', custo: 7, alcance: 3, dano: 3.0, tipo: 'poder', desc: 'Dano massivo em área 2×2. Autodano 20% HP. Só usa uma vez por batalha.' },
          { id: 'nucleo_ardente', nome: 'Núcleo Ardente', custo: 2, alcance: 0, dano: 0, tipo: 'buff', desc: 'Próximas 3 skills custam -1 Energia Mental.' },
        ],
        fraseLore: 'O sol que queima até a si mesmo. A chama que consome tudo.',
        subRamos: {
          sol: { id: 'sol', nome: 'IGNIS — SOL', desc: 'O astro-rei. A fonte de toda chama.', bonusAtributos: { energia: 4, forca: 1 }, bonusHp: 0.15, bonusSp: 0.25, passiva: { nome: 'Radiação', desc: 'No início do turno, causa 3% HP de dano a inimigos adjacentes.' }, skills_novas: [{ id: 'explosao_solar', nome: 'Explosão Solar', custo: 8, alcance: 4, dano: 3.5, tipo: 'poder', desc: 'Área 3×3. Dano máximo. Queimadura garantida. Uma vez por batalha.' }, { id: 'chama_solar', nome: 'Chama Solar', custo: 3, alcance: 3, dano: 1.5, tipo: 'poder', desc: 'Cega inimigos por 1 turno. +30% dano contra cegos.' }], fraseLore: 'Olhe para o sol. E queime.' },
          nova: { id: 'nova', nome: 'IGNIS — NOVA', desc: 'A explosão que ilumina o universo.', bonusAtributos: { energia: 5 }, bonusHp: 0.05, bonusSp: 0.35, passiva: { nome: 'Supernova', desc: 'Ao morrer, causa 50% do HP máximo em dano em área 4×4.' }, skills_novas: [{ id: 'nova_skill', nome: 'Nova', custo: 9, alcance: 5, dano: 4.0, tipo: 'poder', desc: 'Área 4×4. Dano devastador. IGINIS perde 30% HP. Uma vez por batalha.' }, { id: 'pre_nova', nome: 'Pré-Nova', custo: 4, alcance: 0, dano: 0, tipo: 'buff', desc: 'Próximo ataque causa +100% dano. Mas IGNIS recebe +20% dano por 2 turnos.' }], fraseLore: 'O fim de tudo. O começo de nada. A última chama.' },
        },
      },
    },
  },

  nami: {
    id: 'nami',
    nome: 'NAMI',
    tipo: 'Armas',
    papel: 'Disruptor/Mobilidade',
    desc: 'Dançarina de Lâminas. Adaga e acrobacia. O palco é dela — você só está no caminho.',
    desc_en: 'Blade Dancer. Dagger and acrobatics. The stage is hers — you\'re just in the way.',
    atributos_base: { forca: 11, velocidade: 17, resistencia: 6, energia: 10, precisao: 15, tenacidade: 7 },
    sprite: { corpo: 'losango', cor_primaria: '#9B59B6', cor_secundaria: '#E8A0E8' },
    passiva: { nome: 'Dança das Facas', desc: 'Após matar um inimigo, ganha turno extra (1x por batalha).' },
    skills_base: [
      { id: 'adaga_rapida', nome: 'Adaga Rápida', custo: 1, alcance: 1, dano: 0.7, tipo: 'arma', desc: 'Golpe rápido. Pode atacar e mover na mesma ação.' },
      { id: 'rolamento_acrobatico', nome: 'Rolamento Acrobático', custo: 1, alcance: 3, dano: 0, tipo: 'mov', desc: 'Move para qualquer casa vazia no alcance. Inimigos adjacentes levam dano leve.' },
      { id: 'chuva_laminas', nome: 'Chuva de Lâminas', custo: 3, alcance: 2, dano: 1.2, tipo: 'arma', desc: 'Área 2×2. Sangramento 2 turnos.' },
    ],
    ramos: {
      sombra_ramo: {
        id: 'sombra_ramo',
        nome: 'NAMI — SOMBRA',
        desc: 'As lâminas se movem antes da luz.',
        bonusAtributos: { velocidade: 3, precisao: 2 },
        bonusHp: 0.05,
        bonusSp: 0.20,
        passiva: { nome: 'Dança das Sombras', desc: '+1 casa de movimento. Ataques pelas costas causam +30% dano.' },
        skills_novas: [
          { id: 'sombra_fatal', nome: 'Sombra Fatal', custo: 3, alcance: 1, dano: 1.8, tipo: 'arma', desc: 'Ataque pelas costas: +100% dano se alvo não está virado para Nami.' },
          { id: 'clone_ilusao', nome: 'Clone de Ilusão', custo: 2, alcance: 2, dano: 0, tipo: 'mov', desc: 'Cria um clone que dura 1 turno. Inimigo pode atacar o clone.' },
        ],
        fraseLore: 'A sombra dança. E você dança com ela. Até cair.',
        subRamos: {
          ilusao: { id: 'ilusao', nome: 'NAMI — ILUSÃO', desc: 'O que você vê não é real. O que é real você não vê.', bonusAtributos: { velocidade: 2, tenacidade: 3 }, bonusHp: 0.05, bonusSp: 0.25, passiva: { nome: 'Ilusionista', desc: 'Clones ganham ataque próprio (50% do dano de NAMI).' }, skills_novas: [{ id: 'danca_ilusoes', nome: 'Dança das Ilusões', custo: 4, alcance: 2, dano: 1.5, tipo: 'arma', desc: 'Cria 3 clones em área. Cada um ataca alvo diferente. 1.5 DMG cada.' }, { id: 'troca_ilusao', nome: 'Troca Ilusória', custo: 2, alcance: 4, dano: 0, tipo: 'mov', desc: 'Troca de lugar com um clone. Inimigo ataca o clone.' }], fraseLore: 'Eu sou mil. Eu sou nenhuma. Eu sou o palco.' },
          engano: { id: 'engano', nome: 'NAMI — ENGANO', desc: 'A verdade dói. A mentira mata.', bonusAtributos: { precisao: 3, velocidade: 2 }, bonusHp: 0.10, bonusSp: 0.20, passiva: { nome: 'Golpe Baixo', desc: 'Ataques contra inimigos com debuff causam +40% dano.' }, skills_novas: [{ id: 'golpe_veneno', nome: 'Golpe Venenoso', custo: 3, alcance: 1, dano: 1.3, tipo: 'arma', desc: 'Envenena 3 stacks. NAMI ganha invisibilidade 1 turno.' }, { id: 'ataque_furtivo', nome: 'Ataque Furtivo', custo: 5, alcance: 2, dano: 2.5, tipo: 'arma', desc: 'Só funciona se NAMI está invisível. Dano crítico garantido.' }], fraseLore: 'Você confia em mim? Erro seu.' },
        },
      },
      crepusculo: {
        id: 'crepusculo',
        nome: 'NAMI — CREPÚSCULO',
        desc: 'Entre a luz e a escuridão, a dançarina decide quem cai.',
        bonusAtributos: { forca: 2, velocidade: 2, precisao: 1 },
        bonusHp: 0.10,
        bonusSp: 0.15,
        passiva: { nome: 'Dança do Crepúsculo', desc: 'A cada inimigo diferente acertado na mesma skill, ganha +1 de Energia Mental.' },
        skills_novas: [
          { id: 'danca_crepusculo', nome: 'Dança do Crepúsculo', custo: 5, alcance: 2, dano: 2.2, tipo: 'arma', desc: 'Sequência de 4 golpes em alvos diferentes. Último golpe causa +100% se todos acertarem.' },
          { id: 'escapista', nome: 'Escapista', custo: 2, alcance: 4, dano: 0, tipo: 'mov', desc: 'Teletransporta + invisibilidade por 1 turno.' },
        ],
        fraseLore: 'Entre o dia e a noite, eu danço. E você cai.',
        subRamos: {
          diluculo: { id: 'diluculo', nome: 'NAMI — DILÚCULO', desc: 'A primeira luz do dia. A esperança que mata.', bonusAtributos: { forca: 3, velocidade: 2 }, bonusHp: 0.15, bonusSp: 0.15, passiva: { nome: 'Amanhecer', desc: 'NAMI regenera 5% HP por turno se está em área sem obstáculos.' }, skills_novas: [{ id: 'luz_alva', nome: 'Luz Alva', custo: 4, alcance: 2, dano: 1.8, tipo: 'arma', desc: 'Cega inimigos por 1 turno. NAMI fica invisível. Próximo ataque +50%.' }, { id: 'golpe_amanhecer', nome: 'Golpe do Amanhecer', custo: 6, alcance: 2, dano: 3.0, tipo: 'arma', desc: 'Ataca todos inimigos adjacentes. Cura NAMI em 30% do dano total.' }], fraseLore: 'A luz do amanhecer revela a verdade. E a verdade dói.' },
          ocaso: { id: 'ocaso', nome: 'NAMI — OCASO', desc: 'O fim do dia. O começo do medo.', bonusAtributos: { tenacidade: 2, precisao: 3 }, bonusHp: 0.10, bonusSp: 0.20, passiva: { nome: 'Última Dança', desc: 'Dança das Facas funciona 2x por batalha.' }, skills_novas: [{ id: 'danca_final', nome: 'Dança Final', custo: 7, alcance: 2, dano: 3.5, tipo: 'arma', desc: '6 golpes em área. Último golpe causa dano verdadeiro. Uma vez por batalha.' }, { id: 'crepusculo_skill', nome: 'Crepúsculo', custo: 3, alcance: 3, dano: 0, tipo: 'debuff', desc: 'Reduz visão do inimigo. Alcance dele cai em 2 por 2 turnos.' }], fraseLore: 'O sol se põe. E com ele, você.' },
        },
      },
    },
  },
}

/**
 * Retorna os dados de um nó específico da árvore (ramo ou sub-ramo)
 * @param {string} classeId - id da classe base
 * @param {string} ramoId - id do ramo (nível 40)
 * @param {string} [subRamoId] - id do sub-ramo (nível 70)
 */
export function getNo(classeId, ramoId, subRamoId) {
  const cls = CLASS_TREE[classeId]
  if (!cls) return null
  if (!ramoId) return cls
  const ramo = cls.ramos?.[ramoId]
  if (!ramo) return null
  if (!subRamoId) return ramo
  return ramo.subRamos?.[subRamoId] || null
}

/**
 * Retorna a evolução atual com base no nível e caminho evolutivo
 * @param {string} classeId
 * @param {number} nivel
 * @param {object} caminhoEvolutivo - { nivel40: string, nivel70: string }
 * @returns {object|null} - { nome, bonusAtributos, bonusHp, bonusSp, passiva, skills_novas, fraseLore }
 */
export function getEvolucaoAtiva(classeId, nivel, caminhoEvolutivo) {
  const cls = CLASS_TREE[classeId]
  if (!cls || !caminhoEvolutivo) return null

  if (nivel >= 70 && caminhoEvolutivo.nivel70) {
    const ramo = cls.ramos?.[caminhoEvolutivo.nivel40]
    return ramo?.subRamos?.[caminhoEvolutivo.nivel70] || null
  }
  if (nivel >= 40 && caminhoEvolutivo.nivel40) {
    return cls.ramos?.[caminhoEvolutivo.nivel40] || null
  }
  return null
}

/**
 * Retorna o nome completo da classe com base no nível e caminho evolutivo
 */
export function getNomeClasse(classeId, nivel, caminhoEvolutivo) {
  if (!caminhoEvolutivo) return CLASS_TREE[classeId]?.nome || classeId
  const evol = getEvolucaoAtiva(classeId, nivel, caminhoEvolutivo)
  return evol?.nome || CLASS_TREE[classeId]?.nome || classeId
}
