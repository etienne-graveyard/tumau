import React from 'react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface Props {
  active: boolean;
}

export const LockBodyScroll: React.FC<Props> = ({ active }) => {
  useLockBodyScroll(active);
  return null;
};
