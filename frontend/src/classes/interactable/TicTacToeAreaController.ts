import {
  GameArea,
  GameStatus,
  TicTacToeGameState,
  TicTacToeGridPosition,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type TicTacToeCell = 'X' | 'O' | undefined;
export type TicTacToeEvents = GameEventTypes & {
  boardChanged: (board: TicTacToeCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Tic Tac Toe game, and for sending commands to the server
 */
export default class TicTacToeAreaController extends GameAreaController<
  TicTacToeGameState,
  TicTacToeEvents
> {
  private _currentBoard = [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ];

  /**
   * Returns the current state of the board.
   *
   * The board is a 3x3 array of TicTacToeCell, which is either 'X', 'O', or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[2][2] is the bottom-right cell
   */
  get board(): TicTacToeCell[][] {
    return this._currentBoard;
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
      if (this.moveCount % 2 === 0) {
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
  protected _updateFrom(newModel: GameArea<TicTacToeGameState>): void {
    const newMoveCount = newModel.game?.state.moves.length;
    if (newMoveCount && newMoveCount > this.moveCount) {
      const newBoard = this.board;
      for (let newMove = 0; newMove < newMoveCount; newMove += 1) {
        if (
          newModel.game?.state.moves[newMove].row !== undefined &&
          newModel.game?.state.moves[newMove].col !== undefined
        ) {
          const row = newModel.game?.state.moves[newMove].row;
          const col = newModel.game?.state.moves[newMove].col;
          newBoard[row][col] = newModel.game?.state.moves[newMove].gamePiece;
        }
      }
      this.emit('boardChanged', newBoard);
      if (newMoveCount % 2 == 0 && this.gamePiece === 'X') {
        this.emit('turnChanged', true);
      } else if (newMoveCount % 2 == 1 && this.gamePiece === 'O') {
        this.emit('turnChanged', true);
      } else {
        this.emit('turnChanged', false);
      }
    }
    super._updateFrom(newModel);
    //TODO
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
  public async makeMove(row: TicTacToeGridPosition, col: TicTacToeGridPosition) {
    if (this.status !== 'IN_PROGRESS' || this._instanceID === undefined) {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    } else {
      const gamePiece = this.gamePiece;
      this._townController.sendInteractableCommand(this.id, {
        gameID: this._instanceID,
        type: 'GameMove',
        move: { gamePiece, row, col },
      });
    }
    return;
  }
}
