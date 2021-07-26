/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
import {
  characterGenerator,
  generateTeam,
  randomSortArray,
} from './generators';
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

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.createBoards();

    console.log(this.gamePlay);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    const charactersPlayer = [...characterGenerator([Bowman, Swordsman], 1)];
    const charactersBot = generateTeam(
      this.allCharactersBot,
      this.getRandomNum(1, 4),
      2
    );

    this.addCharsToBoard(charactersPlayer, charactersBot);
    this.gamePlay.redrawPositions(this.charactersOnBoard);

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  checkDistance(index) {
    const availableX1 = [...new Set([1, 7, 8, 9])];
    const availableX2 = [
      ...new Set([
        ...availableX1,
        ...availableX1.map((x) => x * 2),
        ...[6, 10, 15, 17],
      ]),
    ];
    const availableX4 = [
      ...new Set([
        ...availableX1,
        ...availableX2,
        ...[3, 5, 11, 13, 19, 21, 22, 23, 24, 25, 26, 27],
      ]),
    ];

    if (
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'undead' ||
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'swordsman'
    ) {
      this.setMechanicsMove(index, availableX1);
    }

    if (
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'bowman' ||
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'vampire'
    ) {
      this.setMechanicsMove(index, availableX2);
    }

    if (
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'magician' ||
      this.findCharacterIndex(this.indexSelectedCharacter).character.type ===
        'daemon'
    ) {
      this.setMechanicsMove(index, availableX4);
    }
  }

  setMechanicsMove(index, array) {
    const idxCharacter = this.findCharacterIndex(
      this.indexSelectedCharacter
    ).position;

    this.gamePlay.setCursor(cursors.notallowed);

    this.gamePlay.cells.forEach((cell, i) => {
      this.gamePlay.deselectCell(i);
      this.gamePlay.selectCell(idxCharacter);
    });

    for (let k = 0; k < array.length; k++) {
      const val = array[k];

      if (idxCharacter === index - val || idxCharacter === index + val) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      }
    }

    this.team.teamBot.forEach((pers) => {
      if (pers.position === index) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      }
    });
  }

  moveCharacter(index, character) {
    const findPers = this.charactersOnBoard.find(
      (pers) => pers.character.type === character.character.type
    );

    findPers.position = index;
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
    if (!this.findCharacterIndex(index)) {
      return;
    }
    if (!this.findCharacterType(index)) {
      GamePlay.showError('Это не ваш персонаж');
      return;
    }

    this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
    this.gamePlay.selectCell(index);

    this.indexSelectedCharacter = index;

    this.moveCharacter(
      index,
      this.findCharacterIndex(this.indexSelectedCharacter)
    );
    this.gamePlay.redrawPositions(this.charactersOnBoard);

    // TODO: react to click
  }

  onCellEnter(index) {
    if (this.findCharacterIndex(this.indexSelectedCharacter)) {
      this.checkDistance(index);
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
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.hideCellTooltip(index);

    // TODO: react to mouse leave
  }
}
