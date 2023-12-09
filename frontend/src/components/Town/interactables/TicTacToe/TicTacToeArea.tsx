import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
  Button,
  Heading,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import Leaderboard from '../Leaderboard';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import BattleShipBoard from './TicTacToeBoard';
import BattleShipDefaultBoard from './BattleShipDefaultBoard';
import BattleShipXGuessBoard from './BattleShipXGuess';
import BattleShipXBoard from './TicTacToeBoard';
import BattleShipOGuessBoard from './BattleShipOGuess';
import BattleShipOBoard from './BattleShipOBoard';

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

function BattleShipArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
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
  const [currentShip, setCurrentShip] = useState('      ');

  /** Winner */
  useEffect(() => {
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
    <li
      key={Observer.id}
      style={{
        color: '#000000', // Dark text color for readability

        padding: '10px 20px', // Padding for space inside the item

        listStyleType: 'none', // Remove the default list bullet
        textAlign: 'center', // Center-align the text
        fontSize: '1rem', // Font size (adjust as needed)
        fontWeight: 'bold', // Font weight for emphasis
      }}>
      {Observer.userName}
    </li>
  ));
  // State variable to trigger component refresh
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Modified function to handle the join game process
  const handleJoinGame = async () => {
    try {
      await gameAreaController.joinGame();
      setRefreshFlag(prev => !prev); // Toggle the flag to refresh the component
    } catch (error) {
      winToast({
        description: 'Error on joining',
        status: 'error',
      });
    }
  };

  useEffect(() => {
    const stateListener = () => {
      const currentRef = ref.current;
      if (currentRef !== undefined) {
        setGameState(currentRef);
        setRefreshFlag(prev => !prev);
      }
    };
    gameAreaController.addListener('gameUpdated', stateListener);
    gameAreaController.addListener('gameEnd', stateListener);
    return () => {
      gameAreaController.removeListener('gameEnd', stateListener);
      gameAreaController.removeListener('gameUpdated', stateListener);
    };
  }, [gameAreaController, gameState, refreshFlag]);
  /** Winner */ // Include refreshFlag as a dependency

  if (
    gameAreaController.status === 'WAITING_TO_START' ||
    gameAreaController.status === 'OVER' ||
    gameAreaController.players.length < 2
  ) {
    joinButton = (
      <Button
        onClick={handleJoinGame}
        colorScheme='green'
        size='md'
        boxShadow='0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)'
        _hover={{
          bg: 'green.500',
          boxShadow: '0px 5px 10px -1px rgba(0, 0, 0, 0.3)',
        }}
        _active={{
          bg: 'green.600',
          transform: 'scale(0.98)',
          borderColor: 'green.700',
        }}>
        Join Game
      </Button>
    );
  }
  /**Display Ship */
  useEffect(() => {
    const ship = (controller: BattleShipAreaController) => {
      setCurrentShip(controller.Ship);
    };
    ship(gameAreaController);
  }, [gameAreaController, refreshFlag]);

  /** Determine Board to Display */
  const [currentBoard, setCurrentBoard] = useState(
    <BattleShipDefaultBoard gameAreaController={gameState} />,
  );
  const board = useCallback(
    (controller: BattleShipAreaController) => {
      if (controller.status === 'IN_PROGRESS') {
        if (townController.ourPlayer === controller.x && controller.Ship !== 'guess') {
          setCurrentBoard(<BattleShipXBoard gameAreaController={controller} />);
        } else if (townController.ourPlayer === controller.o && controller.Ship !== 'guess') {
          setCurrentBoard(<BattleShipOBoard gameAreaController={controller} />);
        }
        if (townController.ourPlayer === controller.x && controller.whoseTurn === controller.x) {
          setCurrentBoard(<BattleShipXGuessBoard gameAreaController={controller} />);
        } else if (
          townController.ourPlayer === controller.x &&
          controller.whoseTurn === controller.o
        ) {
          setCurrentBoard(<BattleShipXBoard gameAreaController={controller} />);
        }
        if (
          townController.ourPlayer === controller.o &&
          controller.whoseTurn === gameAreaController.o
        ) {
          setCurrentBoard(<BattleShipOGuessBoard gameAreaController={controller} />);
        } else if (
          townController.ourPlayer === controller.o &&
          controller.whoseTurn === controller.x
        ) {
          setCurrentBoard(<BattleShipOBoard gameAreaController={controller} />);
        }
      } else {
        setCurrentBoard(<BattleShipDefaultBoard gameAreaController={controller} />);
      }
    },
    [gameAreaController, townController.ourPlayer],
  );
  useEffect(() => {
    board(gameState);
  }, [gameAreaController, gameState, townController.ourPlayer, refreshFlag, board]);
  /** Player List */
  useEffect(() => {
    const determinePlayers = (controller: BattleShipAreaController) => {
      if (controller.x && controller.o) {
        setPlayerX(controller.x.userName);
        setPlayerO(controller.o.userName);
      } else if (controller.x && !controller.o) {
        setPlayerX(controller.x.userName);
        setPlayerO('is not in game');
      } else if (!controller.x && controller.o) {
        setPlayerX('is not in game');
        setPlayerO(controller.o.userName);
      } else {
        setPlayerX('is not in game');
        setPlayerO('is not in game');
      }
    };
    determinePlayers(gameState);
  }, [gameAreaController, gameState, playerO, playerX, refreshFlag]);
  /** Game status */
  useEffect(() => {
    const determineStatusMsg = (controller: BattleShipAreaController) => {
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
  }, [gameAreaController, townController.ourPlayer, statusMsg, gameState, refreshFlag]);
  // TODO - implement this component
  return (
    <>
      <Leaderboard results={gameState.history} />
      <div>{currentShip}</div>
      {currentBoard}

      <h1
        style={{
          textAlign: 'center',
          color: '#4299e1', // blue
          margin: '0', // Remove default margin
          padding: '20px', // Add some padding
          fontSize: '2rem', // Increase font size
          fontWeight: 'bold', // Make the font bold
          fontFamily: 'Arial, sans-serif', // Set a specific font (optional)
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)', // Optional: Add a subtle text shadow for depth
        }}>
        {statusMsg}
      </h1>

      {joinButton}
      <p
        style={{
          color: '#000000', // Dark orange text
          padding: '10px 20px', // Padding for spacing
          margin: '2px 0', // Margin for spacing between list items

          textAlign: 'center', // Center-align the text
          listStyleType: 'none', // Remove the default list bullet
        }}>
        Observers:
      </p>
      <ul aria-label='list of observers in the game'>{observersList}</ul>
      <ul aria-label='list of players in the game'>
        <li
          key={'x'}
          style={{
            color: '#FF8C00', // Dark orange text
            padding: '10px 20px', // Padding for spacing
            margin: '2px 0', // Margin for spacing between list items

            textAlign: 'left', // Center-align the text
            listStyleType: 'none', // Remove the default list bullet
          }}>
          {'Player 1 ' + playerX}
        </li>

        <li
          key={'o'} // Updated key for uniqueness
          style={{
            color: '#FF8C00', // Dark orange text
            padding: '10px 20px', // Padding for spacing
            margin: '2px 0', // Margin for spacing between list items

            textAlign: 'left', // Center-align the text
            listStyleType: 'none', // Remove the default list bullet
          }}>
          {'Player 2 ' + playerO}
        </li>
      </ul>
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

  if (gameArea && gameArea.getData('type') === 'BattleShip') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent style={{ textAlign: 'center', color: 'green', fontSize: '16px' }}>
          <ModalHeader style={{ textAlign: 'center', color: 'darkblue', fontSize: '50px' }}>
            {gameArea.name}
          </ModalHeader>
          <ModalCloseButton />
          <BattleShipArea interactableID={gameArea.name} />
        </ModalContent>
      </Modal>
    );
  }

  return <></>;
}
