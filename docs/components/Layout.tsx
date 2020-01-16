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
  currentPackage: string;
}

export const Layout: React.FC<Props> = ({ children, currentPackage }) => {
  // const rendered = useClientRendered();
  // const width = useWindowSize().width;

  return (
    <React.Fragment>
      <MainMenu currentPackage={currentPackage} />
      <Content>{children}</Content>
    </React.Fragment>
  );
};
