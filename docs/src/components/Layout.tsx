import React from 'react';
import { MainMenu } from './MainMenu';
import styled from 'styled-components';
import { PRIMARY_WIDTH, MOBILE_MENU_MQ } from '../style/constants';

const Content = styled.main({
  marginLeft: PRIMARY_WIDTH,
  padding: '1rem',
  paddingLeft: '2rem',
  maxWidth: 800,
  [MOBILE_MENU_MQ]: {
    marginLeft: 0,
    padding: '1rem',
  },
});

interface Props {
  secondaryNav?: number;
  currentPage: string | null;
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
