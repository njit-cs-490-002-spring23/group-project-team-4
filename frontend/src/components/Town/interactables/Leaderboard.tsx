import React from 'react';
import { GameResult } from '../../../types/CoveyTownSocket';

/**
 * A component that renders a list of GameResult's as a leaderboard, formatted as a table with the following columns:
 * - Player: the name of the player
 * - Wins: the number of games the player has won
 * - Losses: the number of games the player has lost
 * - Ties: the number of games the player has tied
 * Each column has a header (a table header `th` element) with the name of the column.
 *
 *
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 *
 * @returns
 */
export default function Leaderboard({ results }: { results: GameResult[] }): JSX.Element {
  //TODO - implement this component (delete what's here first)
  return <>{results.length} results</>;
}
