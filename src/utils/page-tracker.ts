import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import posthog from '../lib/posthogClient';

export function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    posthog.capture('$pageview', {
      url: location.pathname,
    });
  }, [location]);

  return null;
}
