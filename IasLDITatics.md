SISTEMA DE IA — FILOSOFIAS DE COMBATE
Cada IA tem: personalidade, critério de seleção de personagens, prioridade de ação, e comportamento em situações específicas.

AS 8 PERSONALIDADES DE IA

1. O EXTERMINADOR
Filosofia: mata o mais fraco primeiro, sempre. Sem exceção.
Seleção de personagens:
Sempre escolhe os 4 de maior ATQ/ATQM dos disponíveis. Não liga pra sinergia. Quer dano puro.
jsconst EXTERMINADOR = {
  nome: 'O Exterminador',
  descricao: 'Elimina alvos em ordem crescente de HP.',

  selecionarTime(pool) {
    // ordena por ATQ total decrescente, pega os 4 primeiros
    return [...pool]
      .sort((a, b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal))
      .slice(0, 4);
  },

  escolherAlvo(meusPersonagens, inimigos) {
    // sempre o inimigo com menos HP atual
    return [...inimigos].sort((a, b) => a.hpAtual - b.hpAtual)[0];
  },

  escolherPersonagem(disponiveis, inimigos) {
    // usa quem tem mais ATQ primeiro
    return [...disponiveis]
      .sort((a, b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal))[0];
  },

  escolherSkill(personagem, alvo, inimigos) {
    // sempre a skill de maior DMG disponível
    return [...personagem.skills]
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga)
      .sort((a, b) => b.dmg - a.dmg)[0]
      ?? personagem.ataqueBasico;
  },

  // comportamento especial: se consegue matar alguém esse turno, faz isso antes de qualquer outra coisa
  prioridade(meusPersonagens, inimigos) {
    for (const meu of meusPersonagens) {
      for (const ini of inimigos) {
        const melhorSkill = meu.skills
          .filter(s => s.spCusto <= meu.spAtual && !s.emRecarga)
          .sort((a,b) => b.dmg - a.dmg)[0];
        if (melhorSkill && melhorSkill.dmg >= ini.hpAtual) {
          return { personagem: meu, skill: melhorSkill, alvo: ini };
        }
      }
    }
    return null; // sem kill confirmado, usa lógica padrão
  },
};
Time típico: Sete Cicatrizes + Relâmpago Branco + Mãos de Osso + Espinal
Fraqueza: ignora suporte, não cura, não controla terreno. Névoa da Manhã e Corvo de Draymoor o enlouquecem.

2. O CONTROLADOR
Filosofia: você não age se eu não deixar. Prioriza debuffs e imobilização acima de tudo.
Seleção de personagens:
Busca personagens com palavras-chave de controle nas skills.
jsconst CONTROLADOR = {
  nome: 'O Controlador',
  descricao: 'Paralisa o inimigo antes de atacar.',

  SKILLS_CONTROLE: [
    'Imobiliza', 'Atordoa', 'Silencia', 'Cega', 'Congela', 'Enreda', 'Medo'
  ],

  selecionarTime(pool) {
    // pontua cada personagem pelo número de skills de controle
    const pontuados = pool.map(p => ({
      p,
      score: p.skills.filter(s =>
        s.efeitos?.some(ef => this.SKILLS_CONTROLE.includes(ef))
      ).length
    }));
    return pontuados
      .sort((a,b) => b.score - a.score)
      .slice(0, 4)
      .map(x => x.p);
  },

  escolherAlvo(meusPersonagens, inimigos) {
    // prioriza quem NÃO está com debuff ainda
    const semDebuff = inimigos.filter(i => i.statuses.length === 0);
    if (semDebuff.length) {
      // dentro dos sem debuff, prefere o mais perigoso (mais ATQ)
      return semDebuff.sort((a,b) =>
        (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal)
      )[0];
    }
    // todos já têm debuff — aplica mais no mais ameaçador
    return [...inimigos].sort((a,b) =>
      (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal)
    )[0];
  },

  escolherSkill(personagem, alvo, inimigos) {
    const skills = personagem.skills
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga);

    // 1º: skill que aplica controle no alvo que ainda não tem esse controle
    const controle = skills.find(s =>
      s.efeitos?.some(ef => this.SKILLS_CONTROLE.includes(ef)) &&
      !alvo.statuses.find(st => s.efeitos.includes(st.nome))
    );
    if (controle) return controle;

    // 2º: qualquer skill de controle
    const qualquerControle = skills.find(s =>
      s.efeitos?.some(ef => this.SKILLS_CONTROLE.includes(ef))
    );
    if (qualquerControle) return qualquerControle;

    // 3º: ataque básico
    return personagem.ataqueBasico;
  },

  // nunca usa Berserker nem skills que custam HP próprio — não é o estilo
  filtrarSkillsProibidas(skills) {
    return skills.filter(s => !s.custoHpProprio);
  },
};
Time típico: Língua de Cobra + Sombra de Gelo + Lobo de Wendor + Névoa da Manhã
Fraqueza: pouco dano direto. Se o player tiver Doutor Ferrugem suprimindo habilidades, essa IA paralisa.

3. O OPORTUNISTA
Filosofia: reage ao estado atual do campo. Sem plano fixo — explora o que está vulnerável.
jsconst OPORTUNISTA = {
  nome: 'O Oportunista',
  descricao: 'Explora fraquezas abertas. Nunca faz a jogada óbvia.',

  selecionarTime(pool) {
    // time balanceado: 1 tanque, 1 dano, 1 controle, 1 suporte
    const tanques   = pool.filter(p => p.hpMax > 1500).slice(0, 1);
    const dano      = pool.filter(p => p.atqTotal > 180 || p.atqmTotal > 250).slice(0, 1);
    const controle  = pool.filter(p =>
      p.skills.some(s => s.efeitos?.includes('Imobiliza') || s.efeitos?.includes('Silencia'))
    ).slice(0, 1);
    const suporte   = pool.filter(p =>
      p.skills.some(s => s.efeitos?.includes('Cura'))
    ).slice(0, 1);
    return [...tanques, ...dano, ...controle, ...suporte].slice(0, 4);
  },

  escolherAlvo(meusPersonagens, inimigos) {
    // pontuação de oportunidade para cada inimigo
    return [...inimigos].sort((a, b) => {
      const scoreA = this.calcularOportunidade(a, meusPersonagens);
      const scoreB = this.calcularOportunidade(b, meusPersonagens);
      return scoreB - scoreA;
    })[0];
  },

  calcularOportunidade(inimigo, meusPersonagens) {
    let score = 0;
    // HP baixo = oportunidade de kill
    const hpPct = inimigo.hpAtual / inimigo.hpMax;
    if (hpPct < 0.25) score += 40;
    else if (hpPct < 0.5) score += 20;
    // está imobilizado = fácil de acertar
    if (inimigo.statuses.find(s => s.nome === 'Imobilizado')) score += 30;
    // está silenciado = não vai se defender
    if (inimigo.statuses.find(s => s.nome === 'Silenciado')) score += 25;
    // é suporte = alto valor estratégico
    if (inimigo.arquetipo === 'suporte') score += 15;
    // estamos adjacentes = oportunidade de corpo a corpo
    // (isso dependeria da posição no grid — simplificado)
    return score;
  },

  escolherSkill(personagem, alvo, inimigos) {
    const skills = personagem.skills
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga);

    // se alvo está imobilizado, usa o de maior dano
    if (alvo.statuses.find(s => s.nome === 'Imobilizado')) {
      return skills.sort((a,b) => b.dmg - a.dmg)[0] ?? personagem.ataqueBasico;
    }
    // se alvo tem HP < 30%, tenta o kill
    if (alvo.hpAtual / alvo.hpMax < 0.30) {
      return skills.sort((a,b) => b.dmg - a.dmg)[0] ?? personagem.ataqueBasico;
    }
    // se alvo é suporte, tenta silenciar
    if (alvo.arquetipo === 'suporte') {
      const silencio = skills.find(s => s.efeitos?.includes('Silencia'));
      if (silencio) return silencio;
    }
    // caso padrão: skill mais adequada ao alcance atual
    return skills[Math.floor(Math.random() * skills.length)] ?? personagem.ataqueBasico;
  },
};
Time típico: Varia toda batalha. É o mais imprevisível.
Fraqueza: sem foco pode desperdiçar turnos. Um time de pressão constante como Exterminador pode sobrepô-lo.

