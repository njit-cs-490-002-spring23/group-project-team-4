import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {GameState, GameMove, BattleShipGameState, BattleShip,BattleShipGuessMove,BattleShipPlacementMove, BattleShipMove } from '../../types/CoveyTownSocket';
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

  private static initializeBoard(): number[][] {
    const board:number[][] = [
      
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
    return board;
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
  
  private _updateTurn(){
    this.state.

  }
  private _validateGuessMove(move: BattleShipGuessMove) {

    //validate the move by checking on the board array to see if the
    //tile was already touched or not

    if(this.state.status !=="IN_PROGRESS"){
      throw GAME_NOT_IN_PROGRESS_MESSAGE;
    }
    if(this.)
    //0 the board is empty
    //1 a ship is placed
    //2 an empty tile that was already guessed & 3 is hit 

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

  protected _join(player: Player): void {
    // Add player joining logic specific to Battleship
    // - Ensure only two players can join
    // - Start the game when two players have joined
  }

  protected _leave(player: Player): void {
    // Add player leaving logic specific to Battleship
    // - End the game if a player leaves
  }

  // Additional methods for Battleship game logic (e.g., placing ships, handling turns, etc.)
}

// Define the BattleshipMove and BattleshipGameState types as appropriate
