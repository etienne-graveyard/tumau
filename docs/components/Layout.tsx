import React from 'react';
// import { useWindowSize } from '../hooks/useWindowSize';
// import { useClientRendered } from '../hooks/useClientRendered';
import { MainMenu } from './MainMenu';
import styled from 'styled-components';
import { PRIMARY_WIDTH } from '../style/constants';

const Content = styled.main({
  marginLeft: PRIMARY_WIDTH,
  padding: '1rem',
  maxWidth: 800,
});

interface Props {
  secondaryNav?: number;
  currentPage: string;
}

export const Layout: React.FC<Props> = ({ children, currentPage }) => {
  // const rendered = useClientRendered();
  // const width = useWindowSize().width;

  return (
    <React.Fragment>
      <MainMenu currentPage={currentPage} />
      <Content>{children}</Content>
    </React.Fragment>
  );
};
