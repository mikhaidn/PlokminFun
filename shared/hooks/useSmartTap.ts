/**
 * useSmartTap hook
 * RFC-005 Phase 3 Week 7: Smart tap-to-move feature
 *
 * Smart tap behavior:
 * - Traditional mode (smartTapToMove = false):
 *   Click card → highlights valid destinations → click destination
 *
 * - Smart mode (smartTapToMove = true):
 *   Click card → if 1 valid move, auto-execute
 *   Click card → if multiple valid moves, highlight options
 *   Click card → if 0 valid moves, provide feedback
 */

import { useSettings, type GameLocation } from '@plokmin/shared';

export type SmartTapAction =
  | { action: 'select'; location: GameLocation }
  | { action: 'invalid'; location: GameLocation }
  | { action: 'auto-move'; from: GameLocation; to: GameLocation }
  | { action: 'highlight'; location: GameLocation; options: GameLocation[] };

/**
 * Hook to handle smart tap-to-move logic
 * Respects user settings for traditional vs smart mode
 *
 * @param getValidMoves - Function that returns valid destinations for a location
 * @returns handleTap function and smartTapEnabled flag
 *
 * Example:
 * ```tsx
 * const { handleTap, smartTapEnabled } = useSmartTap((from) => {
 *   // Return array of valid destination GameLocations
 *   return findValidMoves(gameState, from);
 * });
 *
 * // In click handler
 * const result = handleTap(clickedLocation);
 * if (result.action === 'auto-move') {
 *   executeMove(result.from, result.to);
 * } else if (result.action === 'select') {
 *   // Traditional select behavior
 * }
 * ```
 */
export function useSmartTap(getValidMoves: (from: GameLocation) => GameLocation[]) {
  const { settings } = useSettings();

  const handleTap = (location: GameLocation): SmartTapAction => {
    if (!settings.smartTapToMove) {
      // Traditional mode: just select the card
      return { action: 'select', location };
    }

    // Smart tap mode: check valid moves
    const validMoves = getValidMoves(location);

    if (validMoves.length === 0) {
      // No valid moves - provide feedback
      return { action: 'invalid', location };
    } else if (validMoves.length === 1) {
      // Only one valid move - auto-execute
      return { action: 'auto-move', from: location, to: validMoves[0] };
    } else {
      // Multiple moves - highlight options
      return { action: 'highlight', location, options: validMoves };
    }
  };

  return {
    handleTap,
    smartTapEnabled: settings.smartTapToMove,
  };
}
