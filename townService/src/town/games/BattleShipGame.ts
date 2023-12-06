import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameMove,
  BattleShipGameState,
  BattleShipMove,
  BattleShipGridPosition,
} from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A BattleshipGame is a Game that implements the rules of Battleship.
 * @see https://en.wikipedia.org/wiki/Battleship_(game)
 */
export default class BattleShipGame extends Game<BattleShipGameState, BattleShipMove> {
  public constructor() {
    super({
      moves: [],
      x_board: undefined,
      o_board: undefined,
      x_ships: ['battleship', 'carrier', 'criuser', 'destroyer', 'submarine'],
      o_ships: ['battleship', 'carrier', 'criuser', 'destroyer', 'submarine'],
      status: 'WAITING_TO_START',
      turn: undefined,
    });
  }

  /*
  private get _board() {
    const { moves } = this.state;
    const board = [
      
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
    for (const move of moves) {
      board[move.row][move.col] = 1;
    }
    return board;
  } */
  private _isHit(move: GameMove<BattleShipMove>): boolean {
    // to check if a ship is hit
    let board;
    if (move.move.player === 'O') {
      board = this.state.x_board;
    } else {
      board = this.state.o_board;
    }
    for (const placement of board) {
      if (placement.row === move.move.row && placement.col === move.move.col) {
        return true;
      }
    }
    return false;
  }

  private _updateTurn() {
    // the turn will be set to X by default in the beginnng of the game
    if (this.state.turn === 'X') {
      this.state.turn = 'O';
    } else if (this.state.turn === 'O') {
      this.state.turn = 'X';
    }
  }

  private _checkForGameEnding() {
    const xHits = this._countHitsX();
    const oHits = this._countHitsO();

    if (xHits >= 17 || oHits >= 17) {
      this.state.status = 'OVER';
      this.state.winner = oHits >= 17 ? 'X' : 'O';
    }
  }

  private _countHitsX(): number {
    let hitCountX = 0;
    const board = this.state.x_board;
    for (const move of this.state.moves) {
      if (move.player === 'O') {
        if (
          board.some(
            (position: BattleShipGridPosition) => position === move.row && position === move.col,
          )
        ) {
          hitCountX++;
        }
      }
    }
    return hitCountX;
  }

  private _countHitsO(): number {
    let hitCountO = 0;
    const board = this.state.x_board;
    for (const move of this.state.moves) {
      if (move.player === 'X') {
        if (
          board.some(
            (position: BattleShipGridPosition) => position === move.row && position === move.col,
          )
        ) {
          hitCountO++;
        }
      }
    }
    return hitCountO;
  }

  private _validateGuessMove(move: GameMove<BattleShipMove>) {
    // Implement validation logic for a move in Battleship
    // - Check if it's the player's turn
    // - Check if the move is within the bounds of the board
    // - Check if the game is in progress
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    /** check these */
    if (this.state.turn === 'X' && move.move.player === 'O') {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    } else if (this.state.turn === 'O' && move.move.player === 'X') {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }
    if (move.move.col > 9 || move.move.row > 9) {
      throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
    }
    for (const m of this.state.moves) {
      if (move.move.row === m.row && move.move.col === m.col && m.player === move.move.player) {
        throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
      }
    }
  }

  /**
   * Logic for validating ship placement
   * throw game_not in progress error if game is in progress
   * throw out of bounds error if placement goes outside board
   */
  private _validatePlacementMove(move: GameMove<BattleShipMove>) {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (move.move.col > 9 || move.move.row > 9) {
      throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
    }
    let board;
    if (this.state.turn === 'X') {
      board = this.state.x_board;
    } else if (this.state.turn === 'O') {
      board = this.state.o_board;
    }
    /* check this */
    for (const m of board)
      if (move.move.row === m.row && move.move.col === m.col) {
        throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
      }
    switch (move.move.shiptype) {
      case 'carrier':
        if (move.move.col > 4) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      case 'battleship':
        if (move.move.col > 5) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      case 'criuser':
        if (move.move.col > 6) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      case 'submarine':
        if (move.move.col > 6) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      case 'destroyer':
        if (move.move.col > 7) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      default:
        break;
    }
  }

