import * as React from "react";

const MOBILE_MAX = 767; // < 768px
const TABLET_MIN = 768; // >= 768px
const TABLET_MAX = 1023; // <= 1023px
const DESKTOP_MIN = 1024; // >= 1024px

export function useBreakpoints() {
  const [breakpoints, setBreakpoints] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  React.useEffect(() => {
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const tabletQuery = window.matchMedia(
      `(min-width: ${TABLET_MIN}px) and (max-width: ${TABLET_MAX}px)`
    );
    const desktopQuery = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);

    const updateBreakpoints = () => {
      setBreakpoints({
        isMobile: mobileQuery.matches,
        isTablet: tabletQuery.matches,
        isDesktop: desktopQuery.matches,
      });
    };

    updateBreakpoints();

    mobileQuery.addEventListener("change", updateBreakpoints);
    tabletQuery.addEventListener("change", updateBreakpoints);
    desktopQuery.addEventListener("change", updateBreakpoints);

    return () => {
      mobileQuery.removeEventListener("change", updateBreakpoints);
      tabletQuery.removeEventListener("change", updateBreakpoints);
      desktopQuery.removeEventListener("change", updateBreakpoints);
    };
  }, []);

  return breakpoints;
}
