const path = 'games.arena.specializations[0]';
const result = path.replace(/\[(\d+)\]/g, '.$1');
console.log('result:', result);

const path2 = 'games.arena.advantages[5].label';
const result2 = path2.replace(/\[(\d+)\]/g, '.$1');
console.log('result2:', result2);

// Test full getNested
function getNested(obj, path) {
  const normalized = path.replace(/\[(\d+)\]/g, '.$1');
  return normalized.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    const idx = /^\d+$/.test(key) ? parseInt(key, 10) : key;
    return acc[idx];
  }, obj);
}

const testObj = {
  games: {
    arena: {
      specializations: ['Melee', 'Ranged', 'Magic'],
      advantages: [{ label: 'Acrobat', cost: 1 }, { label: 'Lucky', cost: 2 }]
    }
  }
};

console.log('specializations[0]:', getNested(testObj, 'games.arena.specializations[0]'));
console.log('specializations[1]:', getNested(testObj, 'games.arena.specializations[1]'));
console.log('advantages[0].label:', getNested(testObj, 'games.arena.advantages[0].label'));
