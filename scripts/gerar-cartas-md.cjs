const d = require('../src/data/supertrunfo-pt.json');
const cards = d.cartas;
const fs = require('fs');

let md = '# 🃏 Top Trumps — LDI: Todas as Cartas\n\n';
md += '**Universo:** ' + d.meta.universo + '  \n';
md += '**Total de Cartas:** ' + cards.length + '  \n';
md += '**Versão dos dados:** ' + d.meta.versao + '\n\n';
md += '---\n\n';

const tiers = {};
cards.forEach(c => {
  if (!tiers[c.tier]) tiers[c.tier] = [];
  tiers[c.tier].push(c);
});

const tierOrder = ['sombra', 'primordial', 'lendario', 'elite', 'free'];
const tierNames = {
  sombra: '⬛ Sombra',
  primordial: '🔴 Primordial',
  lendario: '🟡 Lendário',
  elite: '🟣 Elite',
  free: '🟢 Free'
};

tierOrder.forEach(tier => {
  if (!tiers[tier]) return;
  md += '## ' + tierNames[tier] + ' (' + tiers[tier].length + ' cartas)\n\n';

  tiers[tier].forEach(c => {
    md += '### #' + c.id_num + ' \u2014 ' + c.nome + '\n\n';
    md += '| Atributo | Valor |\n|----------|------|\n';
    md += '| **ID** | `' + c.id + '` |\n';
    md += '| **Elemental** | ' + c.elemental + ' |\n';
    md += '| **Tier** | ' + tierNames[c.tier] + ' |\n';
    md += '| **Rank SDR** | #' + c.atributos.rank_sdr.toLocaleString() + ' |\n';
    md += '| **Poder Mental** | ' + c.atributos.poder_mental + ' |\n';
    md += '| **Velocidade** | ' + c.atributos.velocidade + ' |\n';
    md += '| **Resist\u00eancia** | ' + c.atributos.resistencia + ' |\n';
    md += '| **N\u00edvel Xam\u00e2nico** | ' + c.atributos.nivel_xama + ' |\n';
    md += '| **Fator Caos** | ' + c.atributos.fator_caos + ' |\n';
    md += '| **Energia Base** | ' + c.atributos.energia_base + ' |\n';
    md += '| **Poder Explosivo** | ' + c.atributos.poder_explosivo + ' |\n';
    md += '\n**Arma:** ' + (c.arma || '\u2014') + '\n\n';
    if (c.modo_xama) {
      md += '**Modo Xam\u00e3:** ' + c.modo_xama + '\n\n';
    }
    md += '**Descri\u00e7\u00e3o:** ' + (c.desc || c.descricao || '\u2014') + '\n\n';
    md += '**Frase Ic\u00f4nica:** *"' + (c.frase_iconica || '\u2014') + '"*\n\n';

    if (c.habilidades && c.habilidades.length) {
      md += '**Habilidades:**\n';
      c.habilidades.forEach(h => { md += '- ' + h + '\n'; });
      md += '\n';
    }
    md += '---\n\n';
  });
});

fs.writeFileSync('TOP_TRUMPS_CARTAS.md', md, 'utf8');
console.log('Documento criado com ' + cards.length + ' cartas em TOP_TRUMPS_CARTAS.md!');