4. O SITIADOR
Filosofia: controla o terreno. Força o player a ir até ele, nunca avança.
jsconst SITIADOR = {
  nome: 'O Sitiador',
  descricao: 'Transforma o grid num campo minado. Espera você entrar.',

  selecionarTime(pool) {
    // prioriza personagens que criam terreno ou armadilhas
    const keywords = ['Terreno', 'Armadilha', 'Raízes', 'Imobiliza', 'Empurra'];
    return [...pool]
      .sort((a,b) => {
        const sa = a.skills.filter(s => s.efeitos?.some(e => keywords.includes(e))).length;
        const sb = b.skills.filter(s => s.efeitos?.some(e => keywords.includes(e))).length;
        return sb - sa;
      })
      .slice(0, 4);
  },

  // prioridade máxima: instalar armadilhas e criar terreno nos primeiros 3 turnos
  faseInicial: true,
  turnos: 0,

  escolherAcao(meusPersonagens, inimigos, grid) {
    this.turnos++;

    if (this.turnos <= 3) {
      // fase de setup: usa skills de terreno/armadilha
      for (const p of meusPersonagens) {
        const setupSkill = p.skills
          .filter(s => !s.emRecarga && s.spCusto <= p.spAtual)
          .find(s => s.efeitos?.some(e =>
            ['Terreno', 'Armadilha', 'Raízes'].includes(e)
          ));
        if (setupSkill) {
          // coloca armadilha nas casas de passagem (calculado pelo grid)
          const casaPassagem = this.encontrarCasaPassagem(grid, inimigos);
          return { personagem: p, skill: setupSkill, posicao: casaPassagem };
        }
      }
    }

    // fase reativa: quando inimigo entra no terreno, ataca
    const inimigoNoTerreno = inimigos.find(i =>
      grid.getCelula(i.posicao)?.tipo === 'terreno_sitiador'
    );
    if (inimigoNoTerreno) {
      const atacante = meusPersonagens[0]; // o de maior dano
      const skill = atacante.skills
        .filter(s => !s.emRecarga && s.spCusto <= atacante.spAtual)
        .sort((a,b) => b.dmg - a.dmg)[0];
      return { personagem: atacante, skill, alvo: inimigoNoTerreno };
    }

    // se ninguém entrou ainda, reforça terreno
    return this.reforcarTerreno(meusPersonagens, grid);
  },

  encontrarCasaPassagem(grid, inimigos) {
    // simplificado: encontra o meio do grid como ponto de passagem
    return { row: 8, col: 4 };
  },

  reforcarTerreno(meusPersonagens, grid) {
    // usa personagem com skill de terreno disponível
    for (const p of meusPersonagens) {
      const skill = p.skills.find(s =>
        !s.emRecarga && s.efeitos?.includes('Terreno')
      );
      if (skill) return { personagem: p, skill, posicao: { row: 7, col: 3 } };
    }
    return null;
  },
};
Time típico: Raiz de Ferro + Lobo de Wendor + Guardião de Pedra + Videira
Fraqueza: Relâmpago Branco ignora o terreno com velocidade. Espiral de longe destrói sem entrar na zona.

5. O VAMPIRO
Filosofia: sobreviver a qualquer custo. Cura, escuda, regenera. Vence no desgaste.
jsconst VAMPIRO = {
  nome: 'O Vampiro',
  descricao: 'Nunca morre. Vence quando você ficar sem recursos.',

  selecionarTime(pool) {
    // prioriza HP alto e skills de cura/escudo
    const curadoresEtanques = pool
      .filter(p =>
        p.hpMax > 1200 ||
        p.skills.some(s => s.efeitos?.includes('Cura')) ||
        p.skills.some(s => s.nome.toLowerCase().includes('escudo') ||
                           s.nome.toLowerCase().includes('bloqueio'))
      )
      .sort((a,b) => b.hpMax - a.hpMax)
      .slice(0, 4);
    return curadoresEtanques;
  },

  escolherAcao(meusPersonagens, inimigos) {
    // 1º: cura quem está abaixo de 50% HP
    for (const p of meusPersonagens) {
      if (p.hpAtual / p.hpMax < 0.5) {
        const curador = meusPersonagens.find(m => m !== p &&
          m.skills.some(s => s.efeitos?.includes('Cura') && !s.emRecarga)
        );
        if (curador) {
          const skillCura = curador.skills.find(s =>
            s.efeitos?.includes('Cura') && !s.emRecarga
          );
          return { personagem: curador, skill: skillCura, alvo: p };
        }
      }
    }

    // 2º: ressuscitar aliado caído
    const caido = meusPersonagens.find(p => p.hpAtual <= 0);
    if (caido) {
      const ressuscitador = meusPersonagens.find(m =>
        m.skills.some(s =>
          (s.efeitos?.includes('Ressurreicao') || s.nome.includes('Choque')) &&
          !s.emRecarga &&
          m.spAtual >= s.spCusto
        )
      );
      if (ressuscitador) {
        const sk = ressuscitador.skills.find(s =>
          s.efeitos?.includes('Ressurreicao') && !s.emRecarga
        );
        return { personagem: ressuscitador, skill: sk, alvo: caido };
      }
    }

    // 3º: tanque vai na frente bloquear
    const tanque = meusPersonagens
      .filter(p => p.hpAtual > 0)
      .sort((a,b) => b.defFisicaPct - a.defFisicaPct)[0];
    if (tanque) {
      const posicaoFrente = { row: 8, col: tanque.posicao.col };
      return { personagem: tanque, acao: 'mover', posicao: posicaoFrente };
    }

    // 4º: ataque mínimo — só pra não passar turno em branco
    const atacante = meusPersonagens.find(p => p.hpAtual > 0);
    return {
      personagem: atacante,
      skill: atacante.ataqueBasico,
      alvo: inimigos[0],
    };
  },

  // nunca usa skill que custa HP próprio (ex: Berserker)
  filtrarSkills(skills) {
    return skills.filter(s => !s.custoHpProprio);
  },
};
Time típico: Ferro Velho + Última Chama + Tocha Sagrada + Cinza
Fraqueza: Língua de Cobra silenciando Última Chama tira a ressurreição. Dano alto acumulado derruba antes de curar.

