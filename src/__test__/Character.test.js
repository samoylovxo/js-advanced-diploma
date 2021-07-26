/* eslint-disable linebreak-style */
import Character from '../js/Character';

test('Ошибка при создании второго экземпляра Character', () => {
  const character = new Character();

  expect().toThrowError('qqq');
});
