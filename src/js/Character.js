export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    // if (new.target) {
    //   throw new Error('Нельзя создавать больше двух экземпляров');
    // }
    // TODO: throw error if user use "new Character()
  }
}
