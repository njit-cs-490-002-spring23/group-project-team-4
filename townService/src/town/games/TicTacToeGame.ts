import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, BattleShipGameState, BattleShip,BattleShipGuessMove,BattleShipPlacementMove, BattleShipMove } from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A BattleshipGame is a Game that implements the rules of Battleship.
 * @see https://en.wikipedia.org/wiki/Battleship_(game)
 */
export default class BattleshipGame extends Game<BattleShipGameState, BattleShipMove> {
  public constructor() {
    super({
      moves: [],
      board: undefined,
      ships: [],
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
  public isHit( guess: BattleShipGuessMove): boolean{
    //to check if a ship is hit
    const board = this.state.board;
    for (const placement of board){
      if (placement.row === guess.row && placement.col === guess.col){
        return true;
      }
  
  
    }
    return false;
  }


  private _checkForGameEnding() {
    // Implement logic to check if all ships of a player are sunk
  }

  private _validateGuessMove(move: BattleShipGuessMove) {
    // Implement validation logic for a move in Battleship
    // - Check if it's the player's turn
    // - Check if the move is within the bounds of the board
    // - Check if the game is in progress
  }
  private _validatePlacementMove(move: BattleShipPlacementMove) {
    // Implement validation logic for a move in Battleship
    // - Check if it's the player's turn
    // - Check if the move is within the bounds of the board
    // - Check if the game is in progress
  }

  public applyMove(move: GameMove<BattleShipMove>): void {
    // Validate the move
    // Apply the move
  }

  public applyGuessMove(move: GameMove<BattleShipMove>): void {
    // Validate the move
    // Apply the move
  }

/**
 * Attempts to add a player to the Battleship game. 
 * the first player is assigned as x and the second as o, as to not have to chnage as much from ip2
 * The method checks if the player is already in the game, and if not, assigns them as 'x' or 'o'.
 * The game starts once both 'x' and 'o' have joined.
 * 
 * @param player The player attempting to join the game.
 * @throws
 */
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
  
/**
 * Handles a player's departure from the Battleship game.
 * This method checks if the player is currently in the game.
 * If the game has not started (i.e., only one player has joined), it sets the game status to 'WAITING_TO_START'.
 * If the game is in progress, it ends the game and sets the remaining player as the winner.
 * 
 * @param player The player attempting to leave the game.
 * @throws
 */
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
  

  // Additional methods for Battleship game logic (placing ships, handling turns, etc...)
}
