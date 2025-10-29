import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to the top of the page when the route changes.
 * This component doesn't render anything visible - it only handles the scroll behavior.
 *
 * Usage:
 * Place this component inside the Router (BrowserRouter) in your App.js:
 *
 * <Router>
 *   <ScrollToTop />
 *   <Routes>
 *     ...
 *   </Routes>
 * </Router>
 *
 * @returns {null} - This component doesn't render anything
 */
const ScrollToTop = () => {
  // Get the current location from React Router
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Smooth scrolling animation
    });

    // Alternative: Instant scroll without animation
    // window.scrollTo(0, 0);

  }, [pathname]); // Run effect when pathname changes

  // This component doesn't render anything
  return null;
};

export default ScrollToTop;
