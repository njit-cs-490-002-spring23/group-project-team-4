import Player from '../../lib/Player';
import { GameMove, TicTacToeGameState, TicTacToeMove } from '../../types/CoveyTownSocket';
import Game from './Game';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

/**
 * A TicTacToeGame is a Game that implements the rules of Tic Tac Toe.
 * @see https://en.wikipedia.org/wiki/Tic-tac-toe
 */
export default class TicTacToeGame extends Game<TicTacToeGameState, TicTacToeMove> {
  public constructor() {
    super({
      moves: [],
      status: 'WAITING_TO_START',
    });
  }

  /*
   * Applies a player's move to the game.
   * Uses the player's ID to determine which game piece they are using (ignores move.gamePiece)
   * Validates the move before applying it. If the move is invalid, throws an InvalidParametersError with
   * the error message specified below.
   * A move is invalid if:
   *    - The move is on a space that is already occupied (use BOARD_POSITION_NOT_EMPTY_MESSAGE)
   *    - The move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
   *    - The game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   *
   * If the move is valid, applies the move to the game and updates the game state.
   *
   * If the move ends the game, updates the game's state.
   * If the move results in a tie, updates the game's state to set the status to OVER and sets winner to undefined.
   * If the move results in a win, updates the game's state to set the status to OVER and sets the winner to the player who made the move.
   * A player wins if they have 3 in a row (horizontally, vertically, or diagonally).
   *
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the move is invalid (with specific message noted above)
   */
  public applyMove(move: GameMove<TicTacToeMove>): void {
    /**
     * trows an error is the game is not in progress
     */
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    /**
     * get the game letter for the current player
     */
    let currentLetter: 'X' | 'O' | null = null;
    if (this.state.x === move.playerID) {
      currentLetter = 'X';
    } else if (this.state.o === move.playerID) {
      currentLetter = 'O';
    }
    /**
     * checks if theres no letter thats assigned with the player
     */
    if (!currentLetter) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }

    /**
     * Checking if it's actually the player's turn by checking
     * their last move
     */
    const lastMove = this.state.moves[this.state.moves.length - 1];
    if (lastMove && lastMove.gamePiece === currentLetter) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }

    /**
     * searches through the existing moves to check if the given move is valid
     * sf a move is found in that position, sets foundMove to that move and then exits the loop
     */
    let foundMove;
    for (let i = 0; i < this.state.moves.length; i++) {
      if (this.state.moves[i].row === move.move.row && this.state.moves[i].col === move.move.col) {
        foundMove = this.state.moves[i];
        break;
      }
    }
    /**
     * if foundMove is already taken, throws a not empty error
     */
    if (foundMove) {
      throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
    }

    /**
     * actually applying the move
     */
    const newMove: TicTacToeMove = {
      gamePiece: currentLetter,
      row: move.move.row,
      col: move.move.col,
    };
    this.state.moves = this.state.moves.concat(newMove);

    /**
     *  checks for a winner
     */
    const playerWon = this._checkForWin(currentLetter);
    if (playerWon) {
      this.state.status = 'OVER';
      this.state.winner = move.playerID;
      return;
    }

    /**
     * checks for tie
     */
    if (this.state.moves.length === 9) {
      this.state.status = 'OVER';
    }
  }

  /**
   * at first i didnt know how i was going to check for winning combinations
   * as i thought there would be 9 factorial combinations.
   * and after searching the web i realized that this was true
   * but there is only 8 winning combinations, duhhh!
   *
   * So this helper methods checks if the given game piece
   * has a winning configuration
   *
   * It takes the parameter 'peice' , which is either an X or O
   *
   * it checks if the game piece occupies any of the eight winning combos
   * if any configuration has three matching moves, it returns true
   * Otherwise, it returns false
   */
  private _checkForWin(piece: 'X' | 'O'): boolean {
    const pieceAt = (row: number, col: number): boolean => {
      for (const move of this.state.moves) {
        if (move.row === row && move.col === col && move.gamePiece === piece) {
          return true;
        }
      }
      return false;
    };

    /**
     * checking for horizontal win matches
     */
    if (pieceAt(0, 0) && pieceAt(0, 1) && pieceAt(0, 2)) return true;
    if (pieceAt(1, 0) && pieceAt(1, 1) && pieceAt(1, 2)) return true;
    if (pieceAt(2, 0) && pieceAt(2, 1) && pieceAt(2, 2)) return true;

    /**
     * checking for vertical win matches
     */
    if (pieceAt(0, 0) && pieceAt(1, 0) && pieceAt(2, 0)) return true;
    if (pieceAt(0, 1) && pieceAt(1, 1) && pieceAt(2, 1)) return true;
    if (pieceAt(0, 2) && pieceAt(1, 2) && pieceAt(2, 2)) return true;

    /**
     * checking for diagonal win matches
     */
    if (pieceAt(0, 0) && pieceAt(1, 1) && pieceAt(2, 2)) return true;
    if (pieceAt(0, 2) && pieceAt(1, 1) && pieceAt(2, 0)) return true;

    return false;
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */

  public _join(player: Player): void {
    /**
     * first checking to see if the game is already full, if it is, throw error message
     */
    if (this.state.x && this.state.o) {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }

    /**
     * then checking if the player is in the game already, if they are then throws error message
     */
    for (const existingPlayer of this._players) {
      if (existingPlayer.id === player.id) {
        throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      }
    }

    /**
     * Give the player x if they are first, and o if second
     * also add the player to the players array
     */

    if (!this.state.x) {
      this.state.x = player.id;
      this._players.push(player);
    } else {
      this.state.o = player.id;
      this.state.status = 'IN_PROGRESS';
      this._players.push(player);
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   * If the game has two players in it at the time of call to this method,
   *   updates the game's status to OVER and sets the winner to the other player.
   * If the game does not yet have two players in it at the time of call to this method,
   *   updates the game's status to WAITING_TO_START.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */

  protected _leave(player: Player): void {
    /**
     * throwing an error if the player isnt in the game
     */
    if (player.id !== this.state.x && player.id !== this.state.o)
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    /**
     * if the game was currently in progress and
     * if it was x's turn and he left, then o wins
     * if it was o's turn and he left, then x wins
     */
    if (this.state.status === 'IN_PROGRESS' && player.id === this.state.x) {
      this.state.status = 'OVER';
      this.state.winner = this.state.o;
    } else if (this.state.status === 'IN_PROGRESS' && player.id === this.state.o) {
      this.state.status = 'OVER';
      this.state.winner = this.state.x;
    } else {
      this.state.status = 'WAITING_TO_START';
    }
    /**
     * If the game does not have two players in it , it chnages status to waiting
     */
    if (
      (!this.state.x && this.state.o) ||
      (this.state.x && !this.state.o) ||
      (!this.state.x && !this.state.o)
    ) {
      this.state.status = 'WAITING_TO_START';
    }
    /**
     * actually removes the player who left from the game
     */
    if (this.state.status === 'WAITING_TO_START' && player.id === this.state.x) {
      delete this.state.x;
    } else if (this.state.status === 'WAITING_TO_START' && player.id === this.state.o) {
      delete this.state.o;
    }
  }
}