6. O CAÇADOR
Filosofia: identifica o suporte/curador inimigo e o elimina primeiro. Sempre.
jsconst CACADOR = {
  nome: 'O Caçador',
  descricao: 'Elimina o suporte inimigo antes de qualquer outra coisa.',

  ARQUETIPO_PRIORIDADE: [
    'suporte',      // Tocha Sagrada, Última Chama, Névoa da Manhã
    'mago',         // Espiral
    'debuffador',   // Língua de Cobra
    'assassino',    // Relâmpago Branco
    'atirador',     // Sombra de Gelo, Lobo de Wendor, Espinho Negro
    'bruiser',
    'tanque',       // por último — difícil de matar
  ],

  selecionarTime(pool) {
    // quer alcance e mobilidade pra chegar no suporte rápido
    return [...pool]
      .sort((a,b) => {
        const mobilA = a.mov + (a.alcanceMax || 1);
        const mobilB = b.mov + (b.alcanceMax || 1);
        return mobilB - mobilA;
      })
      .slice(0, 4);
  },

  identificarAlvoIdeal(inimigos) {
    // ordena inimigos pela prioridade de arquétipo
    return [...inimigos].sort((a,b) => {
      const prioA = this.ARQUETIPO_PRIORIDADE.indexOf(a.arquetipo);
      const prioB = this.ARQUETIPO_PRIORIDADE.indexOf(b.arquetipo);
      // se o arquétipo não está na lista, vai pro fim
      const normA = prioA === -1 ? 99 : prioA;
      const normB = prioB === -1 ? 99 : prioB;
      return normA - normB;
    })[0];
  },

  alvoFixo: null, // persiste o alvo entre turnos

  escolherAlvo(meusPersonagens, inimigos) {
    // se o alvo fixo ainda está vivo, continua nele
    if (this.alvoFixo && inimigos.find(i => i.id === this.alvoFixo.id)) {
      return inimigos.find(i => i.id === this.alvoFixo.id);
    }
    // senão, identifica novo alvo
    this.alvoFixo = this.identificarAlvoIdeal(inimigos);
    return this.alvoFixo;
  },

  escolherPersonagem(disponiveis, alvo) {
    // quem consegue chegar no alvo esse turno?
    const alcanca = disponiveis.filter(p => {
      const distancia = Math.abs(p.posicao.row - alvo.posicao.row) +
                        Math.abs(p.posicao.col - alvo.posicao.col);
      return distancia <= p.mov + p.alcanceMax;
    });
    if (alcanca.length) {
      // quem tem mais dano entre os que alcançam
      return alcanca.sort((a,b) =>
        (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal)
      )[0];
    }
    // ninguém alcança — quem está mais perto
    return disponiveis.sort((a,b) => {
      const distA = Math.abs(a.posicao.row - alvo.posicao.row);
      const distB = Math.abs(b.posicao.row - alvo.posicao.row);
      return distA - distB;
    })[0];
  },
};
Time típico: Relâmpago Branco + Dente de Sabre + Corvo de Draymoor + Sombra de Gelo
Fraqueza: se o player não tiver suporte, o Caçador fica sem direção clara. Ferro Velho na frente bloqueando o caminho também atrapalha.

7. O KAMIKAZE
Filosofia: troca de dano sempre. Aceita levar para dar mais. Não recua nunca.
jsconst KAMIKAZE = {
  nome: 'O Kamikaze',
  descricao: 'Troca de dano sem recuar. Aceita morrer se eliminar um inimigo.',

  selecionarTime(pool) {
    // quer personagens que escalam com dano recebido ou têm autopenalidade
    const prefere = [
      'Sete Cicatrizes', // escala com cicatrizes
      'Mãos de Osso',   // bônus com HP baixo
      'Carvão',         // explosão que dói nos dois
      'Berserker',
    ];
    const preferidos = pool.filter(p => prefere.includes(p.nome));
    const resto = pool
      .filter(p => !prefere.includes(p.nome))
      .sort((a,b) => b.atqTotal - a.atqTotal);
    return [...preferidos, ...resto].slice(0, 4);
  },

  escolherSkill(personagem, alvo) {
    const skills = personagem.skills
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga);

    // usa skills com autopenalidade sem hesitar
    const autopenalidade = skills.find(s => s.custoHpProprio);
    if (autopenalidade && personagem.hpAtual > personagem.hpMax * 0.3) {
      return autopenalidade;
    }

    // Berserker de Sete Cicatrizes — usa com 3+ cicatrizes (mais agressivo que o normal)
    if (personagem.nome === 'Sete Cicatrizes' && personagem.cicatrizesAtivas >= 3) {
      const berserker = skills.find(s => s.nome === 'Berserker');
      if (berserker) return berserker;
    }

    // Mãos de Osso — usa custo voluntário pra entrar na zona de bônus
    if (personagem.nome === 'Mãos de Osso' && personagem.hpAtual / personagem.hpMax > 0.5) {
      const custoVoluntario = skills.find(s => s.nome === 'Incisão Precisa' && s.modoVoluntario);
      if (custoVoluntario) return custoVoluntario;
    }

    return skills.sort((a,b) => b.dmg - a.dmg)[0] ?? personagem.ataqueBasico;
  },

  // nunca recua — sempre avança em direção ao inimigo mais próximo
  escolherMovimento(personagem, inimigos, grid) {
    const maisPerto = [...inimigos].sort((a,b) => {
      const dA = Math.abs(a.posicao.row - personagem.posicao.row);
      const dB = Math.abs(b.posicao.row - personagem.posicao.row);
      return dA - dB;
    })[0];

    // move em direção ao mais perto sempre
    return this.calcularMovimentoRumo(personagem, maisPerto, grid);
  },
};
Time típico: Sete Cicatrizes + Mãos de Osso + Montanha Viva + Carvão
Fraqueza: Névoa da Manhã redirecionando ataques. Língua de Cobra silenciando — sem habilidades, o Kamikaze é só um soco sem consequência.

