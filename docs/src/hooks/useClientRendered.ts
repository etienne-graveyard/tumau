import React from 'react';

export function useClientRendered(): boolean {
  const [rendered, setRendered] = React.useState(false);

  React.useEffect(() => {
    setRendered(true);
  }, []);

  return rendered;
}
