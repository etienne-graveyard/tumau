import styled from 'styled-components';
import React from 'react';
import PACKAGES from '../data/packages.json';
import Link from 'next/link';
import { PRIMARY_WIDTH } from '../style/constants';
import { MainMenuItem } from './MainMenuItem';

const Wrapper = styled.nav({
  background: '#072231',
  position: 'fixed',
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
  currentPackage: string;
}

export const MainMenu: React.FC<Props> = ({ currentPackage }) => {
  return (
    <Wrapper>
      <Items>
        <MainMenuItem active={currentPackage === 'tumau'}>
          <Link href="/" as={`/`}>
            <a>Tumau</a>
          </Link>
        </MainMenuItem>
        {PACKAGES.map(p => (
          <MainMenuItem active={currentPackage === p.slug} key={p.slug}>
            <Link href="/package/[slug]" as={`/package/${p.slug}`}>
              <a>{p.name}</a>
            </Link>
          </MainMenuItem>
        ))}
      </Items>
    </Wrapper>
  );
};
