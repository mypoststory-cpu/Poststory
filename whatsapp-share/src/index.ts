import { registerPlugin } from '@capacitor/core';

import type { WhatsappSharePlugin } from './definitions';

const WhatsappShare = registerPlugin<WhatsappSharePlugin>('WhatsappShare', {
  web: () => import('./web').then((m) => new m.WhatsappShareWeb()),
});

export * from './definitions';
export { WhatsappShare };
