import { Button, chakra, Container, Grid } from '@chakra-ui/react';
import React, { useState, useEffect, useRef } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { BattleShipGridPosition } from '../../../../types/CoveyTownSocket';

export type BattleShipGameProps = {
  gameAreaController: BattleShipAreaController;
};

const StyledBattleShipSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '10%',
    width: '10%', // Each square now takes up 10% of the grid space
    height: '90%',
    border: '3px solid #2b6cb0', // Changed to a complementary blue border color
    backgroundColor: '#4299e1', // Nice shade of blue for the background
    color: 'white', // White text color for better readability
    fontSize: '20px', // Adjust font size for smaller cells
    _disabled: {
      backgroundColor: '#bee3f8', // Lighter blue when disabled
      color: 'black', // Change text color for disabled state
      opacity: '100%',
    },
    _hover: {
      backgroundColor: '#3182ce', // Slightly darker blue on hover
    },
    _active: {
      backgroundColor: '#2b6cb0', // Even darker blue when active
    },
  },
});

/**
 * A component that will render the Battleship board, styled
 */
const StyledBattleShipBoard = chakra(Container, {
  baseStyle: {
    display: 'grid',
    backgroundColor: '#B3DFFC', // Nice shade of blue for the background
    gridTemplateColumns: 'repeat(10, 1fr)', // 10 columns for the 10x10 grid
    gridTemplateRows: 'repeat(10, 1fr)', // Also define the rows explicitly for a 10x10 grid
    gap: 0,
    width: '450px',
    height: '500px',
    padding: '5px',
    border: '3px solid black', // Add a border around the entire board
    borderRadius: '10px', // Optionally, add rounded corners
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', // Optional: add a shadow for a 3D effect
    // Remove flexWrap, not needed for grid
  },
});

/**
 * A component that renders the Battleship board
 */
export default function BattleShipBoard({ gameAreaController }: BattleShipGameProps): JSX.Element {
  const makeBattleShipMove = async (row: BattleShipGridPosition, col: BattleShipGridPosition) => {
    try {
      await gameAreaController.makeMove(row, col, gameAreaController.Ship);
    } catch (error) {}
  };

  const renderSquare = (rowIndex: BattleShipGridPosition, colIndex: BattleShipGridPosition) => (
    <StyledBattleShipSquare
      key={`${rowIndex}-${colIndex}`}
      aria-label={`Cell ${rowIndex},${colIndex}`}
      onClick={() => makeBattleShipMove(rowIndex, colIndex)}>
      {gameAreaController.board[rowIndex][colIndex]}
    </StyledBattleShipSquare>
  );

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        rows.push(renderSquare(i, j));
      }
    }
    return rows;
  };

  return (
    <StyledBattleShipBoard aria-label='Battleship Board'>{renderRows()}</StyledBattleShipBoard>
  );
}
