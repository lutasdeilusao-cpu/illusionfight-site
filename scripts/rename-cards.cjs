const fs = require('fs');
const deck = JSON.parse(fs.readFileSync('./src/data/supertrunfo-pt.json', 'utf8'));

const novosNomes = [
  'Kim', 'Jack', 'Nina', 'Thunderbolt', 'Shuntaro',
  'Lisa', 'Nexus Phantasm', 'Pajé Yawanari', 'VoidHunter_X', 'David Kronos',
  'Xakaxi', 'Nara', 'Powa', 'Helena', 'Osvaldo',
  'Ryan', 'Samuel', 'Roxy', 'Brock', 'Walter',
  'A Máquina', 'IA NeoGuide', 'O Narrador', 'Sarah', 'Alex',
  'Mia', 'Jaret', 'Mikael', 'Isabella', 'Tira'
];

for (let i = 0; i < 30; i++) {
  deck.cartas[i].nome = novosNomes[i];
}

fs.writeFileSync('./src/data/supertrunfo-pt.json', JSON.stringify(deck, null, 2), 'utf8');
console.log('✅ Nomes atualizados!');
