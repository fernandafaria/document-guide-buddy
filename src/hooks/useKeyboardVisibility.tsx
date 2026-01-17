import { useEffect, useState } from 'react';

/**
 * Hook to detect keyboard visibility on mobile devices (especially iOS)
 * Adds/removes 'keyboard-open' class to document body for CSS adjustments
 */
export const useKeyboardVisibility = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // Store initial viewport height
    const initialHeight = window.visualViewport?.height || window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      // If viewport shrinks significantly, keyboard is likely open
      const heightDiff = initialHeight - currentHeight;
      const keyboardOpen = heightDiff > 150; // Threshold for keyboard detection

      setIsKeyboardOpen(keyboardOpen);

      if (keyboardOpen) {
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
    };

    // Use visualViewport API if available (better for iOS)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Also listen for focus/blur on input elements
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Small delay to allow viewport to adjust
        setTimeout(() => {
          setIsKeyboardOpen(true);
          document.body.classList.add('keyboard-open');
        }, 100);
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Small delay before removing class
        setTimeout(() => {
          const currentHeight = window.visualViewport?.height || window.innerHeight;
          const heightDiff = initialHeight - currentHeight;
          if (heightDiff <= 150) {
            setIsKeyboardOpen(false);
            document.body.classList.remove('keyboard-open');
          }
        }, 100);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      document.body.classList.remove('keyboard-open');
    };
  }, []);

  return isKeyboardOpen;
};
