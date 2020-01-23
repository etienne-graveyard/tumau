import styled from 'styled-components';
import React from 'react';
import { PAGES } from '../data/pages';
import Link from 'next/link';
import { PRIMARY_WIDTH, MOBILE_MENU_MQ, DESKTOP_MENU_MQ, MOBILE_MENU_QUERY } from '../style/constants';
import { MainMenuItem } from './MainMenuItem';
import { PackageName } from './PackageName';
import { CloseIcon } from './CloseIcon';
import { useMenuToggle } from './MenuToggleProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedia } from '../hooks/useMedia';
import { MenuIcon } from './MenuIcon';
import { useMounted } from '../hooks/useMounted';
import { LockBodyScroll } from './LockBodyScroll';
import { useScrolledAfter } from '../hooks/useScrolledAfter';
import Scrollbars from 'react-scrollbars-custom';
import { useWindowSize } from '../hooks/useWindowSize';
import { useComponentSize } from '../hooks/useComponentSize';

const Wrapper = styled(motion.nav)({
  background: '#072231',
  position: 'fixed',
  zIndex: 500,
  top: 0,
  bottom: 0,
  left: 0,
  overflow: 'hidden',
  width: PRIMARY_WIDTH,
  color: 'white',
  [MOBILE_MENU_MQ]: {
    top: '1rem',
    right: '1rem',
    left: '1rem',
    bottom: 'auto',
    width: 'auto',
    paddingTop: 0,
    borderRadius: 10,
    boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
  },
});

const Items = styled.ul({
  padding: 0,
  margin: 0,
  paddingTop: '1rem',
  paddingBottom: '1rem',
  [MOBILE_MENU_MQ]: {
    paddingBottom: '1rem',
  },
});

const CloseWrapper = styled.div({
  color: 'white',
  display: 'flex',
  flexDirection: 'row-reverse',
  padding: '1rem',
  [DESKTOP_MENU_MQ]: {
    display: 'none',
  },
});

const TopbarWrapper = styled(motion.div)({
  padding: '1rem',
  background: '#072231',
  borderRadius: 10,
  color: 'white',
  display: 'flex',
  margin: '1rem',
  marginBottom: 0,
  position: 'sticky',
  top: '1rem',
  zIndex: 200,
  flexDirection: 'row-reverse',
  [DESKTOP_MENU_MQ]: {
    display: 'none',
  },
});

const IconButton = styled.button({
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  padding: 0,
  margin: 0,
  display: 'flex',
});

const Overlay = styled(motion.div)({
  position: 'fixed',
  zIndex: 450,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(255, 255, 255, 0.5)',
});

interface Props {
  currentPage: string | null;
}

export const MainMenu: React.FC<Props> = ({ currentPage }) => {
  const menuToggle = useMenuToggle();
  const mounted = useMounted();
  const isMobile = useMedia(MOBILE_MENU_QUERY, false);
  const isScrolled = useScrolledAfter(100, false);
  const menuRef = React.useRef<HTMLElement>();
  const { height: windowHeight } = useWindowSize();
  const { height: menuHeight } = useComponentSize(menuRef);

  const padding = 2 * 16;
  const closeWrapper = 62;

  const showMenu = isMobile ? menuToggle.visible : true;
  const menuScrollSize =
    windowHeight === undefined || menuHeight === undefined
      ? 3000
      : !isMobile
      ? windowHeight
      : Math.min(menuHeight, windowHeight - (padding + closeWrapper));

  return (
    <>
      {mounted && <LockBodyScroll active={isMobile && showMenu} />}
      <TopbarWrapper
        style={{ boxShadow: isScrolled ? `0 8px 16px rgba(0,0,0,0.5)` : `0 0 0 rgba(0,0,0,0)` }}
        animate={{ opacity: showMenu ? 0 : 1 }}
        initial={{ opacity: 1 }}
      >
        <IconButton onClick={menuToggle.show}>
          <MenuIcon color="white" size={30} />
        </IconButton>
      </TopbarWrapper>
      <AnimatePresence>
        {isMobile && showMenu && (
          <Overlay onClick={menuToggle.hide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showMenu && (
          <Wrapper
            transition={{ ease: 'easeOut' }}
            initial={{ x: '-50vw', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-50vw', opacity: 0 }}
          >
            <CloseWrapper>
              <IconButton onClick={menuToggle.hide}>
                <CloseIcon color="white" size={30} />
              </IconButton>
            </CloseWrapper>
            <Scrollbars
              noScrollX
              style={{ height: menuScrollSize }}
              thumbYProps={{
                style: { background: '#fcbd0b' },
              }}
            >
              <Items ref={menuRef as any}>
                {PAGES.map((p, index) => {
                  return (
                    <MainMenuItem odd={index % 2 == 0} active={currentPage === p.slug} key={p.slug}>
                      <Link href={p.page} as={p.slug}>
                        <a>
                          <PackageName name={p.name} />
                        </a>
                      </Link>
                    </MainMenuItem>
                  );
                })}
                <div style={{ height: 50 }} />
                <MainMenuItem active={false} odd={true}>
                  <a href="https://github.com/etienne-dldc/tumau">GitHub</a>
                </MainMenuItem>
              </Items>
            </Scrollbars>
          </Wrapper>
        )}
      </AnimatePresence>
    </>
  );
};
