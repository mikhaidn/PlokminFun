/**
 * Pick a ball size that fits the current viewport for the given board, and
 * report whether we're on a touch-first (coarse-pointer) device.
 */
import { useEffect, useState } from 'react';

export interface Layout {
  cellSize: number;
  isTouch: boolean;
}

export function useResponsiveCell(columns: number, rows: number): Layout {
  const compute = (): Layout => {
    const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 360;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 640;
    // Reserve space for HUD/controls; the well takes at most ~70% height, ~90% width.
    const maxByWidth = (vw * 0.9) / columns;
    const maxByHeight = (vh * (isTouch ? 0.5 : 0.72)) / rows;
    const cellSize = Math.max(20, Math.min(46, Math.floor(Math.min(maxByWidth, maxByHeight))));
    return { cellSize, isTouch };
  };

  const [layout, setLayout] = useState<Layout>(compute);
  useEffect(() => {
    const onResize = (): void => setLayout(compute());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, rows]);

  return layout;
}
