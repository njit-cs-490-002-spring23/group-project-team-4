import {
  GameArea,
  GameStatus,
  BattleShipGameState,
  BattleShipGridPosition,
  BattleShip,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

/**
* Define error messages for BattleShipAreaController
*/
export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

/**
 * Define BattleShipCell and BattleShipEvents types for BattleShipAreaController
 */
export type BattleShipCell = 3 | 2 | 1 | 0 | 'C' | 'B' | 'R' | 'D' | 'S' | 'H' | 'M' | undefined;
export type BattleShipEvents = GameEventTypes & {
  boardChanged: (board: BattleShipCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the BattleShip game, and for sending commands to the server
 * 
 * The BattleShipAreaController extends the GameAreaController class, which extends the InteractableController class
 */
export default class BattleShipAreaController extends GameAreaController<
  BattleShipGameState,
  BattleShipEvents
> {
  /**
   * _defaultBoard is a 10x10 array of BattleShipCell that represents the default state of the board
   * _currentXBoard is a 10x10 array of BattleShipCell that represents the current state of the X player's board
   * _currentOBoard is a 10x10 array of BattleShipCell that represents the current state of the O player's board
   * _currentXGuessBoard is a 10x10 array of BattleShipCell that represents the current state of the X player's guess board
   * _currentOGuessBoard is a 10x10 array of BattleShipCell that represents the current state of the O player's guess board
   */
  private _defaultBoard: BattleShipCell[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  private _currentXBoard: BattleShipCell[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  private _currentOBoard: BattleShipCell[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  private _currentXGuessBoard: BattleShipCell[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  private _currentOGuessBoard: BattleShipCell[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  /**
   * Returns the current state of the board.
   *
   * The board is a 10x10 array of BattleShipCell
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[9][9] is the bottom-right cell
   * 
   * @returns BattleShipCell[][]
   * @returns undefined if the game is not in progress
   */
  get xBoard(): BattleShipCell[][] {
    return this._currentXBoard;
  }

  get oBoard(): BattleShipCell[][] {
    return this._currentOBoard;
  }

  get xGuessBoard(): BattleShipCell[][] {
    return this._currentXGuessBoard;
  }

  get oGuessBoard(): BattleShipCell[][] {
    return this._currentOGuessBoard;
  }

  get defaultBoard(): BattleShipCell[][] {
    return this._defaultBoard;
  }

  /**
   * Returns empty boards for X and O players and their guess boards for when the game is over
   * 
   * @returns void
   */
  private _resetBoards() {
    this._currentXBoard = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    this._currentOBoard = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    this._currentXGuessBoard = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    this._currentOGuessBoard = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
  }

  /**
   * Returns the player with the 'X' game piece, if there is one, or undefined otherwise
   * 
   * @returns PlayerController | undefined
   */
  get x(): PlayerController | undefined {
    if (
      this._model.game?.state.status === 'WAITING_TO_START' &&
      this._model.game?.state.x === undefined
    ) {
      return undefined;
    }
    if (this.players[1] && this._model.game?.state.x === this.players[1].id) {
      return this.players[1];
    }
    if (this.players[0] && this._model.game?.state.x === this.players[0].id) {
      return this.players[0];
    } else if (this._model.game?.state.x === undefined) {
      return undefined;
    }
    return undefined;
  }

  /**
   * Returns the player with the 'O' game piece, if there is one, or undefined otherwise
   * 
   * @returns PlayerController | undefined
   */
  get o(): PlayerController | undefined {
    if (
      this._model.game?.state.status === 'WAITING_TO_START' &&
      this._model.game?.state.o === undefined
    ) {
      return undefined;
    }
    if (this.players[1] && this._model.game?.state.o === this.players[1].id) {
      return this.players[1];
    }
    if (this.players[0] && this._model.game?.state.o === this.players[0].id) {
      return this.players[0];
    } else if (this._model.game?.state.o === undefined) {
      return undefined;
    }
    return undefined; 
  }

  /**
   * Returns the number of moves that have been made in the game
   * 
   * @returns number 
   */

  get moveCount(): number {
    if (this._model.game) {
      return this._model.game?.state.moves.length;
    }
    return 0; 
  }

  /**
   * Returns the winner of the game, if there is one
   * 
   * @returns PlayerController | undefined
   */
  get winner(): PlayerController | undefined {
    if (this._model.game?.state.winner === this.x?.id) {
      return this.x;
    }
    if (this._model.game?.state.winner === this.o?.id) {
      return this.o;
    }
    return undefined; 
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   * 
   * @returns PlayerController | undefined
   */
  get whoseTurn(): PlayerController | undefined {
    if (this.status === 'IN_PROGRESS') {
      if (this._model.game?.state.turn === 'X') {
        return this.x;
      } else {
        return this.o;
      }
    }
    return undefined; 
  }

  /**
   * Returns true if it is our turn to make a move in the game
   * Returns false if it is not our turn, or if the game is not in progress
   * 
   * @returns true if it is our turn to make a move in the game
   * @returns false if it is not our turn, or if the game is not in progress
   */
  get isOurTurn(): boolean {
    if (this.isActive()) {
      if (this._townController.ourPlayer === this.x && this.whoseTurn === this.x) {
        return true;
      }
      if (this._townController.ourPlayer === this.o && this.whoseTurn === this.o) {
        return true;
      }
    }
    return false; 
  }

  /**
   * Returns true if the current player is a player in this game
   * 
   * @returns true if the current player is a player in this game
   * @returns false if the current player is not a player in this game
   */
  get isPlayer(): boolean {
    if (this.players.includes(this._townController.ourPlayer)) {
      return true;
    }
    return false; 
  }

  /**
   * Returns the game piece of the current player, if the current player is a player in this game
   *
   * Throws an error PLAYER_NOT_IN_GAME_ERROR if the current player is not a player in this game
   * 
   * @returns 'X' | 'O'
   */
  get gamePiece(): 'X' | 'O' {
    if (this.isPlayer) {
      if (this._townController.ourPlayer === this.x) {
        return 'X';
      } else {
        return 'O';
      }
    }
    throw new Error(PLAYER_NOT_IN_GAME_ERROR); 
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   * 
   * @returns GameStatus 
   */
  get status(): GameStatus {
    if (this._model.game?.state.status === 'IN_PROGRESS') {
      return 'IN_PROGRESS';
    }
    if (this._model.game?.state.status === 'OVER') {
      return 'OVER';
    }
    return 'WAITING_TO_START'; 
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    if (this.status === 'IN_PROGRESS') {
      return true;
    }
    return false; 
  }

  /**
   * Returns the ship that is currently being placed by the current player, if the current player is placing a ship
   * Returns 'guess' if the current player is guessing
   * Returns undefined if the current player is not placing a ship or guessing
   * 
   * @returns BattleShip | undefined
   */
  get Ship(): BattleShip {
    if (
      this.isActive() &&
      this._townController.ourPlayer === this.x &&
      this._model.game?.state.x_ships !== undefined &&
      this._model.game?.state.x_ships.length !== 0
    ) {
      return this._model.game?.state.x_ships[0];
    }
    if (
      this.isActive() &&
      this._townController.ourPlayer === this.o &&
      this._model.game?.state.o_ships !== undefined &&
      this._model.game?.state.o_ships.length !== 0
    ) {
      return this._model.game?.state.o_ships[0];
    }
    if (this.isActive()) {
      return 'guess';
    } else {
      return 'guess';
    }
  }

  /**
   * Updates the internal state of this BattleShipAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   *
   * If the board has changed, emits a 'boardChanged' event with the new board. If the board has not changed,
   *  does not emit the event.
   *
   * If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   * 
   * @param newModel - the new model to update from
   * @returns void
   */
  protected _updateFrom(newModel: GameArea<BattleShipGameState>): void {
    const newMoveCount = newModel.game?.state.moves.length;
    const newPlaceCountX = newModel.game?.state.x_board.length;
    const newPlaceCountO = newModel.game?.state.o_board.length;
    // Update X and O boards based on new ship placements
    if (newPlaceCountX && newPlaceCountX > this._model.game?.state.x_board.length) {
      this.placeXShip(newModel);
    }
    if (newPlaceCountO && newPlaceCountO > this._model.game?.state.o_board.length) {
      this.placeOShip(newModel);
    }
    if (newMoveCount && newMoveCount > this.moveCount) {
      let newBoard;
      let updatedBoard;
      if (this._townController.ourPlayer === this.x) {
        newBoard = this.xGuessBoard;
        updatedBoard = this.oBoard;
      } else {
        newBoard = this.oGuessBoard;
        updatedBoard = this.xBoard;
      }
      if (newBoard === this.xGuessBoard) {
        for (let newMove = 0; newMove < newMoveCount; newMove += 1) {
          if (
            newModel.game?.state.moves[newMove].row !== undefined &&
            newModel.game?.state.moves[newMove].col !== undefined &&
            newModel.game.state.moves[newMove].player === 'X'
          ) {
            const row = newModel.game?.state.moves[newMove].row;
            const col = newModel.game?.state.moves[newMove].col;
            // if the value at row and col is 0, then change it to 3 to indicate that it is a miss
            if (this.oBoard[row][col] === 0) {
              newBoard[row][col] = 'M';
              updatedBoard[row][col] = 'M';
            } else if (
              this.oBoard[row][col] === 'C' ||
              this.oBoard[row][col] === 'B' ||
              this.oBoard[row][col] === 'R' ||
              this.oBoard[row][col] === 'S' ||
              this.oBoard[row][col] === 'D'
            ) {
              // if the value at row and col is 1, then change it to 2 to indicate that it is a hit
              newBoard[row][col] = 'H';
              updatedBoard[row][col] = 'H';
            }
          }
        }
      } else {
        for (let newMove = 0; newMove < newMoveCount; newMove += 1) {
          if (
            newModel.game?.state.moves[newMove].row !== undefined &&
            newModel.game?.state.moves[newMove].col !== undefined &&
            newModel.game.state.moves[newMove].player === 'O'
          ) {
            const row = newModel.game?.state.moves[newMove].row;
            const col = newModel.game?.state.moves[newMove].col;
            // if the value at row and col is 0, then change it to 3 to indicate that it is a miss
            if (this.xBoard[row][col] === 0) {
              newBoard[row][col] = 'M';
              updatedBoard[row][col] = 'M';
            } else if (
              this.xBoard[row][col] === 'C' ||
              this.xBoard[row][col] === 'B' ||
              this.xBoard[row][col] === 'R' ||
              this.xBoard[row][col] === 'S' ||
              this.xBoard[row][col] === 'D'
            ) {
              // if the value at row and col is 1, then change it to 2 to indicate that it is a hit
              newBoard[row][col] = 'H';
              updatedBoard[row][col] = 'H';
            }
          }
        }
      }
      this.emit('boardChanged', updatedBoard);
      this.emit('boardChanged', newBoard);
      if (newModel.game?.state.turn !== this.whoseTurn) {
        this.emit('turnChanged', true);
      } else {
        this.emit('turnChanged', false);
      }
    }
    if (newModel.game?.state.status === 'OVER') {
      this._resetBoards();
    }
    super._updateFrom(newModel);
  }

/**
 * Emits a boardChanged event with the updated board with the ship placed on it
 * 
 * @param boardModel - the board model to be updated
 * @returns void
 */
  protected placeXShip(boardModel: GameArea<BattleShipGameState>): void {
    const boardData = boardModel.game?.state.x_board;
    const boardToUpdate = this.xBoard;
    if (!boardData || boardData.length === 0) return;

    // Use the ship type to determine the size and place it on the board
    let shipSize;
    let shipSymbol: BattleShipCell;
    switch (boardData[boardData.length - 1].shiptype) {
      case 'battleship':
        shipSize = 4;
        shipSymbol = 'B';
        break;
      case 'carrier':
        shipSize = 5;
        shipSymbol = 'C';
        break;
      case 'criuser':
        shipSize = 3;
        shipSymbol = 'R';
        break;
      case 'submarine':
        shipSize = 3;
        shipSymbol = 'S';
        break;
      case 'destroyer':
        shipSize = 2;
        shipSymbol = 'D';
        break;
      default:
        return; // Invalid ship type
    }

    // Assuming horizontal placement for simplicity
    let latestShip = boardData[boardData.length - 1];
    for (let i = 1; i <= shipSize; i++) {
      latestShip = boardData[boardData.length - i];
      boardToUpdate[latestShip.row][latestShip.col] = shipSymbol;
    }

    this.emit('boardChanged', boardToUpdate);
  }

/**
 * Emits a boardChanged event with the updated board with the ship placed on it
 * 
 * @param boardModel the board model to be updated
 * @returns void
 */
  protected placeOShip(boardModel: GameArea<BattleShipGameState>): void {
    const boardData = boardModel.game?.state.o_board;
    const boardToUpdate = this.oBoard;
    if (!boardData || boardData.length === 0) return;

    // Use the ship type to determine the size and place it on the board
    let shipSize;
    let shipSymbol: BattleShipCell;
    switch (boardData[boardData.length - 1].shiptype) {
      case 'battleship':
        shipSize = 4;
        shipSymbol = 'B';
        break;
      case 'carrier':
        shipSize = 5;
        shipSymbol = 'C';
        break;
      case 'criuser':
        shipSize = 3;
        shipSymbol = 'R';
        break;
      case 'submarine':
        shipSize = 3;
        shipSymbol = 'S';
        break;
      case 'destroyer':
        shipSize = 2;
        shipSymbol = 'D';
        break;
      default:
        return; // Invalid ship type
    }

    // Assuming horizontal placement for simplicity
    let latestShip = boardData[boardData.length - 1];
    for (let i = 1; i <= shipSize; i++) {
      latestShip = boardData[boardData.length - i];
      boardToUpdate[latestShip.row][latestShip.col] = shipSymbol;
    }

    this.emit('boardChanged', boardToUpdate);
  }

  /**
   * Sends a request to the server to make a move in the game.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'GameMove',
   * and send the gameID provided by `this._instanceID`.
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   * @param row Row of the move
   * @param col Column of the move
   * @param ship Ship type of the move
   */
  public async makeMove(
    row: BattleShipGridPosition,
    col: BattleShipGridPosition,
    ship: BattleShip,
  ) {
    if (this.status !== 'IN_PROGRESS' || this._instanceID === undefined) {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    } else {
      const gamePiece = this.gamePiece;
      this._townController.sendInteractableCommand(this.id, {
        gameID: this._instanceID,
        type: 'GameMove',
        move: { row: row, col: col, shiptype: ship, player: gamePiece }, // ship type undefined for hit moves
      });
    }
    return;
  }
}