8. O ESTRATEGISTA
Filosofia: lê o time inimigo e monta counters específicos. A mais difícil de implementar e a mais perigosa.
jsconst ESTRATEGISTA = {
  nome: 'O Estrategista',
  descricao: 'Analisa o time inimigo e adapta cada decisão.',

  // Analisa o time inimigo uma vez no início da batalha
  analisarInimigos(inimigos) {
    return {
      temSuporte:    inimigos.some(i => i.arquetipo === 'suporte'),
      temMago:       inimigos.some(i => i.arquetipo === 'mago'),
      temTanque:     inimigos.some(i => i.defFisicaPct > 0.4),
      temAtirador:   inimigos.some(i => i.alcanceMax >= 5),
      temEnvenenador:inimigos.some(i => i.skills.some(s => s.efeitos?.includes('Veneno'))),
      hpMedioInimigo: inimigos.reduce((s,i) => s + i.hpMax, 0) / inimigos.length,
      danoMedioInimigo: inimigos.reduce((s,i) => s + i.atqTotal + i.atqmTotal, 0) / inimigos.length,
    };
  },

  selecionarTime(pool, inimigos) {
    const analise = this.analisarInimigos(inimigos);
    const selecionados = [];

    if (analise.temSuporte) {
      // precisa de alguém que silencia
      const silenciador = pool.find(p =>
        p.skills.some(s => s.efeitos?.includes('Silencia'))
      );
      if (silenciador) selecionados.push(silenciador);
    }

    if (analise.temMago) {
      // precisa de alguém que chegue rápido no mago
      const rapido = pool
        .filter(p => !selecionados.includes(p))
        .sort((a,b) => b.mov - a.mov)[0];
      if (rapido) selecionados.push(rapido);
    }

    if (analise.temTanque) {
      // precisa de dano que ignore DEF (Doutor Ferrugem, veneno, magia)
      const perfurador = pool
        .filter(p => !selecionados.includes(p))
        .find(p =>
          p.skills.some(s => s.ignoraDef) ||
          p.arquetipo === 'mago' ||
          p.skills.some(s => s.efeitos?.includes('Veneno'))
        );
      if (perfurador) selecionados.push(perfurador);
    }

    if (analise.temAtirador) {
      // precisa de névoa ou alguém que chegue no atirador
      const counter = pool
        .filter(p => !selecionados.includes(p))
        .find(p =>
          p.nome === 'Névoa da Manhã' ||
          p.nome === 'Espinho Negro' || // cega atiradores
          p.mov >= 4
        );
      if (counter) selecionados.push(counter);
    }

    // completa até 4
    while (selecionados.length < 4) {
      const restante = pool
        .filter(p => !selecionados.includes(p))
        .sort((a,b) =>
          (b.atqTotal + b.atqmTotal + b.hpMax / 100) -
          (a.atqTotal + a.atqmTotal + a.hpMax / 100)
        )[0];
      if (restante) selecionados.push(restante);
      else break;
    }

    return selecionados;
  },

  // reavalia prioridade a cada turno
  escolherAlvo(meusPersonagens, inimigos, analise) {
    // se o suporte inimigo está vivo e meu silenciador está disponível, vai nele
    const suporte = inimigos.find(i => i.arquetipo === 'suporte' && i.hpAtual > 0);
    const meuSilenciador = meusPersonagens.find(p =>
      p.skills.some(s => s.efeitos?.includes('Silencia') && !s.emRecarga)
    );
    if (suporte && meuSilenciador) return suporte;

    // senão: alvo com mais ameaça × vulnerabilidade
    return [...inimigos].sort((a,b) => {
      const ameacaA = a.atqTotal + a.atqmTotal;
      const vulnA   = 1 - (a.hpAtual / a.hpMax);
      const ameacaB = b.atqTotal + b.atqmTotal;
      const vulnB   = 1 - (b.hpAtual / b.hpMax);
      return (ameacaB * (1 + vulnB)) - (ameacaA * (1 + vulnA));
    })[0];
  },
};
Time típico: Varia completamente dependendo do time do player. É o único que muda o time baseado no oponente.
Fraqueza: se o player trocar o time na seleção, a análise fica desatualizada. Times muito simétricos confundem o Estrategista.

SISTEMA DE SELEÇÃO ALEATÓRIA DE IA
jsconst TODAS_IAS = [
  EXTERMINADOR,
  CONTROLADOR,
  OPORTUNISTA,
  SITIADOR,
  VAMPIRO,
  CACADOR,
  KAMIKAZE,
  ESTRATEGISTA,
];

// Monta o cenário de batalha com IAs aleatórias
function montarCenarioBatalha(poolInimigos, timePlayer) {
  // sorteia 1 ou 2 IAs (para ter conflito interno interessante)
  const shuffled = [...TODAS_IAS].sort(() => Math.random() - 0.5);
  const ia1 = shuffled[0];
  const ia2 = shuffled[1]; // segunda IA controla os outros 2 inimigos

  const pool1 = poolInimigos.slice(0, 10);
  const pool2 = poolInimigos.slice(10, 20);

  let time1, time2;

  // Estrategista recebe o time do player pra montar counter
  if (ia1.nome === 'O Estrategista') {
    time1 = ia1.selecionarTime(pool1, timePlayer);
  } else {
    time1 = ia1.selecionarTime(pool1);
  }

  if (ia2.nome === 'O Estrategista') {
    time2 = ia2.selecionarTime(pool2, timePlayer);
  } else {
    time2 = ia2.selecionarTime(pool2);
  }

  return {
    ia1,
    ia2,
    timeInimigo: [...time1.slice(0,2), ...time2.slice(0,2)], // 2 de cada
    descricao: `${ia1.nome} + ${ia2.nome}`,
  };
}

// Resolve a ação de um personagem inimigo no turno
function resolverAcaoIA(personagem, todasIAs, meusPersonagens, inimigos, grid) {
  // cada personagem sabe qual IA o controla
  const ia = todasIAs.find(ia => ia.id === personagem.iaId) ?? OPORTUNISTA;

  // prioridade antes de tudo
  if (ia.prioridade) {
    const prioAcao = ia.prioridade(meusPersonagens, inimigos);
    if (prioAcao) return prioAcao;
  }

  const alvo = ia.escolherAlvo
    ? ia.escolherAlvo(meusPersonagens, inimigos)
    : inimigos[0];

  const skill = ia.escolherSkill
    ? ia.escolherSkill(personagem, alvo, inimigos)
    : personagem.ataqueBasico;

  return { personagem, skill, alvo };
}

TABELA DE MATCHUPS INTERESSANTES
Combinações de IAs que criam situações táticas diferentes pra o player:
IA 1IA 2O que aconteceExterminadorVampiroUm mata, o outro ressuscita. Batalha de desgaste vs pressão.CaçadorControladorO Caçador persiste no alvo, o Controlador o imobiliza pra facilitar.SitiadorKamikazeSitiador cria o terreno, Kamikaze atravessa sem ligar. Conflito interno.EstrategistaqualquerEstrategista adapta, a segunda IA executa.OportunistaOportunistaDois oportunistas = caos total, nenhuma decisão é previsível.VampiroVampiroBatalha longuíssima. Só acaba quando o player é consistente.KamikazeExterminadorPressão total. Dois turnos de setup do player, no máximo.CaçadorCaçadorDois alvos diferentes sendo caçados simultaneamente.


