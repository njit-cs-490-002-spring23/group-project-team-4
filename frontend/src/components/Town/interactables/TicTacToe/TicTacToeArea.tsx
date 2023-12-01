import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import TicTacToeAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import TicTacToeBoard from './TicTacToeBoard';
import Leaderboard from '../Leaderboard';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import BattleShipBoard from './TicTacToeBoard';

/**
 * The TicTacToeArea component renders the TicTacToe game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the TicTacToeAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A leaderboard (@see Leaderboard.tsx), which is passed the game history as a prop
 * - A list of observers' usernames (in a list with the aria-label 'list of observers in the game', one username per-listitem)
 * - A list of players' usernames (in a list with the aria-label 'list of players in the game', one item for X and one for O)
 *    - If there is no player in the game, the username is '(No player yet!)'
 *    - List the players as (exactly) `X: ${username}` and `O: ${username}`
 * - A message indicating the current game status:
 *    - If the game is in progress, the message is 'Game in progress, {moveCount} moves in, currently {whoseTurn}'s turn'. If it is currently our player's turn, the message is 'Game in progress, {moveCount} moves in, currently your turn'
 *    - Otherwise the message is 'Game {not yet started | over}.'
 * - If the game is in status WAITING_TO_START or OVER, a button to join the game is displayed, with the text 'Join New Game'
 *    - Clicking the button calls the joinGame method on the gameAreaController
 *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 * - The TicTacToeBoard component, which is passed the current gameAreaController as a prop (@see TicTacToeBoard.tsx)
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Tie: description 'Game ended in a tie'
 *    - Our player won: description 'You won!'
 *    - Our player lost: description 'You lost :('
 *
 */
function TicTacToeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  let joinButton;
  const winToast = useToast();
  const townController = useTownController();
  const [gameState, setGameState] = useState(gameAreaController);
  const [winDescription, setWinDescription] = useState(' ');
  const ref = useRef<BattleShipAreaController>(gameAreaController);
  const [statusMsg, setStatusMsg] = useState('');
  const [playerO, setPlayerO] = useState('  ');
  const [playerX, setPlayerX] = useState('   ');
  useEffect(() => {
    const stateListener = () => {
      const currentRef = ref.current;
      if (currentRef !== undefined && currentRef.moveCount > gameState.moveCount) {
        setGameState(currentRef);
      }
    };
    gameAreaController.addListener('gameUpdated', stateListener);
    gameAreaController.addListener('gameEnd', stateListener);
    return () => {
      gameAreaController.removeListener('gameEnd', stateListener);
      gameAreaController.removeListener('gameUpdated', stateListener);
    };
  }, [gameAreaController, gameState]);
  /** Winner */
  /*useEffect(() => {
    if (gameState.status === 'OVER' && !gameState.winner) {
      setWinDescription('Game ended in a tie');
    } else if (gameState.status === 'OVER' && gameState.winner === townController.ourPlayer) {
      setWinDescription('You won!');
    } else if (gameState.status === 'OVER') {
      setWinDescription('You lost :(');
    }
    winToast({
      description: winDescription,
    });
  }, [winDescription, gameState, townController.ourPlayer, winToast]);
  /** Observers List*/
  const observersList = gameAreaController.observers.map(Observer => (
    <li key={Observer.id}> {Observer.userName} </li>
  ));
  /** Join Game Button */
  if (gameAreaController.status === 'WAITING_TO_START' || gameAreaController.status === 'OVER') {
    joinButton = <button onClick={() => gameAreaController.joinGame()}>JoinGame</button>;
  }
  /** Player List */
  function PlayerList(controller: BattleShipAreaController){
    useEffect(() => {
      const determinePlayers = (c: BattleShipAreaController) => {
        if (c.x && c.o) {
          setPlayerX(c.x.userName);
          setPlayerO(c.o.userName);
        } else if (c.x && !c.o) {
          setPlayerX(c.x.userName);
          setPlayerO('(No player yet!)');
        } else if (!c.x && c.o) {
          setPlayerX('(No player yet!)');
          setPlayerO(c.o.userName);
        } else {
          setPlayerX('(No player yet!)');
          setPlayerO('(No player yet!)');
        }
      };
      determinePlayers(controller);
    }, [controller]);
    return (
      <>
        <h1>{controller.x?.userName}</h1>
        <h1>{controller.o?.userName}</h1>
      </>
    );
  }

  function renderBoard(controller: BattleShipAreaController){
    if (controller.status === 'IN_PROGRESS') {
      return <TicTacToeBoard gameAreaController={controller}/>;
    } else {
      return <></>;
    }
  }

  /** Game status */
  /*useEffect(() => {
    const determineStatusMsg = (controller: TicTacToeAreaController) => {
      if (controller.status === 'WAITING_TO_START') {
        setStatusMsg('Game not yet started.');
      } else if (
        controller.status === 'IN_PROGRESS' &&
        townController.ourPlayer !== controller.whoseTurn
      ) {
        setStatusMsg(
          `Game in progress, ${controller.moveCount} moves in, currently ${controller.whoseTurn?.userName}'s turn`,
        );
      } else if (
        controller.status === 'IN_PROGRESS' &&
        townController.ourPlayer === controller.whoseTurn
      ) {
        setStatusMsg(`Game in progress, ${controller.moveCount} moves in, currently your turn`);
      } else if (controller.status === 'OVER') {
        setStatusMsg('Game over.');
      }
    };
    determineStatusMsg(gameState);
  }, [gameAreaController, townController.ourPlayer, statusMsg, gameState]);*/
  const oModal = false;
  const openModal = useRef<boolean>(oModal);
  useEffect(() => {
    if (gameAreaController.status === 'IN_PROGRESS') {
      openModal.current = true;
    } else {
      openModal.current = false;
    }
  }, [gameAreaController]);

  const closeModal = useCallback(() => {
    if (gameAreaController) {
      gameAreaController.leaveGame();
    }
  }, [gameAreaController]);
  return (
    <>
      <>
        <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
          <ModalContent>
            <ModalHeader>{PlayerList(gameAreaController)}</ModalHeader>
            <ModalCloseButton />
            <div>{joinButton}</div>
            <div>{renderBoard(gameAreaController)}</div>
          </ModalContent>
        </Modal>
      </>
    </>
  );
}

// Do not edit below this line
/**
 * A wrapper component for the TicTacToeArea component.
 * Determines if the player is currently in a tic tac toe area on the map, and if so,
 * renders the TicTacToeArea component in a modal.
 *
 */
export default function TicTacToeAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'TicTacToe') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <TicTacToeArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
