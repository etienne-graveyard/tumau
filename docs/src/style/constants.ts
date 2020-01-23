export const PRIMARY_WIDTH = 270;

export const MOBILE_MENU_MAX_WIDTH = 600;

export const MOBILE_MENU_QUERY = `(max-width: ${MOBILE_MENU_MAX_WIDTH}px)`;
export const DESKTOP_MENU_QUERY = `(min-width: ${MOBILE_MENU_MAX_WIDTH - 1}px)`;

export const MOBILE_MENU_MQ = `@media only screen and ${MOBILE_MENU_QUERY}`;
export const DESKTOP_MENU_MQ = `@media only screen and ${DESKTOP_MENU_QUERY}`;