9. O ESPELHO
Filosofia: copia a estratégia do player e a devolve melhorada.
jsconst ESPELHO = {
  nome: 'O Espelho',
  descricao: 'Analisa o time do player e monta o counter exato dele.',

  // Lê o time do player e identifica o padrão de jogo
  analisarPadrao(timePlayer) {
    const tempoMedioConjuracao = timePlayer
      .flatMap(p => p.skills)
      .reduce((s, sk) => s + (sk.conjuracaoTotal || 0), 0) / timePlayer.flatMap(p => p.skills).length;

    return {
      eAgressivo:    timePlayer.some(p => p.mov >= 5 || p.atqTotal >= 200),
      eDefensivo:    timePlayer.some(p => p.defFisicaPct >= 0.40),
      dependeMagia:  timePlayer.filter(p => p.atqmTotal > p.atqTotal).length >= 2,
      dependeDebuff: timePlayer.some(p => p.skills.some(s => s.efeitos?.includes('Silencia') || s.efeitos?.includes('Veneno'))),
      temCurador:    timePlayer.some(p => p.skills.some(s => s.efeitos?.includes('Cura'))),
      tempoMedioConjuracao,
    };
  },

  selecionarTime(pool, timePlayer) {
    const padrao = this.analisarPadrao(timePlayer);
    const selecionados = [];

    if (padrao.eAgressivo) {
      // player agressivo → Espelho monta um time mais rápido ainda
      const maisRapido = pool
        .sort((a,b) => (b.mov + b.atqTotal/50) - (a.mov + a.atqTotal/50))
        .slice(0, 2);
      selecionados.push(...maisRapido);
    }

    if (padrao.dependeMagia) {
      // player usa magia → Espelho pega quem tem maior DEFM
      const antiMago = pool
        .filter(p => !selecionados.includes(p))
        .sort((a,b) => b.defmPct - a.defmPct)
        .slice(0, 1);
      selecionados.push(...antiMago);
    }

    if (padrao.temCurador) {
      // player tem cura → Espelho prioriza silenciador pra travar isso
      const silenciador = pool
        .filter(p => !selecionados.includes(p))
        .find(p => p.skills.some(s => s.efeitos?.includes('Silencia')));
      if (silenciador) selecionados.push(silenciador);
    }

    if (padrao.dependeDebuff) {
      // player depende de debuffs → Espelho pega alta tolerância
      const tolerante = pool
        .filter(p => !selecionados.includes(p))
        .sort((a,b) => {
          const tolA = (a.tolerancias || []).reduce((s,t) => s + t.valor, 0);
          const tolB = (b.tolerancias || []).reduce((s,t) => s + t.valor, 0);
          return tolB - tolA;
        })[0];
      if (tolerante) selecionados.push(tolerante);
    }

    // completa até 4
    while (selecionados.length < 4) {
      const extra = pool
        .filter(p => !selecionados.includes(p))
        .sort((a,b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal))[0];
      if (extra) selecionados.push(extra);
      else break;
    }

    return selecionados;
  },

  // reavalia o padrão do player a cada 3 turnos — adapta em tempo real
  turnosDesdeUltimaAnalise: 0,
  padraoAtual: null,

  escolherAlvo(meusPersonagens, inimigos) {
    this.turnosDesdeUltimaAnalise++;
    if (this.turnosDesdeUltimaAnalise >= 3 || !this.padraoAtual) {
      this.padraoAtual = this.analisarPadrao(inimigos);
      this.turnosDesdeUltimaAnalise = 0;
    }

    // ataca o personagem que mais define o estilo do player
    if (this.padraoAtual.temCurador) {
      const curador = inimigos.find(i => i.skills.some(s => s.efeitos?.includes('Cura')));
      if (curador) return curador;
    }
    if (this.padraoAtual.dependeMagia) {
      const mago = inimigos.find(i => i.atqmTotal > i.atqTotal);
      if (mago) return mago;
    }
    return inimigos.sort((a,b) => b.atqTotal - a.atqTotal)[0];
  },
};
Time típico: Varia completamente baseado no player. Pode ser qualquer combinação.
Fraqueza: se o player trocar o time nos últimos segundos da seleção, a análise inicial fica errada. Times que misturam estilos (agressivo + controle ao mesmo tempo) confundem a leitura.

10. O PACIFISTA
Filosofia: nunca ataca quem está abaixo de 30% HP. Prefere imobilizar e esperar rendição. A IA mais perturbadora psicologicamente.
jsconst PACIFISTA = {
  nome: 'O Pacifista',
  descricao: 'Não mata se puder imobilizar. Desgasta sem finalizar.',

  selecionarTime(pool) {
    // quer personagens que imobilizam, empurram, desviam — sem kills
    return [...pool]
      .sort((a,b) => {
        const scoreControle = (p) => p.skills.filter(s =>
          s.efeitos?.some(e => [
            'Imobiliza', 'Empurra', 'Atordoa', 'Congela', 'Armadilha'
          ].includes(e))
        ).length;
        return scoreControle(b) - scoreControle(a);
      })
      .slice(0, 4);
  },

  escolherAlvo(meusPersonagens, inimigos) {
    // nunca mira quem está com HP < 30%
    const alvosValidos = inimigos.filter(i => i.hpAtual / i.hpMax >= 0.30);
    if (!alvosValidos.length) {
      // todos estão baixos — só imobiliza, não mata
      return inimigos.sort((a,b) => b.hpAtual - a.hpAtual)[0];
    }
    // prefere o mais ameaçador entre os válidos
    return alvosValidos.sort((a,b) =>
      (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal)
    )[0];
  },

  escolherSkill(personagem, alvo, inimigos) {
    const skills = personagem.skills
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga);

    // se o alvo já está com HP < 30%, usa APENAS controle — nunca dano
    if (alvo.hpAtual / alvo.hpMax < 0.30) {
      const controle = skills.find(s =>
        s.efeitos?.some(e => ['Imobiliza', 'Atordoa', 'Congela', 'Silencia'].includes(e)) &&
        s.dmg === 0
      );
      if (controle) return controle;
      // sem controle disponível — passa o turno (movimento sem ataque)
      return null;
    }

    // caso normal: prioriza controle sobre dano
    const comControle = skills.find(s =>
      s.efeitos?.some(e => ['Imobiliza', 'Empurra', 'Atordoa'].includes(e))
    );
    return comControle ?? personagem.ataqueBasico;
  },

  // nunca usa skills que causam dano em área — pode acertar alguém em 30%
  filtrarSkillsProibidas(skills) {
    return skills.filter(s => !s.areaEfeito || s.dmg === 0);
  },
};
Time típico: Dente de Sabre + Névoa da Manhã + Lobo de Wendor + Ferro Velho
Fraqueza: player que cura os aliados abaixo de 30% frustra a lógica completamente. Batalha pode durar indefinidamente se o player tiver Última Chama ou Tocha Sagrada.

