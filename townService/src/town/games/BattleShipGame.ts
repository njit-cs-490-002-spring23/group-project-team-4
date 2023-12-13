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
 * 
 * The game state is represented by a BattleShipGameState, which is a JSON object with the following properties:
 * - moves: an array of BattleShipMove objects, representing the moves made in the game so far
 * - x_board: an array of BattleShipGridPosition objects, representing the positions of X's ships
 * - o_board: an array of BattleShipGridPosition objects, representing the positions of O's ships
 * - x_ships: an array of strings, representing the ships that X has not yet placed
 * - o_ships: an array of strings, representing the ships that O has not yet placed
 * - status: a string, representing the status of the game (WAITING_TO_START, IN_PROGRESS, or OVER)
 * - turn: a string, representing whose turn it is (X or O)
 * 
 * @see https://en.wikipedia.org/wiki/Battleship_(game)
 * @see BattleShipGameState
 * @see BattleShipMove
 */
export default class BattleShipGame extends Game<BattleShipGameState, BattleShipMove> {
  public constructor() {
    super({
      moves: [],
      x_board: [],
      o_board: [],
      x_ships: ['carrier', 'battleship', 'criuser', 'submarine', 'destroyer'],
      o_ships: ['carrier', 'battleship', 'criuser', 'submarine', 'destroyer'],
      status: 'WAITING_TO_START',
      turn: 'X',
    });
  }

  /**
   * Checks if the move is a hit
   * 
   * @param move move to check if it is a hit
   * @returns true if the move is a hit
   * @returns false if the move is not a hit
   */
  private _isHit(move: GameMove<BattleShipMove>): boolean {
    // to check if a ship is hit
    let board;
    if (move.move.player === 'O') {
      board = this.state.x_board;
    } else {
      board = this.state.o_board;
    }
    for (let i = 0; i < board.length; i += 1) {
      if (board[i].row === move.move.row && board[i].col === move.move.col) {
        return true;
      }
    }

    return false;
  }

  /**
   * Updates the turn to the next player after a move is made by changing the state.turn
   * 
   * @returns void
   */
  private _updateTurn() {
    // the turn will be set to X by default in the beginnng of the game
    if (this.state.turn === 'X') {
      this.state.turn = 'O';
    } else if (this.state.turn === 'O') {
      this.state.turn = 'X';
    }
  }

  /**
   * Checks if the game is over by checking if the number of hits is greater than or equal to 17
   * Changes the state.status to OVER and the state.winner to the player who won
   * 
   * @remarks 17 is the total number of hits needed to win the game
   * @returns void
   */
  private _checkForGameEnding() {
    const xHits = this._countHitsX();
    const oHits = this._countHitsO();

    if (xHits >= 17 || oHits >= 17) {
      this.state.status = 'OVER';
      this.state.winner = oHits >= 17 ? this.state.x : this.state.o;
    }
  }

  /**
   * Counts the number of hits for player X
   * 
   * @returns number of hits for player X
   */
  private _countHitsX(): number {
    let hitCountX = 0;
    const board = this.state.x_board;
    for (const move of this.state.moves) {
      for (let i = 0; i < board.length; i += 1)
        if (move.player === 'O') {
          if (move.row === board[i].row && move.col === board[i].col) {
            hitCountX++;
          }
        }
    }
    return hitCountX;
  }

  /**
   * Counts the number of hits for player O
   * 
   * @returns number of hits for player O
   */
  private _countHitsO(): number {
    let hitCountO = 0;
    const board = this.state.o_board;
    for (const move of this.state.moves) {
      for (let i = 0; i < board.length; i += 1)
        if (move.player === 'X') {
          if (move.row === board[i].row && move.col === board[i].col) {
            hitCountO++;
          }
        }
    }
    return hitCountO;
  }

  /**
   * Implements the logic for validating a guess move
   * - Check if it's the player's turn
   * - Check if the move is within the bounds of the board
   * - Check if the game is in progress
   * 
   * @param move move to validate
   * @throws InvalidParametersError if the move is invalid
   */
  private _validateGuessMove(move: GameMove<BattleShipMove>) {
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
   * 
   * @param move move to validate
   * @returns void
   * @throws InvalidParametersError if the move is invalid
   */
  private _validatePlacementMove(move: GameMove<BattleShipMove>) {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (move.move.col > 9 || move.move.row > 9) {
      throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
    }
    let board;
    if (move.move.player === 'X') {
      board = this.state.x_board;
    } else if (move.move.player === 'O') {
      board = this.state.o_board;
    }
    /* check this */
    for (const m of board)
      if (move.move.row === m.row && move.move.col === m.col) {
        throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
      }
    switch (move.move.shiptype) {
      case 'carrier':
        if (move.move.col > 5) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      case 'battleship':
        if (move.move.col > 6) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      case 'criuser':
        if (move.move.col > 7) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      case 'submarine':
        if (move.move.col > 7) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      case 'destroyer':
        if (move.move.col > 8) {
          throw new InvalidParametersError('Index out of bounds');
        }
        break;
      default:
        break;
    }
  }

  /**
   * Applies a move to the game state
   * 
   * @remarks This method is called by the GameArea when a player makes a move
   * @param move move to apply
   * @returns void
   * @throws InvalidParametersError if the move is invalid
   */
  public applyMove(move: GameMove<BattleShipMove>): void {
    /* * placement move
     */ if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    } else if (move.move.shiptype !== 'guess') {
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
          const colnum = move.move.col + i;
          const column = <BattleShipGridPosition>colnum;
          impliedMove = {
            row: move.move.row,
            col: column,
            shiptype: move.move.shiptype,
            player: move.move.player,
          };
          this.state.x_board = this.state.x_board.concat(impliedMove);
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
          const colnum = move.move.col + i;
          const column = <BattleShipGridPosition>colnum;
          impliedMove = {
            row: move.move.row,
            col: column,
            shiptype: move.move.shiptype,
            player: move.move.player,
          };
          this.state.o_board = this.state.o_board.concat(impliedMove);
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
  }

  /**
   * Adds a player to the game
   * 
   * @remarks This method is called by the GameArea when a player joins the game
   * @param player player to join the game
   * @returns void
   * @throws InvalidParametersError if the player is already in the game or the game is full
   */
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

  /**
   * Removes a player from the game
   * 
   * @remarks This method is called by the GameArea when a player leaves the game
   * @param player player to leave the game
   * @returns void
   * @throws InvalidParametersError if the player is not in the game 
   */
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
}
