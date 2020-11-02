import React from 'react';

interface MenuToggle {
  visible: boolean;
  hide: () => void;
  show: () => void;
}

export function useMenuToggleState(): MenuToggle {
  const [show, setShow] = React.useState(false);

  const context = React.useMemo<MenuToggle>(
    () => ({ visible: show, hide: () => setShow(false), show: () => setShow(true) }),
    [show, setShow]
  );
  return context;
}

const ShowMenuContext = React.createContext<MenuToggle | null>(null);

export const MenuToggleProvider: React.FC<{ ctx: MenuToggle }> = ({ children, ctx }) => {
  return <ShowMenuContext.Provider value={ctx}>{children}</ShowMenuContext.Provider>;
};

export const useMenuToggle = (): MenuToggle => {
  const ctx = React.useContext(ShowMenuContext);
  if (!ctx) {
    throw new Error('Missing context');
  }
  return ctx;
};
