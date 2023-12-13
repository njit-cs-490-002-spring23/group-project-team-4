import {
  ConversationArea,
  Interactable,
  ViewingArea,
  GameArea,
  BattleShipGameState,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

export function isBattleShipArea(
  interactable: Interactable,
): interactable is GameArea<BattleShipGameState> {
  return interactable.type === 'BattleShipArea';
}
