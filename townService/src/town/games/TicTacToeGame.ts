import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, BattleShipGameState, BattleShipMove, BattleShipGridPosition } from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A BattleshipGame is a Game that implements the rules of Battleship.
 * @see https://en.wikipedia.org/wiki/Battleship_(game)
 */
export default class BattleshipGame extends Game<BattleShipGameState, BattleShipMove> {
  public constructor() {
    super({
      moves: [],
      x_board: undefined,
      o_board: undefined,
      x_ships: ['battleship','carrier','criuser','destroyer','submarine'],
      o_ships: ['battleship','carrier','criuser','destroyer','submarine'],
      status: 'IN_PROGRESS'
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
  }*/
  private _isHit(move: GameMove<BattleShipMove>): boolean{
    //to check if a ship is hit
    const board = this.state.board;
    for (const placement of board){
      if (placement.row === move.row && placement.col === move.col){
        return true;
      }
  
  
    }
    return false;
  }


  private _checkForGameEnding() {
    const xHits = this._countHits(this.state.x_board, this.state.moves);
    const oHits = this._countHits(this.state.o_board, this.state.moves);
  
    if (xHits >= 17 || oHits >= 17) {
      this.state.status = 'OVER';
      this.state.winner = oHits >= 17 ? 'X' : 'O';
    }
  }
  
  private _countHits(board: BattleShipGridPosition[], moves: GameMove<BattleShipMove>[]): number {
    let hitCount = 0;
    for (const move of moves) {
      if (board.some(position => position.row === move.row && position.col === move.col)) {
        hitCount++;
      }
    }
    return hitCount;
  }
  
  

  private _validateGuessMove(move: GameMove<BattleShipMove>) {
    // Implement validation logic for a move in Battleship
    // - Check if it's the player's turn
    // - Check if the move is within the bounds of the board
    // - Check if the game is in progress
  }
  private _validatePlacementMove(move: GameMove<BattleShipMove>) {
    // Implement validation logic for a move in Battleship
    // - Check if it's the player's turn
    // - Check if the move is within the bounds of the board
    // - Check if the game is in progress
  }

  public applyMove(move: GameMove<BattleShipMove>): void {
    /* * placement move
    */if(this.state.status !== 'IN_PROGRESS'){

    }
    else{
      if(move.move.shiptype !== undefined){
        this._validatePlacementMove(move);
        var _impliedMove;
        var _maxIndex;
        if(move.move.player === 'X'){
          this.state.x_ships = this.state.x_ships.filter(ship => ship !== move.move.shiptype);
          this.state.x_board = this.state.x_board.concat(move.move);
          switch (move.move.shiptype) {
            case 'battleship':
              _maxIndex = 5;
              break;
            case 'carrier':
              _maxIndex = 4;
              break;
            case 'criuser':
              _maxIndex = 3;
              break;
            case 'destroyer':
              _maxIndex = 3;
              break;
            case 'submarine':
              _maxIndex = 2;
              break;
            default:
              _maxIndex = 0;
              break;
          }
          for(var i = 1; i < _maxIndex; i+=1){
            const _column = <BattleShipGridPosition>(move.move.col + i);
            _impliedMove = {
              row: move.move.row, 
              col: _column,
              shiptype: move.move.shiptype,
              player: move.move.player,
             };
             move.move = _impliedMove;
             this.state.x_board = this.state.x_board.concat(move.move);
          }
        }
        else{
          this.state.o_ships = this.state.o_ships.filter(ship => ship !== move.move.shiptype);
          this.state.o_board = this.state.o_board.concat(move.move);
          switch (move.move.shiptype) {
            case 'battleship':
              _maxIndex = 5;
              break;
            case 'carrier':
              _maxIndex = 4;
              break;
            case 'criuser':
              _maxIndex = 3;
              break;
            case 'destroyer':
              _maxIndex = 3;
              break;
            case 'submarine':
              _maxIndex = 2;
              break;
            default:
              _maxIndex = 0;
              break;
          }
          for(var i = 1; i < _maxIndex; i+=1){
            const _column = <BattleShipGridPosition>(move.move.col + i);
            _impliedMove = {
              row: move.move.row, 
              col: _column,
              shiptype: move.move.shiptype,
              player: move.move.player,
             };
             move.move = _impliedMove;
             this.state.x_board = this.state.x_board.concat(move.move);
          }
        }
      } /* * guess move
      */else {
        this._validateGuessMove(move);
        if(!this._isHit(move)){
          /**update turn */
        }
        this.state.moves = this.state.moves.concat(move.move);
        this._checkForGameEnding();
      }
    }
    
    
    // Validate the move
    // Apply the move
  }

  protected _join(player: Player): void {
    // Check if the player is already in the game
    if (this.state.x === player.id || this.state.o === player.id) {
      throw new InvalidParametersError("Player already in the game");
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
      throw new InvalidParametersError("Game is full");
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
      throw new InvalidParametersError("Player not in game");
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
    } else { // If player2...o is leaving
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
