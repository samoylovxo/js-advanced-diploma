/* eslint-disable linebreak-style */
import Character from '../Character';

export default class Undead extends Character {
  constructor(level) {
    super(level, 'vampire');
    this.attack = 25;
    this.defence = 25;
    this.moveDistance = 2;
    this.attackDistance = 2;
  }
}
