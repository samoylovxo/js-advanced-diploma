/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
import { characterGenerator, generateTeam } from './generators';
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters-classes/Bowman';
import Daemon from './characters-classes/Daemon';
import Magician from './characters-classes/Magician';
import Swordsman from './characters-classes/Swordsman';
import Undead from './characters-classes/Undead';
import Vampire from './characters-classes/Vampire';
import Team from './Team';
import GamePlay from './GamePlay';
import cursors from './cursors';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.allCharactersPlayer = [Bowman, Swordsman, Magician];
    this.allCharactersBot = [Daemon, Undead, Vampire];
    this.team = new Team();
    this.boardPlayer = [];
    this.boardBot = [];
    this.charactersOnBoard = [];
    this.level = 1;
    this.score = 0;
    this.activePlayer;
  }

  getRandomNum(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
  }

  getRandomItemFromArray(array) {
    const random = Math.floor(Math.random() * array.length);
    return array[random];
  }

  mockForCharactersConverting(characters) {
    return [...characterGenerator(characters, 0)];
  }

  createBoards() {
    for (let i = 0; i < this.gamePlay.cells.length; i++) {
      if ((i / 2) % 4 === 0 || i % 8 === 1) {
        this.boardPlayer.push(i);
      }
      if (i % 8 === 7 || i % 8 === 6) {
        this.boardBot.push(i);
      }
    }
  }

  addCharsToBoard(charsPlayer, charsBot) {
    charsPlayer.forEach((char) =>
      this.team.teamPlayer.push(
        new PositionedCharacter(
          char,
          this.getRandomItemFromArray(this.boardPlayer)
        )
      )
    );
    charsBot.forEach((char) =>
      this.team.teamBot.push(
        new PositionedCharacter(
          char,
          this.getRandomItemFromArray(this.boardBot)
        )
      )
    );

    this.charactersOnBoard = [...this.team.teamPlayer, ...this.team.teamBot];
  }

  createAllCharacters() {
    const charactersPlayer = [...characterGenerator([Bowman, Swordsman], 1)];
    const charactersBot = generateTeam(
      this.allCharactersBot,
      this.getRandomNum(1, 4),
      2
    );

    this.addCharsToBoard(charactersPlayer, charactersBot);
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.createBoards();
    this.createAllCharacters();
    this.gamePlay.redrawPositions(this.charactersOnBoard);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    this.gamePlay.addNewGameListener(this.clickNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.clickSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.clickLoadGame.bind(this));

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  canGoMove() {
    const { boardSize } = this.gamePlay;
    const x1 = [];
    const x2 = [];
    const x4 = [];

    for (let i = 0, j = 0, k = 0; i < boardSize ** 2 - 1; i++, j++, k++) {
      if (
        i === boardSize - 7 ||
        i === boardSize - 1 ||
        i === boardSize ||
        i === boardSize + 1
      ) {
        x1.push(i);
      }

      if (
        j === boardSize - 2 ||
        j === boardSize + 2 ||
        j === boardSize * 2 - 1 ||
        j === boardSize * 2 + 1
      ) {
        x2.push(j);
      }

      if (
        k === boardSize - 3 ||
        k === boardSize + 3 ||
        k === boardSize - 5 ||
        k === boardSize + 5 ||
        k === boardSize * 2 + 3 ||
        k === boardSize * 3 - 3 ||
        k === boardSize * 3 - 2 ||
        k === boardSize * 3 - 1 ||
        k === boardSize * 3 ||
        k === boardSize * 3 + 1 ||
        k === boardSize * 3 + 2 ||
        k === boardSize * 3 + 3
      ) {
        x4.push(k);
      }
    }

    return {
      distX1: [...new Set(x1)],
      distX2: [...new Set([...x1, ...x1.map((x) => x * 2), ...x2])],
      distX4: [...new Set([...x1, ...x1.map((x) => x * 2), ...x2, ...x4])],
    };
  }

  toAttack(index, selectChar, targetChar) {
    const damageScore = Math.max(
      selectChar.character.attack - targetChar.defence,
      selectChar.character.attack * 0.1
    );
    targetChar.health -= damageScore;
    this.canAttackBoolean = false;
    this.selectCharacter = null;
    if (targetChar.health <= 0) {
      targetChar.health = 0;
      this.charactersOnBoard = this.charactersOnBoard.filter(
        (el) => el.position !== index
      );
    }

    this.gamePlay.showDamage(index, damageScore).then(() => {
      this.checkStatusGame();
      this.gamePlay.redrawPositions(this.charactersOnBoard);
    });
  }

  checkAttack(index) {
    if (
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'undead' ||
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'swordsman'
    ) {
      this.setMechanicsAttack(
        index,
        this.canGoMove(this.indexSelectedCharacter).distX4
      );
    }

    if (
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'bowman' ||
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'vampire'
    ) {
      this.setMechanicsAttack(
        index,
        this.canGoMove(this.indexSelectedCharacter).distX2
      );
    }

    if (
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'magician' ||
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'daemon'
    ) {
      this.setMechanicsAttack(
        index,
        this.canGoMove(this.indexSelectedCharacter).distX1
      );
    }
  }

  setMechanicsAttack(index, array) {
    const idxCharacter = this.indexSelectedCharacter;

    if (this.findCharacterIndex(index)) {
      const isEnemy = this.team.teamBot.some(
        (el) => el.character === this.findCharacterIndex(index).character
      );

      for (let i = 0; i < array.length; i++) {
        if (
          idxCharacter === index - array[i] ||
          (idxCharacter === index + array[i] && isEnemy)
        ) {
          this.canAttackBoolean = true;
        }
      }
    }
  }

  checkDistance(index) {
    if (
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'undead' ||
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'swordsman'
    ) {
      this.setMechanicsMove(
        index,
        this.canGoMove(this.indexSelectedCharacter).distX1
      );
    }

    if (
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'bowman' ||
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'vampire'
    ) {
      this.setMechanicsMove(
        index,
        this.canGoMove(this.indexSelectedCharacter).distX2
      );
    }

    if (
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'magician' ||
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'daemon'
    ) {
      this.setMechanicsMove(
        index,
        this.canGoMove(this.indexSelectedCharacter).distX4
      );
    }
  }

  setMechanicsMove(index, array) {
    const idxCharacter = this.indexSelectedCharacter;
    this.gamePlay.setCursor(cursors.notallowed);

    for (let k = 0; k < array.length; k++) {
      if (
        idxCharacter === index - array[k] ||
        idxCharacter === index + array[k]
      ) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      }
    }

    this.gamePlay.cells.forEach((cell, i) => {
      for (let m = 0; m < this.boardBot.length; m++) {
        this.gamePlay.deselectCell(this.boardBot[m]);

        if (i === this.boardBot[m] && cell.children.length === 0) {
          cell.style.cursor = 'not-allowed';
        }
      }
    });
  }

  findCharacterIndex(index) {
    return this.charactersOnBoard.find((el) => el.position === index);
  }

  findCharacterType(index) {
    return this.team.teamPlayer.some(
      (el) =>
        this.findCharacterIndex(index).character.type === el.character.type
    );
  }

  onCellClick(index) {
    if (this.findCharacterIndex(index)) {
      const isEnemy = this.team.teamBot.some(
        (el) => el.character === this.findCharacterIndex(index).character
      );

      if (this.canAttackBoolean && isEnemy) {
        this.gamePlay.deselectCell(this.indexSelectedCharacter);
        this.toAttack(
          index,
          this.selectCharacter,
          this.findCharacterIndex(index).character
        );

        this.activePlayer = 1;

        return;
      }

      if (isEnemy) {
        GamePlay.showError('Это не ваш персонаж');
        return;
      }
    }

    const cellSelectedGreen = this.gamePlay.cells.find((cell) =>
      cell.classList.contains('selected-green')
    );

    this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));

    if (
      this.selectCharacter &&
      cellSelectedGreen &&
      !this.findCharacterIndex(index)
    ) {
      this.selectCharacter.position = index;
      this.gamePlay.redrawPositions(this.charactersOnBoard);
      this.selectCharacter = null;
      return;
    }

    this.team.teamPlayer.forEach((el) => {
      if (el.position === index) {
        this.gamePlay.selectCell(index);
      }
    });

    this.indexSelectedCharacter = index;
    this.selectCharacter = this.findCharacterIndex(index);

    if (this.canAttackBoolean && this.activePlayer === 1) {
      this.autoAttackBot();
    }

    // TODO: react to click
  }

  onCellEnter(index) {
    if (this.findCharacterIndex(this.indexSelectedCharacter)) {
      this.checkDistance(index);
      this.checkAttack(index);
    }

    this.gamePlay.cells.forEach((cell, i) => {
      if (i === index && cell.children.length > 0) {
        const eventCharacter = this.charactersOnBoard.find(
          (el) => el.character.type === cell.children[0].classList[1]
        );

        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.showCellTooltip(
          `🎖${eventCharacter.character.level} ⚔${eventCharacter.character.attack} 🛡${eventCharacter.character.defence} ❤${eventCharacter.character.health}`,
          index
        );
      }
    });

    if (this.findCharacterIndex(index) && !this.findCharacterType(index)) {
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor(cursors.crosshair);
    }

    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.hideCellTooltip(index);

    const cellSelectedRed = this.gamePlay.cells.findIndex((cell) =>
      cell.classList.contains('selected-red')
    );
    const cellSelectedGreen = this.gamePlay.cells.findIndex((cell) =>
      cell.classList.contains('selected-green')
    );
    const cellSelectedYellow = this.gamePlay.cells.findIndex((cell) =>
      cell.classList.contains('selected-yellow')
    );

    if (cellSelectedRed !== -1) {
      this.gamePlay.deselectCell(cellSelectedRed);
    }

    if (cellSelectedGreen !== -1) {
      this.gamePlay.deselectCell(cellSelectedGreen);
    }

    if (cellSelectedYellow !== -1 && this.selectCharacter) {
      this.gamePlay.deselectCell(cellSelectedYellow);
      this.gamePlay.selectCell(this.indexSelectedCharacter);
    }

    // TODO: react to mouse leave
  }

  newLevel() {
    const { boardSize } = this.gamePlay;

    if (this.level === 2) {
      const teamPlayer = [];
      const teamBot = [];

      this.gamePlay.drawUi(themes.desert);
      const userChars = generateTeam(
        this.allCharactersPlayer,
        1,
        this.team.teamPlayer.length
      );

      for (let i = 0; i < userChars.length; i++) {
        teamPlayer.push(
          new PositionedCharacter(
            userChars[i],
            this.getRandomNum(0, boardSize ** 2 - 1)
          )
        );
      }

      const botChars = generateTeam(
        this.allCharactersBot,
        this.getRandomNum(1, 2),
        this.team.teamPlayer.length
      );
      for (let i = 0; i < botChars.length; i++) {
        teamBot.push(
          new PositionedCharacter(
            botChars[i],
            this.getRandomNum(0, boardSize ** 2 - 1)
          )
        );
      }

      this.team.teamBot = teamBot;
      this.team.teamPlayer.push(...teamPlayer);
      this.charactersOnBoard = [
        ...teamBot,
        ...[...this.team.teamPlayer, ...teamPlayer],
      ];
      this.gamePlay.redrawPositions(this.charactersOnBoard);
    }
    if (this.level === 3) {
      const teamPlayer = [];
      const teamBot = [];

      this.gamePlay.drawUi(themes.arctic);
      const userChars = generateTeam(
        this.allCharactersPlayer,
        this.getRandomNum(1, 2),
        2
      );
      for (let i = 0; i < userChars.length; i++) {
        teamPlayer.push(
          new PositionedCharacter(
            userChars[i],
            this.getRandomNum(0, boardSize ** 2 - 1)
          )
        );
      }

      const botChars = generateTeam(
        this.allCharactersBot,
        this.getRandomNum(1, 3),
        this.team.teamPlayer.length
      );
      for (let i = 0; i < botChars.length; i++) {
        teamBot.push(
          new PositionedCharacter(
            botChars[i],
            this.getRandomNum(0, boardSize ** 2 - 1)
          )
        );
      }

      this.team.teamBot = teamBot;
      this.team.teamPlayer.push(...teamPlayer);
      this.charactersOnBoard = [
        ...teamBot,
        ...[...this.team.teamPlayer, ...teamPlayer],
      ];
      this.gamePlay.redrawPositions(this.charactersOnBoard);
    }
    if (this.level === 4) {
      const teamPlayer = [];
      const teamBot = [];

      this.gamePlay.drawUi(themes.mountain);
      const userChars = generateTeam(
        this.allCharactersPlayer,
        this.getRandomNum(1, 3),
        2
      );
      for (let i = 0; i < userChars.length; i++) {
        teamPlayer.push(
          new PositionedCharacter(
            userChars[i],
            this.getRandomNum(0, boardSize ** 2 - 1)
          )
        );
      }

      const botChars = generateTeam(
        this.allCharactersBot,
        this.getRandomNum(1, 4),
        this.team.teamPlayer.length
      );
      for (let i = 0; i < botChars.length; i++) {
        teamBot.push(
          new PositionedCharacter(
            botChars[i],
            this.getRandomNum(0, boardSize ** 2 - 1)
          )
        );
      }

      this.team.teamBot = teamBot;
      this.team.teamPlayer.push(...teamPlayer);
      this.charactersOnBoard = [
        ...teamBot,
        ...[...this.team.teamPlayer, ...teamPlayer],
      ];
      this.gamePlay.redrawPositions(this.charactersOnBoard);
    }
  }

  checkStatusGame() {
    this.teamBot = this.charactersOnBoard.filter((el) =>
      ['vampire', 'undead', 'daemon'].includes(el.character.type)
    );
    this.teamPlayer = this.charactersOnBoard.filter((el) =>
      ['bowman', 'swordsman', 'magician'].includes(el.character.type)
    );

    if (this.teamPlayer.length === 0) {
      GamePlay.showMessage('Вы проиграли(');
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
    }
    if (this.teamBot.length === 0 && this.level >= 4) {
      GamePlay.showMessage('Вы выиграли!');
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
    }

    if (this.teamBot.length === 0) {
      this.level += 1;
      for (const char of this.team.teamPlayer) {
        this.score += char.character.health;
        char.character.level += 1;
        char.character.health += 80;
        if (char.character.health >= 100) {
          char.character.health = 100;
        }
        char.character.attack = Math.max(
          char.character.attack,
          char.character.attack * (1.8 - char.character.health / 100)
        );
        char.character.defence = Math.max(
          char.character.defence,
          char.character.defence * (1.8 - char.character.health / 100)
        );
      }
      this.newLevel();
    }
  }

  autoAttackBot() {
    const { boardSize } = this.gamePlay;

    const targetChar = this.getRandomItemFromArray(this.team.teamPlayer);
    const selectChar = this.getRandomItemFromArray(this.team.teamBot);
    this.activePlayer = 1;

    this.team.teamBot.forEach((char) => {
      char.position = this.getRandomNum(0, boardSize ** 2 - 1);
    });

    this.toAttack(targetChar.position, selectChar, targetChar.character);
  }

  clickNewGame() {
    this.charactersOnBoard = [];
    this.level = 1;
    this.score = 0;
    this.activePlayer = 0;
    this.team.teamPlayer = [];
    this.team.teamBot = [];
    this.gamePlay.drawUi(themes.prairie);
    this.createAllCharacters();
    this.gamePlay.redrawPositions(this.charactersOnBoard);
  }

  clickSaveGame() {
    const saved = {
      level: this.level,
      score: this.score,
      activePlayer: this.activePlayer,
      position: this.charactersOnBoard,
    };
    const savedState = GameState.from(saved);
    this.stateService.save(savedState);
    GamePlay.showMessage('Сохранено');
  }

  clickLoadGame() {
    const loaded = this.stateService.load();
    if (!loaded) {
      GamePlay.showMessage('Ошибка загрузки');
      return;
    }
    this.level = loaded.level;
    this.score = loaded.score;
    this.activePlayer = loaded.activePlayer;
    this.charactersOnBoard = loaded.position;

    switch (loaded.level) {
      case 1:
        this.gamePlay.drawUi(themes.prairie);
        break;
      case 2:
        this.gamePlay.drawUi(themes.desert);
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        break;
      default:
        this.gamePlay.drawUi(themes.prairie);
        break;
    }

    this.gamePlay.redrawPositions(this.charactersOnBoard);
  }
}
