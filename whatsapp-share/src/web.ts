import { WebPlugin } from '@capacitor/core';

import type { WhatsappSharePlugin } from './definitions';

export class WhatsappShareWeb extends WebPlugin implements WhatsappSharePlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
