import React, { useEffect, useRef, useState } from 'react';
import { useBoardContext } from '../contexts';

const PROGRESS_MIN = 20;
const PROGRESS_ACTIVE = 80;
const COMPLETE_DELAY = 250;
const RESET_DELAY = 150;

export const BoardChangeProgressBar: React.FC = () => {
  const { isBoardLoading, theme } = useBoardContext();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (isBoardLoading) {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
        resetTimeout.current = null;
      }

      setVisible(true);
      setProgress(PROGRESS_MIN);

      const animationFrame = requestAnimationFrame(() => {
        setProgress(PROGRESS_ACTIVE);
      });

      return () => cancelAnimationFrame(animationFrame);
    }

    if (!visible) return;

    setProgress(100);
    hideTimeout.current = setTimeout(() => {
      setVisible(false);
      resetTimeout.current = setTimeout(() => {
        setProgress(0);
      }, RESET_DELAY);
    }, COMPLETE_DELAY);

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
        resetTimeout.current = null;
      }
    };
  }, [isBoardLoading, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        background: 'transparent',
        zIndex: 1200,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: theme.secondaryColor,
          boxShadow: '0 0 12px rgba(0, 0, 0, 0.15)',
          transition: 'width 0.3s ease, opacity 0.3s ease',
        }}
      />
    </div>
  );
};

export default BoardChangeProgressBar;