11. O SANGUINÁRIO
Filosofia: oposto do Pacifista. Só ataca quem está abaixo de 50% HP. Espera o momento de matar e não desperdiça ação em alvo saudável.
jsconst SANGUINARIO = {
  nome: 'O Sanguinário',
  descricao: 'Espera o inimigo sangrar. Só age quando há kill garantido.',

  selecionarTime(pool) {
    // quer alto dano de execução — personagens que matam rápido quando o alvo já está fraco
    return [...pool]
      .sort((a,b) => {
        const execA = a.skills.filter(s => s.dmg >= 150).length;
        const execB = b.skills.filter(s => s.dmg >= 150).length;
        return (execB + b.crit/10) - (execA + a.crit/10);
      })
      .slice(0, 4);
  },

  escolherAlvo(meusPersonagens, inimigos) {
    // só considera alvos abaixo de 50% HP
    const fracos = inimigos.filter(i => i.hpAtual / i.hpMax < 0.50);
    if (fracos.length) {
      return fracos.sort((a,b) => a.hpAtual - b.hpAtual)[0]; // o mais perto de morrer
    }
    // ninguém está fraco ainda — reposiciona sem atacar
    return null;
  },

  escolherMovimento(personagem, inimigos, grid) {
    // enquanto espera: fica fora do alcance do inimigo mais perigoso
    const maisPeigoso = inimigos.sort((a,b) =>
      (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal)
    )[0];

    // move pra longe
    const distancia = Math.abs(personagem.posicao.row - maisPeigoso.posicao.row);
    if (distancia < 4) {
      return {
        row: Math.min(15, personagem.posicao.row + personagem.mov),
        col: personagem.posicao.col,
      };
    }
    return personagem.posicao; // fica parado
  },

  escolherSkill(personagem, alvo) {
    if (!alvo) return null; // passa o turno
    const skills = personagem.skills
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga);

    // se consegue matar esse turno, usa o de maior dano
    const killSkill = skills.find(s => s.dmg >= alvo.hpAtual);
    if (killSkill) return killSkill;

    // senão: maior dano disponível — deixa mais perto de morrer
    return skills.sort((a,b) => b.dmg - a.dmg)[0] ?? personagem.ataqueBasico;
  },

  // bônus interno: quando mira alguém abaixo de 25%, ignora lógica e finaliza
  prioridade(meusPersonagens, inimigos) {
    const agonizando = inimigos.find(i => i.hpAtual / i.hpMax < 0.25);
    if (!agonizando) return null;

    const executor = meusPersonagens
      .filter(p => p.hpAtual > 0)
      .sort((a,b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal))[0];

    const skill = executor.skills
      .filter(s => !s.emRecarga && s.spCusto <= executor.spAtual)
      .sort((a,b) => b.dmg - a.dmg)[0];

    return { personagem: executor, skill, alvo: agonizando };
  },
};
Time típico: Relâmpago Branco + Mãos de Osso + Sombra de Gelo + Espinho Negro
Fraqueza: player que mantém todo o time acima de 50% o tempo todo (Vampiro humano, Tocha Sagrada) deixa o Sanguinário sem ação por turnos seguidos. Ferro Velho com 2388 HP é um pesadelo — demora muito pra cair no limiar.

12. O COVARDE
Filosofia: foge de qualquer confronto direto. Só ataca quando tem vantagem numérica esmagadora (3 contra 1) ou de longe.
jsconst COVARDE = {
  nome: 'O Covarde',
  descricao: 'Só ataca em superioridade numérica. Foge de combate justo.',

  selecionarTime(pool) {
    // quer alcance longo e mobilidade — nunca corpo a corpo
    return [...pool]
      .filter(p => p.alcanceMax >= 3) // só personagens de longa distância
      .sort((a,b) => (b.alcanceMax + b.mov) - (a.alcanceMax + a.mov))
      .slice(0, 4);
  },

  calcularVantagem(meusPersonagens, inimigos) {
    const meusVivos = meusPersonagens.filter(p => p.hpAtual > 0).length;
    const inimigosVivos = inimigos.filter(i => i.hpAtual > 0).length;
    return meusVivos - inimigosVivos; // positivo = vantagem
  },

  escolherAcao(meusPersonagens, inimigos, grid) {
    const vantagem = this.calcularVantagem(meusPersonagens, inimigos);

    if (vantagem >= 2) {
      // superioridade esmagadora — ataca sem hesitar
      const alvo = inimigos
        .filter(i => i.hpAtual > 0)
        .sort((a,b) => a.hpAtual - b.hpAtual)[0];
      const atacante = meusPersonagens
        .filter(p => p.hpAtual > 0)
        .sort((a,b) => b.atqTotal - a.atqTotal)[0];
      return {
        personagem: atacante,
        skill: atacante.skills.sort((a,b) => b.dmg - a.dmg)[0],
        alvo,
      };
    }

    if (vantagem === 1) {
      // leve vantagem — ataca de longe, nunca corpo a corpo
      const atacante = meusPersonagens
        .filter(p => p.hpAtual > 0 && p.alcanceMax >= 3)
        .sort((a,b) => b.alcanceMax - a.alcanceMax)[0];
      if (atacante) {
        const alvo = inimigos.sort((a,b) => a.hpAtual - b.hpAtual)[0];
        return {
          personagem: atacante,
          skill: atacante.skills.find(s => s.rng >= 3 && !s.emRecarga) ?? atacante.ataqueBasico,
          alvo,
        };
      }
    }

    // empate ou desvantagem — FOGE
    return this.fugir(meusPersonagens, inimigos, grid);
  },

  fugir(meusPersonagens, inimigos, grid) {
    // move todos os personagens pra longe do inimigo mais próximo
    for (const p of meusPersonagens.filter(m => m.hpAtual > 0)) {
      const maisPerto = inimigos.sort((a,b) => {
        const dA = Math.abs(a.posicao.row - p.posicao.row);
        const dB = Math.abs(b.posicao.row - p.posicao.row);
        return dA - dB;
      })[0];

      const novaRow = Math.max(0, p.posicao.row - p.mov);
      return { personagem: p, acao: 'mover', posicao: { row: novaRow, col: p.posicao.col } };
    }
    return null;
  },
};
Time típico: Sombra de Gelo + Lobo de Wendor + Espinho Negro + Espiral
Fraqueza: Relâmpago Branco com MOV 5 alcança qualquer ponto do grid em 2 turnos. Não tem fuga possível. Dente de Sabre puxando um atirador pra dentro do alcance de Montanha Viva é o fim.

