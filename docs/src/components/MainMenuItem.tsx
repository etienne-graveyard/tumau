import styled from 'styled-components';
import React from 'react';
import { MOBILE_MENU_MQ } from '../style/constants';

const Item = styled.li<{ isActive: boolean; isOdd: boolean }>(props => ({
  color: 'white',
  cursor: 'pointer',
  listStyle: 'none',
  fontSize: '1.3rem',
  margin: 0,
  padding: 0,
  paddingLeft: props.isActive ? '1.5rem' : 0,
  transitionDuration: '0.2s',
  position: 'relative',
  [MOBILE_MENU_MQ]: {
    backgroundColor: props.isOdd ? `rgba(0, 0, 0, 0.2)` : 'transparent',
  },
  '& a': {
    display: 'block',
    color: 'inherit',
    textDecoration: 'none',
    padding: '0.7rem 1rem',
  },
  '&:hover': {
    background: '#fcbd09',
    color: '#072231',
    fontWeight: 600,
  },
  '&:before': {
    transitionDuration: '0.2s',
    position: 'absolute',
    content: '""',
    width: 10,
    height: 10,
    background: '#fcbd09',
    borderRadius: 10,
    left: 0,
    top: '50%',
    transform: props.isActive ? `translate(1.2rem, -50%)` : `translate(-100px, -50%)`,
  },
  '&:hover:before': {
    background: '#072231',
  },
}));

interface Props {
  active: boolean;
  odd: boolean;
}

export const MainMenuItem: React.FC<Props> = ({ active, children, odd }) => {
  return (
    <Item isActive={active} isOdd={odd}>
      {children}
    </Item>
  );
};
