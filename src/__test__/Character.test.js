/* eslint-disable no-new */
import Character from '../js/Character';
import Bowman from '../js/characters-classes/Bowman';
import Daemon from '../js/characters-classes/Daemon';
import Magician from '../js/characters-classes/Magician';
import Swordsman from '../js/characters-classes/Swordsman';
import Undead from '../js/characters-classes/Undead';
import Vampire from '../js/characters-classes/Vampire';

test('Error when creating a new Character instance', () => {
  expect(() => {
    new Character(1, 'bowman');
  }).toThrow('Нельзя создавать больше одного экземпляров');
});

test('check bowman creation', () => {
  const received = new Bowman(1);
  const expected = {
    type: 'bowman',
    level: 1,
    health: 50,
    attack: 25,
    defence: 25,
    moveDistance: 2,
    attackDistance: 2,
  };
  expect(received).toEqual(expected);
});

test('check daemon creation', () => {
  const received = new Daemon(1);
  const expected = {
    type: 'daemon',
    level: 1,
    health: 50,
    attack: 10,
    defence: 40,
    moveDistance: 1,
    attackDistance: 4,
  };
  expect(received).toEqual(expected);
});

test('check magician creation', () => {
  const received = new Magician(1);
  const expected = {
    type: 'magician',
    level: 1,
    health: 50,
    attack: 10,
    defence: 40,
    moveDistance: 1,
    attackDistance: 4,
  };
  expect(received).toEqual(expected);
});

test('check swordsman creation', () => {
  const received = new Swordsman(1);
  const expected = {
    type: 'swordsman',
    level: 1,
    health: 50,
    attack: 40,
    defence: 10,
    moveDistance: 4,
    attackDistance: 1,
  };
  expect(received).toEqual(expected);
});

test('check undead creation', () => {
  const received = new Undead(1);
  const expected = {
    type: 'undead',
    level: 1,
    health: 50,
    attack: 40,
    defence: 10,
    moveDistance: 4,
    attackDistance: 1,
  };
  expect(received).toEqual(expected);
});

test('check vampire creation', () => {
  const received = new Vampire(1);
  const expected = {
    type: 'vampire',
    level: 1,
    health: 50,
    attack: 25,
    defence: 25,
    moveDistance: 2,
    attackDistance: 2,
  };
  expect(received).toEqual(expected);
});