13. O NECROMANTE
Filosofia: deixa inimigos caírem e foca nos turnos seguintes em destruir quem pode ressuscitá-los. A IA que estuda o time adversário e remove o pilar de sustentação.
jsconst NECROMANTE = {
  nome: 'O Necromante',
  descricao: 'Deixa inimigos caírem. Elimina quem pode ressuscitá-los antes de qualquer coisa.',

  RESSUSCITADORES: ['Última Chama', 'Tocha Sagrada', 'Cinza'],

  selecionarTime(pool) {
    // quer silenciadores e assassinos rápidos
    const silenciadores = pool.filter(p =>
      p.skills.some(s => s.efeitos?.includes('Silencia'))
    ).slice(0, 2);
    const assassinos = pool
      .filter(p => !silenciadores.includes(p))
      .sort((a,b) => (b.atqTotal + b.mov) - (a.atqTotal + a.mov))
      .slice(0, 2);
    return [...silenciadores, ...assassinos];
  },

  fase: 'cacar_ressuscitador', // cacar_ressuscitador → destruir_caidos → finalizar

  escolherAlvo(meusPersonagens, inimigos) {
    // fase 1: mata o ressuscitador primeiro
    const ressuscitador = inimigos.find(i =>
      this.RESSUSCITADORES.includes(i.nome) && i.hpAtual > 0
    );
    if (ressuscitador) {
      this.fase = 'cacar_ressuscitador';
      return ressuscitador;
    }

    // fase 2: ressuscitador morto — finaliza os caídos antes que ressurjam
    // (se Cinza ainda está acumulando cinzas, é prioridade)
    const cinza = inimigos.find(i => i.nome === 'Cinza' && i.hpAtual > 0);
    if (cinza && cinza.cinzasAtivas >= 3) {
      return cinza;
    }

    // fase 3: normal — menor HP
    this.fase = 'finalizar';
    return inimigos.filter(i => i.hpAtual > 0).sort((a,b) => a.hpAtual - b.hpAtual)[0];
  },

  escolherSkill(personagem, alvo) {
    const skills = personagem.skills
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga);

    // se o alvo é o ressuscitador, silencia primeiro
    if (this.RESSUSCITADORES.includes(alvo?.nome)) {
      const silencio = skills.find(s => s.efeitos?.includes('Silencia'));
      if (silencio) return silencio;
    }

    return skills.sort((a,b) => b.dmg - a.dmg)[0] ?? personagem.ataqueBasico;
  },
};
Time típico: Língua de Cobra + Relâmpago Branco + Corvo de Draymoor + Sombra de Gelo
Fraqueza: se o player não tem nenhum ressuscitador, o Necromante fica sem direção na fase 1 e perde eficiência. Times sem Última Chama ou Tocha Sagrada derrotam essa IA com facilidade porque ela perde tempo procurando um alvo prioritário que não existe.

14. O PERFECCIONISTA
Filosofia: nunca age a menos que a ação seja matematicamente garantida. Só ataca se a chance de acerto for acima de 80%. Só usa habilidade se o dano esperado supera o custo de SP. Congela em incerteza.
jsconst PERFECCIONISTA = {
  nome: 'O Perfeccionista',
  descricao: 'Só age com alta chance de sucesso. Qualquer incerteza = passa o turno.',

  LIMIAR_ACERTO:    80,  // % mínimo
  LIMIAR_SP:        0.3, // dano esperado / custo SP mínimo
  LIMIAR_KILL:      0.9, // confiança mínima de kill pra arriscar

  calcularChanceAcerto(atacante, alvo) {
    const chance = atacante.precisao - alvo.esquiva;
    return Math.min(100, Math.max(5, chance));
  },

  calcularDanoEsperado(skill, atacante, alvo) {
    const chanceAcerto = this.calcularChanceAcerto(atacante, alvo) / 100;
    const chanceCrit   = (atacante.crit || 0) / 100;
    const danoBase     = skill.dmg || (atacante.atqTotal * (skill.multiplicador || 1));

    // dano esperado = P(acerto) × (dano_base × (1 + P(crit) × 0.4))
    return chanceAcerto * danoBase * (1 + chanceCrit * 0.4);
  },

  escolherSkill(personagem, alvo) {
    const skills = personagem.skills
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga);

    // filtra só skills com chance de acerto acima do limiar
    const confiaveis = skills.filter(s => {
      if (s.garanteAcerto) return true; // skills que ignoram esquiva passam sempre
      return this.calcularChanceAcerto(personagem, alvo) >= this.LIMIAR_ACERTO;
    });

    if (!confiaveis.length) return null; // passa o turno — nenhuma skill é confiável

    // entre as confiáveis, a de melhor dano esperado por SP
    return confiaveis.sort((a,b) => {
      const eficienciaA = this.calcularDanoEsperado(a, personagem, alvo) / (a.spCusto || 1);
      const eficienciaB = this.calcularDanoEsperado(b, personagem, alvo) / (b.spCusto || 1);
      return eficienciaB - eficienciaA;
    })[0];
  },

  escolherAlvo(meusPersonagens, inimigos) {
    // prefere o alvo com maior chance de acerto garantido
    return [...inimigos].sort((a,b) => {
      const melhorAtacante = meusPersonagens.sort((x,y) => y.precisao - x.precisao)[0];
      const chanceA = this.calcularChanceAcerto(melhorAtacante, a);
      const chanceB = this.calcularChanceAcerto(melhorAtacante, b);
      return chanceB - chanceA;
    })[0];
  },

  selecionarTime(pool) {
    // quer alta precisão e skills com acerto garantido
    return [...pool]
      .sort((a,b) => {
        const garanteA = a.skills.filter(s => s.garanteAcerto).length;
        const garanteB = b.skills.filter(s => s.garanteAcerto).length;
        return (garanteB + b.precisao/10) - (garanteA + a.precisao/10);
      })
      .slice(0, 4);
  },
};
Time típico: Sombra de Gelo (precisão 128) + Dente de Sabre (precisão 100) + Corvo de Draymoor (precisão 100) + Lobo de Wendor (precisão 117)
Fraqueza: Relâmpago Branco com esquiva 105 paralisa essa IA — chance de acerto cai abaixo de 80% e ela passa múltiplos turnos sem agir. Névoa da Manhã tornando atiradores ineficazes dentro da névoa tem o mesmo efeito. A IA mais fácil de travar com esquiva alta.

