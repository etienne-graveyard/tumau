import React from 'react';
import { useMounted } from './useMounted';

export function useScrolledAfter(limit: number, defaultValue: boolean): boolean {
  const [isAfter, setIsAfter] = React.useState(defaultValue);
  const mounted = useMounted();

  const isAfterRef = React.useRef(isAfter);
  isAfterRef.current = isAfter;

  React.useEffect(() => {
    if (!mounted) {
      return;
    }
    setIsAfter(window.scrollY > limit);
    const onScroll = () => {
      const value = window.scrollY > limit;
      if (isAfterRef.current !== value) {
        setIsAfter(value);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [mounted, limit]);

  return isAfter;
}
