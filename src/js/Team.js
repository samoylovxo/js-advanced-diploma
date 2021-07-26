export default class Team {
  constructor() {
    this.teamPlayer = [];
    this.teamBot = [];
  }

  charAddToPlayer(player) {
    this.teamPlayer.push(player);
  }

  charAddToBot(player) {
    this.teamBot.push(player);
  }
}
