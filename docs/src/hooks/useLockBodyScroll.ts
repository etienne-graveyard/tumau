import React from 'react';

export function useLockBodyScroll(active: boolean): void {
  React.useLayoutEffect(() => {
    if (active === false) {
      return;
    }
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [active]); // Empty array ensures effect is only run on mount and unmount
}
