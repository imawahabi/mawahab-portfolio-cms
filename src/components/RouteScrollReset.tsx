import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures each new route starts at the top of the page.
 * Helps on mobile where the previous scroll position might be reused.
 */
export const RouteScrollReset = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    // Allow native hash navigation if provided, otherwise reset to the top
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return null;
};
