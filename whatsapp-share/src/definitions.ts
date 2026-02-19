export interface WhatsappSharePlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