15. O SADISTA
Filosofia: não quer matar rápido — quer que doa. Prioriza aplicar o máximo de status negativos possível antes de finalizar. A batalha mais longa e mais frustrante.
jsconst SADISTA = {
  nome: 'O Sadista',
  descricao: 'Acumula o máximo de debuffs antes de finalizar. Quer que o inimigo sofra.',

  STATUS_HIERARQUIA: [
    'Silenciado',   // tira habilidades
    'Cego',        // tira precisão
    'Imobilizado', // tira mobilidade
    'Envenenado',  // dano passivo forte
    'Sangrando',   // dano passivo rápido
    'Queimando',   // dano passivo + visual
    'Atordoado',   // perde turno
    'Medo',        // ataca aleatório
    'Congelado',   // imobilização + DEFM reduzida
    'Maldição',    // reduz ATQ e ATQM
  ],

  selecionarTime(pool) {
    // pontua por variedade de debuffs diferentes que o personagem pode aplicar
    return [...pool]
      .sort((a,b) => {
        const debuffsA = new Set(a.skills.flatMap(s => s.efeitos || [])
          .filter(e => this.STATUS_HIERARQUIA.includes(e))).size;
        const debuffsB = new Set(b.skills.flatMap(s => s.efeitos || [])
          .filter(e => this.STATUS_HIERARQUIA.includes(e))).size;
        return debuffsB - debuffsA;
      })
      .slice(0, 4);
  },

  escolherAlvo(meusPersonagens, inimigos) {
    // alvo com menos debuffs ativos — ainda tem sofrimento pela frente
    return [...inimigos]
      .filter(i => i.hpAtual > 0)
      .sort((a,b) => a.statuses.length - b.statuses.length)[0];
  },

  escolherSkill(personagem, alvo) {
    const skills = personagem.skills
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga);

    // encontra o próximo debuff da hierarquia que o alvo ainda não tem
    for (const status of this.STATUS_HIERARQUIA) {
      if (alvo.statuses.find(s => s.nome === status)) continue; // já tem esse
      const skillComStatus = skills.find(s =>
        s.efeitos?.includes(status.replace('ado','a').replace('ido','ir'))
        || s.efeitos?.includes(status)
      );
      if (skillComStatus) return skillComStatus;
    }

    // alvo tem todos os debuffs disponíveis — agora finaliza
    return skills.sort((a,b) => b.dmg - a.dmg)[0] ?? personagem.ataqueBasico;
  },

  // nunca finaliza alvo com menos de 4 debuffs ativos se houver outro sem debuffs
  prioridade(meusPersonagens, inimigos) {
    const semDebuff = inimigos.find(i => i.statuses.length === 0 && i.hpAtual > 0);
    if (semDebuff) {
      // existe alguém sem debuff — muda o foco pra ele
      return null; // deixa a lógica normal redirecionar
    }
    return null;
  },
};
Time típico: Língua de Cobra + Espinho Negro + Lobo de Wendor + Corvo de Draymoor
Fraqueza: Ferro Velho e Montanha Viva têm tolerâncias altíssimas — a maioria dos debuffs ou não aplica ou dura 0 turnos. A IA perde turnos tentando aplicar status que simplesmente não funcionam em tanques. Cinza com tolerâncias equilibradas em tudo também frustra bem.

16. O FANTASMA
Filosofia: nunca termina o turno adjacente a um inimigo. Ataca e recua sempre. Jamais fica ao alcance de corpo a corpo de nenhum oponente.
jsconst FANTASMA = {
  nome: 'O Fantasma',
  descricao: 'Ataca e some. Nunca está onde você olha no fim do turno.',

  selecionarTime(pool) {
    // quer alta mobilidade e alcance — pode atacar de longe e recuar
    return [...pool]
      .filter(p => p.alcanceMax >= 2) // mínimo alcance médio
      .sort((a,b) => (b.mov + b.alcanceMax) - (a.mov + a.alcanceMax))
      .slice(0, 4);
  },

  // após cada ataque, recua o máximo possível
  calcularPosicaoRecuo(personagem, inimigos, grid) {
    let melhorPosicao = personagem.posicao;
    let maiorDistanciaMinima = 0;

    // tenta todas as posições alcançáveis no MOV
    const posicoesPossiveis = grid.getPosicoesDentroMov(personagem);
    for (const pos of posicoesPossiveis) {
      // distância mínima até qualquer inimigo a partir dessa posição
      const distMin = Math.min(...inimigos.map(i =>
        Math.abs(i.posicao.row - pos.row) + Math.abs(i.posicao.col - pos.col)
      ));
      if (distMin > maiorDistanciaMinima) {
        maiorDistanciaMinima = distMin;
        melhorPosicao = pos;
      }
    }
    return melhorPosicao;
  },

  escolherAcao(personagem, inimigos, grid) {
    const skills = personagem.skills
      .filter(s => s.spCusto <= personagem.spAtual && !s.emRecarga && s.rng >= 2);

    const alvo = inimigos
      .filter(i => i.hpAtual > 0)
      .sort((a,b) => a.hpAtual - b.hpAtual)[0];

    const skill = skills.sort((a,b) => b.dmg - a.dmg)[0] ?? null;

    // sequência: move pra posição de ataque → ataca → recua
    const posicaoRecuo = this.calcularPosicaoRecuo(personagem, inimigos, grid);

    return {
      personagem,
      sequencia: [
        { tipo: 'mover', posicao: this.calcularPosicaoAtaque(personagem, alvo, grid) },
        { tipo: 'atacar', skill, alvo },
        { tipo: 'mover', posicao: posicaoRecuo }, // recua sempre
      ],
    };
  },

  calcularPosicaoAtaque(personagem, alvo, grid) {
    // posição mais próxima do alvo dentro do MOV que ainda mantenha o alcance da skill
    const alcance = personagem.skills
      .filter(s => !s.emRecarga)
      .reduce((max, s) => Math.max(max, s.rng || 1), 1);

    // simplificado: fica exatamente a `alcance` casas de distância
    const dir = alvo.posicao.row > personagem.posicao.row ? 1 : -1;
    return {
      row: alvo.posicao.row - (dir * alcance),
      col: alvo.posicao.col,
    };
  },

  // se está adjacente a um inimigo no início do turno, recua ANTES de qualquer coisa
  turnoEmergencia(personagem, inimigos, grid) {
    const adjacente = inimigos.find(i =>
      Math.abs(i.posicao.row - personagem.posicao.row) +
      Math.abs(i.posicao.col - personagem.posicao.col) <= 1
    );
    if (adjacente) {
      return {
        personagem,
        acao: 'mover',
        posicao: this.calcularPosicaoRecuo(personagem, inimigos, grid),
        prioridade: true,
      };
    }
    return null;
  },
};
Time típico: Sombra de Gelo + Espiral + Espinho Negro + Corvo de Draymoor
Fraqueza: Dente de Sabre com o laço puxa o Fantasma de volta ao alcance corpo a corpo — nega completamente a mecânica de recuo. Montanha Viva empurrando 4 casas na direção certa também pode forçar uma colisão que o Fantasma não consegue desfazer no mesmo turno.

Tabela de matchups com as novas IAs:
IA 1IA 2O que aconteceFantasmaCovardeDois times que fogem. A batalha mais longa possível — ninguém quer chegar perto.SanguinárioVampiroVampiro cura os aliados pra nunca caírem abaixo de 50%. Sanguinário nunca age. Impasse total.Sadista + PerfeccionistaqualquerSadista quer aplicar debuffs, Perfeccionista só age com 80% de acerto — dois estilos que se cancelam internamente.EspelhoEstrategistaOs dois leem o time do player. O que leu errado primeiro perde.NecromanteCaçador (original)Dois que focam no suporte inimigo — podem acabar disputando o mesmo alvo e descobrindo a retaguarda.PacifistaKamikaze (original)Kamikaze se joga em combate, Pacifista não finaliza. O Kamikaze vai acumular cicatrizes e explodir enquanto o Pacifista assiste.CovardeExterminador (original)Exterminador pressiona, Covarde foge. Batalha de perseguição pelo grid inteiro.SanguinárioSadistaSadista aplica debuffs, Sanguinário espera o HP cair abaixo de 50%. Sinergia acidental — Sadista debilita, Sanguinário finaliza.