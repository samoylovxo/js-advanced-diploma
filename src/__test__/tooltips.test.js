import Magician from '../js/characters-classes/Magician';

test('check tooltip', () => {
  const magician = new Magician(2);
  magician.health = 50;
  const icons = {
    level: '🎖',
    attack: '⚔',
    defence: '🛡',
    health: '❤',
  };

  const received = `${icons.level}${magician.level} ${icons.attack}${magician.attack} ${icons.defence}${magician.defence} ${icons.health}${magician.health}`;
  const expected = '🎖2 ⚔10 🛡40 ❤50';

  expect(received).toBe(expected);
});
