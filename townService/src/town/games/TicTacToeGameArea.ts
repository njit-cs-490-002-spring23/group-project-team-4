import Player from '../../lib/Player';
import {
  GameMove,
  GameResult,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  TicTacToeMove,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import TicTacToeGame from './TicTacToeGame';
import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';

/**
 * A TicTacToeGameArea is a GameArea that hosts a TicTacToeGame.
 * @see TicTacToeGame
 * @see GameArea
 */
export default class TicTacToeGameArea extends GameArea<TicTacToeGame> {
  protected getType(): InteractableType {
    return 'TicTacToeArea';
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  /**
   * Handle various game-related commands.
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    /**
     * when a player attempts to join a game
     */
    if (command.type === 'JoinGame') {
      /**
       * checks to see if theres a game in progress already
       * if there isnt, it creates a new one
       */
      if (!this._game || this._game.state.status !== 'IN_PROGRESS') {
        this._game = new TicTacToeGame();
      }
      /**
       * adds the player to the game
       */
      this._game.join(player);
      /**
       * emits a notification that the games state has changed
       */
      this._emitAreaChanged();
      /**
       * returns the id of the game that the player joined
       */
      return { gameID: this._game.id } as InteractableCommandReturnType<CommandType>;
    }
    /**
     * when a player makes a move in a game
     */
    if (command.type === 'GameMove') {
      /**
       * making sure that the game is in progress before
       * actually doing anything
       */
      if (!this._game || this._game.state.status !== 'IN_PROGRESS') {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      /**
       * making sure that the game id in the command
       * matches the game id of their game
       */
      if (command.gameID !== this._game.id) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      /**
       * I had to use a try catch block here because i kept getting an error
       * when trying to create the move
       * I found online that if you put it in a try catch
       * block it would get rid of the error but i really dont know why
       */
      try {
        /**
         * create the move to apply
         */
        const playerMove: GameMove<TicTacToeMove> = {
          gameID: command.gameID,
          move: command.move,
          playerID: player.id,
        };

        /**
         * actually apply the move to the game using the
         * applyMove method
         */
        this._game.applyMove(playerMove);

        /**
         * checks to see if the status is OVER,
         * after applying the move
         *
         * I know this seems like a roundabout way to check
         * if the status is OVER and that is because it is.
         * When trying to just check for if the status is equal to
         * OVER, i kept getting an error.
         * so instead of checking for OVER, i just checked for
         * not equal to the other 2 options
         */
        if (
          this._game.state.status !== 'IN_PROGRESS' &&
          this._game.state.status !== 'WAITING_TO_START'
        ) {
          let xWin = 0;
          let oWin = 0;

          /**
           * figure out which player won
           */
          if (this._game.state.winner === this._game.state.x) {
            xWin = 1;
          } else if (this._game.state.winner === this._game.state.o) {
            oWin = 1;
          }

          /**
           * records the game's result and adds it
           * to the history array
           */
          const result: GameResult = {
            gameID: this._game.id,
            scores: {
              x: xWin,
              o: oWin,
            },
          };
          this._history.push(result);
        }

        /**
         * Emits a notification that the game state has changed
         */
        this._emitAreaChanged();
        /**
         * Returns the id of the game after the move is made
         */
        return { gameID: this._game.id } as InteractableCommandReturnType<CommandType>;
      } catch (error) {
        throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
      }
    } else if (command.type === 'LeaveGame') {
      /**
       * when a player leaves a game
       */
      /**
       * makes sure that the game is in progress and that the
       */
      if (!this._game || this._game.state.status !== 'IN_PROGRESS') {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      } else if (command.gameID !== this._game.id) {
        /**
         * throws errro when game is in progress and id mismatch
         */
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      } else {
        /**
         * Removes the player from the game
         */
        this._game.leave(player);
        /**
         * Emits a notification of the game state chnage
         */
        this._emitAreaChanged();
        /**
         * Return the id of the game after the player left
         */
        if (
          this._game.state.status !== 'IN_PROGRESS' &&
          this._game.state.status !== 'WAITING_TO_START'
        ) {
          let oWin = 0;
          let xWin = 0;
          if (this._game.state.winner === this._game.state.x) {
            xWin = 1;
          } else if (this._game.state.winner === this._game.state.o) {
            oWin = 1;
          }
          const result: GameResult = {
            gameID: this._game.id,
            scores: {
              x: xWin,
              o: oWin,
            },
          };

          this._history.push(result);
        }
      }
      return { gameID: this._game.id } as InteractableCommandReturnType<CommandType>;
    } else {
      throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
    }
  }
}
