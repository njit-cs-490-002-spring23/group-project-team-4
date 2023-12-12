import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import {
  BattleShip,
  BattleShipGridPosition,
  BattleShipMove,
  GameState,
} from '../../types/CoveyTownSocket';
import BattleShipGame from './BattleShipGame';

import InvalidParametersError from '../../lib/InvalidParametersError';
import MOVE_NOT_YOUR_TURN_MESSAGE from '../../lib/InvalidParametersError'

describe('BattleShipGame', () => {
  let game: BattleShipGame;

  beforeEach(() => {
    game = new BattleShipGame();
  });

  describe('[T1.1] _join', () => {
    describe('When the player can be added', () => {
      it('makes the first player X and initializes the state with status WAITING_TO_START', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.x).toEqual(player.id);
        expect(game.state.o).toBeUndefined();
        expect(game.state.moves).toHaveLength(0);
        expect(game.state.x_board).toEqual([]);
        expect(game.state.o_board).toEqual([]);
        expect(game.state.x_ships).toEqual([
          
          'carrier',
          'battleship',
          'criuser',
          'submarine',
          'destroyer',
        ]);
        expect(game.state.o_ships).toEqual([
          'carrier',
          'battleship',
          'criuser',
          'submarine',
          'destroyer',
        ]);
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
            expect(game.state.status).toEqual('IN_PROGRESS');
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
          const move1: BattleShipMove = {row: 1, col: 1, shiptype: "battleship", player: 'X'};
          const move2: BattleShipMove = {row: 1, col: 1, shiptype: "battleship", player: 'O'};
          const move3: BattleShipMove = {row: 2, col: 1, shiptype: "carrier", player: 'X'};
          const move4: BattleShipMove = {row: 2, col: 1, shiptype: "carrier", player: 'O'};
          const move5: BattleShipMove = {row: 3, col: 1, shiptype: "criuser", player: 'X'};
          const move6: BattleShipMove = {row: 3, col: 1, shiptype: "criuser", player: 'O'};
          const move7: BattleShipMove = {row: 4, col: 1, shiptype: "submarine", player: 'X'};
          const move8: BattleShipMove = {row: 4, col: 1, shiptype: "submarine", player: 'O'};
          const move9: BattleShipMove = {row: 5, col: 1, shiptype: "destroyer", player: 'X'};
          const move10: BattleShipMove = {row: 5, col: 1, shiptype: "destroyer", player: 'O'};
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: move1,
          });
          game.applyMove({
            gameID: game.id,
           playerID: player2.id,
           move: move2,
           });
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: move3,
          });
          game.applyMove({
            gameID: game.id,
           playerID: player2.id,
           move: move4,
      });
          game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move5,
      });
          game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move6,
      });
          game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move7,
      });
          game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move8,
      });
          game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move9,
      });
          game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move10,
      });

        });
        it('[T2.1] should correctly handle a ship placement move', () => {
          const plmove: BattleShipMove = { row: 2, col: 3, shiptype: 'guess', player: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: plmove,
          });
          const pl2move: BattleShipMove = { row: 1, col: 1, shiptype: 'battleship', player: 'X' };
          expect(game.state.moves).toHaveLength(1);
          expect(game.state.x_board[0]).toEqual(pl2move);
         // expect(game.state.o_board).toEqual([]);
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
      expect(() => game.join(player3)).toThrow('Game is full');
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

  describe('[T2.2] applyMove(guess move)', () => {
    let player1: Player;
    let player2: Player;
    beforeEach(() => {
      player1 = createPlayerForTesting();
      player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      const move1: BattleShipMove = {row: 1, col: 1, shiptype: "battleship", player: 'X'};
      const move2: BattleShipMove = {row: 1, col: 1, shiptype: "battleship", player: 'O'};
      const move3: BattleShipMove = {row: 2, col: 1, shiptype: "carrier", player: 'X'};
      const move4: BattleShipMove = {row: 2, col: 1, shiptype: "carrier", player: 'O'};
      const move5: BattleShipMove = {row: 3, col: 1, shiptype: "criuser", player: 'X'};
      const move6: BattleShipMove = {row: 3, col: 1, shiptype: "criuser", player: 'O'};
      const move7: BattleShipMove = {row: 4, col: 1, shiptype: "submarine", player: 'X'};
      const move8: BattleShipMove = {row: 4, col: 1, shiptype: "submarine", player: 'O'};
      const move9: BattleShipMove = {row: 5, col: 1, shiptype: "destroyer", player: 'X'};
      const move10: BattleShipMove = {row: 5, col: 1, shiptype: "destroyer", player: 'O'};
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move1,
      });
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move2,
      });
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move3,
      });
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move4,
      });
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move5,
      });
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move6,
      });
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move7,
      });
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move8,
      });
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move9,
      });
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move10,
      });
      // placeShipsForPlayer(player1, player1.id);
      // placeShipsForPlayer(player2, player2.id);
    });

    it('throws an error when player X goes twice in a row', () => {
      const move1: BattleShipMove = { row: 9, col: 8, shiptype: 'guess', player: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move1,
      });
      const move: BattleShipMove = { row: 9, col: 9, shiptype: 'guess', player: 'X' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        }),
      ).toThrow();
    });

    it('throws an error when player O goes twice in a row', () => {
      const move1: BattleShipMove = { row: 1, col: 9, shiptype: 'guess', player: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move1,
      });
      const move3: BattleShipMove = { row: 9, col: 8, shiptype: 'guess', player: 'O' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move3,
      });
      const move: BattleShipMove = { row: 9, col: 9, shiptype: 'guess', player: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        }),
      ).toThrow();
    });

    it('throws an error when player X goes in the same spot', () => {
      const move1: BattleShipMove = { row: 1, col: 9, shiptype: 'guess', player: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move1,
      });
      const move2: BattleShipMove = { row: 1, col: 0, shiptype: 'guess', player: 'O' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move2,
      });
      
      const move: BattleShipMove = { row: 1, col: 9, shiptype: 'guess', player: 'X' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        }),
      ).toThrow();
    });
    it('throws an error when player O goes in the same spot', () => {
      const move0: BattleShipMove = { row: 9, col: 9, shiptype: 'guess', player: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move0,
      });
      const move1: BattleShipMove = { row: 1, col: 9, shiptype: 'guess', player: 'O' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move1,
      });
      const move2: BattleShipMove = { row: 9, col: 8, shiptype: 'guess', player: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player1.id,
        move: move2,
      });
      const move: BattleShipMove = { row: 1, col: 9, shiptype: 'guess', player: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        }),
      ).toThrow();
    });

    it('throws an error when player O goes twice in a row', () => {
      const move0: BattleShipMove = { row: 9, col: 9, shiptype: 'guess', player: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move0,
      });
      const move1: BattleShipMove = { row: 8, col: 8, shiptype: 'guess', player: 'O' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move1,
      });
      const move: BattleShipMove = { row: 1, col: 0, shiptype: 'guess', player: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move,
        }),
      ).toThrow();
    });

    it('should rely on the player ID to determine whose turn it is when given an invalid move', () => {
      const move0: BattleShipMove = { row: 9, col: 9, shiptype: 'guess', player: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move0,
      });
      let move2: BattleShipMove = { row: 1, col: 1, shiptype: 'guess', player: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        }),
      ).not.toThrow();

      const move1: BattleShipMove = { row: 9, col: 1, shiptype: 'guess', player: 'O' };
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move1,
        }),
      ).not.toThrow();

      const move10: BattleShipMove = { row: 7, col: 7, shiptype: 'guess', player: 'X' };
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: move10,
      });
      move2 = { row: 1, col: 2, shiptype: 'guess', player: 'O' };
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

    });
  });
});
