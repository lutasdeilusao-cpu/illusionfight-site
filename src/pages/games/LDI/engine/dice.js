export function rollD6() {
  return Math.floor(Math.random() * 6) + 1
}

export function rollWithDelay(callback) {
  return new Promise(resolve => {
    setTimeout(() => {
      const result = rollD6()
      if (callback) callback(result)
      resolve(result)
    }, 400)
  })
}

export function testAttribute(attribute, bonus = 0) {
  const roll = rollD6()
  const target = attribute + bonus
  const success = roll <= target && roll !== 6
  return { result: roll + bonus, success, roll, target, raw: roll }
}
