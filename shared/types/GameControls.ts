/**
 * Common types for game control components
 */

export interface GameControlsProps {
  // Game state
  moves: number;
  seed?: number;

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;

  // Game actions
  onReset: () => void;
  onNewGame: () => void;

  // Optional features
  showSettings?: boolean;
  onSettings?: () => void;
  showHelp?: boolean;
  onHelp?: () => void;
  showHints?: boolean;
  hintsEnabled?: boolean;
  onToggleHints?: () => void;
  showAutoComplete?: boolean;
  onAutoComplete?: () => void;

  // Styling options
  isMobile?: boolean;
  isTablet?: boolean;
  minButtonHeight?: number;
  buttonPadding?: string;
  fontSize?: number;
  buttonsAtBottom?: boolean;
}
