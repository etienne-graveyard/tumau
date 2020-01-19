import styled from 'styled-components';
import React from 'react';
import { PAGES } from '../data/pages';
import Link from 'next/link';
import { PRIMARY_WIDTH } from '../style/constants';
import { MainMenuItem } from './MainMenuItem';

const Wrapper = styled.nav({
  background: '#072231',
  position: 'fixed',
  zIndex: 500,
  top: 0,
  bottom: 0,
  left: 0,
  width: PRIMARY_WIDTH,
  color: 'white',
  paddingTop: '1rem',
});

const Items = styled.ul({
  padding: 0,
  margin: 0,
});

interface Props {
  currentPage: string;
}

export const MainMenu: React.FC<Props> = ({ currentPage }) => {
  return (
    <Wrapper>
      <Items>
        {PAGES.map(p => {
          return (
            <MainMenuItem active={currentPage === p.slug} key={p.slug}>
              <Link href={p.page} as={p.slug}>
                <a>{p.name}</a>
              </Link>
            </MainMenuItem>
          );
        })}
      </Items>
    </Wrapper>
  );
};