  public applyMove(move: GameMove<BattleShipMove>): void {
    /* * placement move
     */ if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    } else if (move.move.shiptype !== undefined) {
      this._validatePlacementMove(move);
      let impliedMove;
      let maxIndex;
      if (move.move.player === 'X') {
        this.state.x_ships = this.state.x_ships.filter(ship => ship !== move.move.shiptype);
        this.state.x_board = this.state.x_board.concat(move.move);
        switch (move.move.shiptype) {
          case 'carrier':
            maxIndex = 5;
            break;
          case 'battleship':
            maxIndex = 4;
            break;
          case 'criuser':
            maxIndex = 3;
            break;
          case 'submarine':
            maxIndex = 3;
            break;
          case 'destroyer':
            maxIndex = 2;
            break;
          default:
            maxIndex = 0;
            break;
        }
        for (let i = 1; i < maxIndex; i += 1) {
          const column = <BattleShipGridPosition>(move.move.col + i);
          impliedMove = {
            row: move.move.row,
            col: column,
            shiptype: move.move.shiptype,
            player: move.move.player,
          };
          move.move = impliedMove;
          this.state.x_board = this.state.x_board.concat(move.move);
        }
      } else {
        this.state.o_ships = this.state.o_ships.filter(ship => ship !== move.move.shiptype);
        this.state.o_board = this.state.o_board.concat(move.move);
        switch (move.move.shiptype) {
          case 'carrier':
            maxIndex = 5;
            break;
          case 'battleship':
            maxIndex = 4;
            break;
          case 'criuser':
            maxIndex = 3;
            break;
          case 'submarine':
            maxIndex = 3;
            break;
          case 'destroyer':
            maxIndex = 2;
            break;
          default:
            maxIndex = 0;
            break;
        }
        for (let i = 1; i < maxIndex; i += 1) {
          const column = <BattleShipGridPosition>(move.move.col + i);
          impliedMove = {
            row: move.move.row,
            col: column,
            shiptype: move.move.shiptype,
            player: move.move.player,
          };
          move.move = impliedMove;
          this.state.x_board = this.state.x_board.concat(move.move);
        }
      }
    } else {
      /* * guess move */
      this._validateGuessMove(move);
      if (!this._isHit(move)) {
        this._updateTurn();
      }
      this.state.moves = this.state.moves.concat(move.move);
      this._checkForGameEnding();
    }

    // Validate the move
    // Apply the move
  }

  protected _join(player: Player): void {
    // Check if the player is already in the game
    if (this.state.x === player.id || this.state.o === player.id) {
      throw new InvalidParametersError('Player already in the game');
    }

    // Assign the player as 'player1' or 'player2' if the slot is available
    if (!this.state.x) {
      this.state = {
        ...this.state,
        x: player.id,
      };
    } else if (!this.state.o) {
      this.state = {
        ...this.state,
        o: player.id,
      };
    } else {
      // If both 'player1' and 'player2' are taken, the game is full
      throw new InvalidParametersError('Game is full');
    }

    // Start the game if both players have joined
    if (this.state.x && this.state.o) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
  }

  protected _leave(player: Player): void {
    if (this.state.x !== player.id && this.state.o !== player.id) {
      throw new InvalidParametersError('Player not in game');
    }

    // Handles case where the game has not started yet
    if (!this.state.o) {
      this.state = {
        ...this.state,
        status: 'WAITING_TO_START',
      };
      // Reset player1 (which we left as x) if they are the one leaving
      if (this.state.x === player.id) {
        this.state.x = undefined;
      }
      return;
    }

    // If player1...x is leaving
    if (this.state.x === player.id) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.o,
      };
    } else {
      // If player2...o is leaving
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.x,
      };
    }
  }

  // Additional methods for Battleship game logic (e.g., placing ships, handling turns, etc.)
}

// Define the BattleshipMove and BattleshipGameState types as appropriate
