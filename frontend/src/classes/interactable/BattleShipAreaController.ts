import {
  GameArea,
  GameStatus,
  BattleShipGameState,
  BattleShipGridPosition,
  BattleShip,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type BattleShipCell = 3 | 2 | 1 | 0 | undefined;
export type BattleShipEvents = GameEventTypes & {
  boardChanged: (board: BattleShipCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the BattleShip game, and for sending commands to the server
 */
export default class BattleShipAreaController extends GameAreaController<
  BattleShipGameState,
  BattleShipEvents
> {
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

  private _currentOGeussBoard: BattleShipCell[][] = [
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
   * The board is a 10x10 array of BattleShipCell, which is either '1', '2', or '0',
   * describing 'hit', 'miss', and 'unattacked' respectively.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[2][2] is the bottom-right cell
   */
  get board(): BattleShipCell[][] {
    if (this._townController.ourPlayer === this.x && this.moveCount === 0) {
      return this._currentXBoard;
    } else if (this._townController.ourPlayer === this.o && this.moveCount === 0) {
      return this._currentOBoard;
    } else if (
      this._townController.ourPlayer === this.x &&
      this.moveCount > 0 &&
      this.whoseTurn === this.x
    ) {
      return this._currentXGuessBoard;
    } else {
      return this._currentOGeussBoard;
    }
    //TODO
  }

  /**
   * Returns the player with the 'X' game piece, if there is one, or undefined otherwise
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
    //TODO
  }

  /**
   * Returns the player with the 'O' game piece, if there is one, or undefined otherwise
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
    return undefined; //TODO
  }

  /**
   * Returns the number of moves that have been made in the game
   */

  get moveCount(): number {
    if (this._model.game) {
      return this._model.game?.state.moves.length;
    }
    return 0; //TODO
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    if (this._model.game?.state.winner === this.x?.id) {
      return this.x;
    }
    if (this._model.game?.state.winner === this.o?.id) {
      return this.o;
    }
    return undefined; //TODO
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   */
  get whoseTurn(): PlayerController | undefined {
    if (this.status === 'IN_PROGRESS') {
      if (this._model.game?.state.turn === 'X') {
        return this.x;
      } else {
        return this.o;
      }
    }
    return undefined; //TODO
  }

  /**
   * Returns true if it is our turn to make a move in the game
   * Returns false if it is not our turn, or if the game is not in progress
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
    return false; //TODO
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    if (this.players.includes(this._townController.ourPlayer)) {
      return true;
    }
    return false; //TODO
  }

  /**
   * Returns the game piece of the current player, if the current player is a player in this game
   *
   * Throws an error PLAYER_NOT_IN_GAME_ERROR if the current player is not a player in this game
   */
  get gamePiece(): 'X' | 'O' {
    if (this.isPlayer) {
      if (this._townController.ourPlayer === this.x) {
        return 'X';
      } else {
        return 'O';
      }
    }
    throw new Error(PLAYER_NOT_IN_GAME_ERROR); //TODO
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    if (this._model.game?.state.status === 'IN_PROGRESS') {
      return 'IN_PROGRESS';
    }
    if (this._model.game?.state.status === 'OVER') {
      return 'OVER';
    }
    return 'WAITING_TO_START'; //TODO
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    if (this.status === 'IN_PROGRESS') {
      return true;
    }
    return false; //TODO
  }

  get Ship(): BattleShip {
    if (
      this.isActive() &&
      this._townController.ourPlayer === this.x &&
      this._model.game?.state.x_ships !== undefined &&
      this._model.game?.state.x_ships.length !== 0
    ) {
      return this._model.game?.state.x_ships[0];
    } else if (
      this.isActive() &&
      this._townController.ourPlayer === this.o &&
      this._model.game?.state.o_ships !== undefined &&
      this._model.game?.state.o_ships.length !== 0
    ) {
      return this._model.game?.state.o_ships[0];
    } else if (this.isActive()) {
      return 'guess';
    } else {
      //potentially throw error here
      return 'guess';
    }
  }

  /**
   * Updates the internal state of this TicTacToeAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   *
   * If the board has changed, emits a 'boardChanged' event with the new board. If the board has not changed,
   *  does not emit the event.
   *
   * If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   */
  protected _updateFrom(newModel: GameArea<BattleShipGameState>): void {
    const newMoveCount = newModel.game?.state.moves.length;
    // TODO: if moveCount is zero, game has just started, so update the board with ship placements
    const newPlaceCountX = newModel.game?.state.x_board.length;
    const newPlaceCountO = newModel.game?.state.o_board.length;
    if (newPlaceCountO && newPlaceCountO > this._model.game?.state.o_board.length) {
      this.placeShip(newModel);
    } else if (newPlaceCountX && newPlaceCountX > this._model.game?.state.x_board.length) {
      this.placeShip(newModel);
    }
    if (newMoveCount && newMoveCount > this.moveCount) {
      const newBoard = this.board;
      for (let newMove = 0; newMove < newMoveCount; newMove += 1) {
        if (
          newModel.game?.state.moves[newMove].row !== undefined &&
          newModel.game?.state.moves[newMove].col !== undefined
        ) {
          const row = newModel.game?.state.moves[newMove].row;
          const col = newModel.game?.state.moves[newMove].col;
          // newBoard[row][col] = newModel.game?.state.moves[newMove].gamePiece;
          // if the value at row and col is 0, then change it to 3 to indicate that it is a miss
          if (newBoard[row][col] === 0) {
            newBoard[row][col] = 3;
          } else if (newBoard[row][col] === 1) {
            // if the value at row and col is 1, then change it to 2 to indicate that it is a hit
            newBoard[row][col] = 2;
          } else if (newBoard[row][col] === 2) {
            // if the value at row and col is 2, then indicate that it has already been hit
            // TODO
          } else if (newBoard[row][col] === 3) {
            // if the value at row and col is 3, then indicate that it has already been missed
            // TODO
          }
        }
      }
      this.emit('boardChanged', newBoard);
      if (newModel.game?.state.turn !== this.whoseTurn) {
        this.emit('turnChanged', true);
      } else {
        this.emit('turnChanged', false);
      }
    }
    super._updateFrom(newModel);
    //TODO
  }

  // Horizontal implementation
  protected placeShip(newModel: GameArea<BattleShipGameState>) {
    const ourBoard = this.board;
    let row;
    let col;
    if (this.isOurTurn) {
      switch (newModel.game?.state.x_board[newModel.game?.state.x_board.length - 1].shiptype) {
        case 'battleship':
          if (newModel.game.state.turn === 'X') {
            row = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 4].row;
            col = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 4].col;
          } else {
            row = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 4].row;
            col = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 4].col;
          }
          for (let i = 0; i < 4; i += 1) {
            ourBoard[row][col + i] = 1;
          }
          break;
        case 'carrier':
          if (newModel.game.state.turn === 'X') {
            row = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 5].row;
            col = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 5].col;
          } else {
            row = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 5].row;
            col = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 5].col;
          }
          for (let i = 0; i < 5; i += 1) {
            ourBoard[row][col + i] = 1;
          }
          break;
        case 'criuser':
          if (newModel.game.state.turn === 'X') {
            row = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 3].row;
            col = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 3].col;
          } else {
            row = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 3].row;
            col = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 3].col;
          }
          for (let i = 0; i < 3; i += 1) {
            ourBoard[row][col + i] = 1;
          }
          break;

        case 'submarine':
          if (newModel.game.state.turn === 'X') {
            row = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 3].row;
            col = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 3].col;
          } else {
            row = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 3].row;
            col = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 3].col;
          }
          for (let i = 0; i < 3; i += 1) {
            ourBoard[row][col + i] = 1;
          }
          break;

        case 'destroyer':
          if (newModel.game.state.turn === 'X') {
            row = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 2].row;
            col = newModel.game?.state.x_board[newModel.game?.state.x_board.length - 2].col;
          } else {
            row = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 2].row;
            col = newModel.game?.state.o_board[newModel.game?.state.o_board.length - 2].col;
          }
          for (let i = 0; i < 2; i += 1) {
            ourBoard[row][col + i] = 1;
          }
          break;
      }
    }
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
