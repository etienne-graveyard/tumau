import React from 'react';
import { ResizeObserver } from '@juggle/resize-observer';

export interface Size {
  width: number | undefined;
  height: number | undefined;
}

export function useComponentSize(ref: React.MutableRefObject<HTMLElement | undefined>): Size {
  const [size, setSize] = React.useState<Size>({
    width: undefined,
    height: undefined,
  });
  const [elem, setElem] = React.useState<HTMLElement | undefined>(undefined);

  // If's ok because we just sync
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (ref.current !== elem) {
      setElem(ref.current);
    }
  });

  const handleResize = React.useCallback(
    function handleResize() {
      if (elem) {
        setSize({
          width: elem.offsetWidth,
          height: elem.offsetHeight,
        });
      }
    },
    [elem]
  );

  React.useEffect(() => {
    if (!elem) {
      return;
    }

    handleResize();

    let resizeObserver = new ResizeObserver(function () {
      handleResize();
    });
    resizeObserver.observe(elem);

    return function () {
      resizeObserver.disconnect();
      resizeObserver = null as any;
    };
  }, [handleResize, elem]);

  return size;
}
