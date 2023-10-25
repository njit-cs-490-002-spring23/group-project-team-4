import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import { TicTacToeMove } from '../../types/CoveyTownSocket';
import TicTacToeGame from './TicTacToeGame';

describe('TicTacToeGame', () => {
  let game: TicTacToeGame;

  beforeEach(() => {
    game = new TicTacToeGame();
  });

  describe('[T1.1] _join', () => {
    describe('When the player can be added', () => {
      it('makes the first player X and initializes the state with status WAITING_TO_START', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.x).toEqual(player.id);
        expect(game.state.o).toBeUndefined();
        expect(game.state.moves).toHaveLength(0);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
    describe('[T1.2] _leave', () => {
      describe('when the player is in the game', () => {
        describe('when the game is in progress, it should set the game status to OVER and declare the other player the winner', () => {
          test('when x leaves', () => {
            const player1 = createPlayerForTesting();
            const player2 = createPlayerForTesting();
            game.join(player1);
            game.join(player2);
            expect(game.state.x).toEqual(player1.id);
            expect(game.state.o).toEqual(player2.id);

            game.leave(player1);

            expect(game.state.status).toEqual('OVER');
            expect(game.state.winner).toEqual(player2.id);
            expect(game.state.moves).toHaveLength(0);

            expect(game.state.x).toEqual(player1.id);
            expect(game.state.o).toEqual(player2.id);
          });
        });
      });
    });
    describe('applyMove', () => {
      describe('when given a valid move', () => {
        let player1: Player;
        let player2: Player;
        beforeEach(() => {
          player1 = createPlayerForTesting();
          player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
        });
        it('[T2.1] should add the move to the game state', () => {
          const move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(game.state.moves).toHaveLength(1);
          expect(game.state.moves[0]).toEqual(move);
          expect(game.state.status).toEqual('IN_PROGRESS');
        });
      });
    });
  });
  /**
   * This is where the tests i added start
   * I figured i didnt need comments to describe what the code is doing
   * because its pretty self explanitory
   */

  describe('[T1.3] _join', () => {
    it('does not allow a third player to join', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      expect(() => game.join(player3)).toThrow();
    });

    it('should automatically set the first player to X and the second player to O and update the game status', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      expect(player1.id).toEqual(game.state.x);
      expect(player2.id).toEqual(game.state.o);
      expect(game.state.status).toEqual('IN_PROGRESS');
    });
  });

  describe('[T1.4] _leave', () => {
    it('player x should win if player O leaves mid game', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.leave(player2);
      expect(game.state.winner).toEqual(player1.id);
    });
    it('player O should win if player X leaves mid game', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.leave(player1);
      expect(game.state.winner).toEqual(player2.id);
    });
    it('game status should be set to OVER if player O leaves mid game', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.leave(player2);
      expect(game.state.status).toEqual('OVER');
    });
    it('game status should be set to OVER if player X leaves mid game', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.leave(player1);
      expect(game.state.status).toEqual('OVER');
    });

    it('if player X leaves before the game starts, should update status to WAITING_TO_START and declare no winner', () => {
      const player1 = createPlayerForTesting();
      game.join(player1);
      game.leave(player1);
      expect(game.state.status).toEqual('WAITING_TO_START');
      expect(game.state.winner).toBeUndefined();
    });
  });

  describe('[T2.2] applyMove', () => {
    let player1: Player;
    let player2: Player;
    beforeEach(() => {
      player1 = createPlayerForTesting();
      player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
    });
    it('throws an error when player X goes twice in a row', () => {
      const move1: TicTacToeMove = { row: 1, col: 1, gamePiece: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move1,
      });
      const move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        }),
      ).toThrow();
    });
    it('throws an error when player O goes twice in a row', () => {
      const move1: TicTacToeMove = { row: 1, col: 1, gamePiece: 'O' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move1,
      });
      const move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        }),
      ).toThrow();
    });

    it('throws an error when player X goes in the same spot', () => {
      const move1: TicTacToeMove = { row: 1, col: 1, gamePiece: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move1,
      });
      const move2: TicTacToeMove = { row: 1, col: 0, gamePiece: 'O' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move2,
      });
      const move: TicTacToeMove = { row: 1, col: 1, gamePiece: 'X' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        }),
      ).toThrow();
    });
    it('throws an error when player O goes in the same spot', () => {
      const move1: TicTacToeMove = { row: 1, col: 1, gamePiece: 'O' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move1,
      });
      const move2: TicTacToeMove = { row: 1, col: 0, gamePiece: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move2,
      });
      const move: TicTacToeMove = { row: 1, col: 1, gamePiece: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        }),
      ).toThrow();
    });

    it('throws an error when player O goes twice in a row', () => {
      const move1: TicTacToeMove = { row: 1, col: 1, gamePiece: 'O' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move1,
      });
      const move: TicTacToeMove = { row: 1, col: 0, gamePiece: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        }),
      ).toThrow();
    });

    it('throws an error when player O goes on an X space', () => {
      const move1: TicTacToeMove = { row: 1, col: 1, gamePiece: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move1,
      });
      const move2: TicTacToeMove = { row: 1, col: 1, gamePiece: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        }),
      ).toThrow();
    });
    it('should rely on the player ID to determine whose turn it is when given an invalid move', () => {
      let move2: TicTacToeMove = { row: 1, col: 1, gamePiece: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        }),
      ).toThrow();

      const move1: TicTacToeMove = { row: 1, col: 1, gamePiece: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move1,
        }),
      ).not.toThrow();

      move2 = { row: 1, col: 2, gamePiece: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        }),
      ).not.toThrow();

      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        }),
      ).toThrow();

      describe('applyMove [T2.3]', () => {
        it('should throw an error if the move is out of turn for the player ID', () => {
          const playerX = createPlayerForTesting();
          const playerO = createPlayerForTesting();

          const oMove: TicTacToeMove = { row: 1, col: 1, gamePiece: 'O' };
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: playerO.id,
              move: oMove,
            }),
          ).toThrow();

          const xMove: TicTacToeMove = { row: 1, col: 1, gamePiece: 'X' };
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: playerX.id,
              move: xMove,
            }),
          ).not.toThrow();

          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: playerX.id,
              move: xMove,
            }),
          ).toThrow();
        });
      });
    });
  });
});
