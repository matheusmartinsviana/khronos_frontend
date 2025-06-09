import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: 'https://us.i.posthog.com',
  autocapture: true, // opcional, ativa rastreamento automático de cliques, etc.
});

export default posthog;
