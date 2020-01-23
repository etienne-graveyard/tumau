import React from 'react';
import { useMounted } from './useMounted';

export function useMedia(query: string, defaultValue: boolean): boolean {
  const mounted = useMounted();
  // State and setter for matched value
  const [value, setValue] = React.useState(defaultValue);

  // Array containing a media query list for each query
  const mq = React.useMemo(() => {
    return !mounted ? null : window.matchMedia(query);
  }, [mounted, query]);

  const mqRef = React.useRef(mq);
  mqRef.current = mq;

  React.useEffect(() => {
    if (mounted && mqRef.current) {
      setValue(mqRef.current.matches);
    }
  }, [mounted]);

  React.useEffect(() => {
    if (!mq) {
      return;
    }
    const handler = () => setValue(mq.matches);
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [mq]);

  return value;
}
