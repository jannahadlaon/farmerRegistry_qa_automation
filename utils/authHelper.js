import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export function getHttpCredentials(url) {
  if (url.includes('ticao2')) {
    return {
      username: process.env.TICAO2_USERNAME || '',
      password: process.env.TICAO2_PASSWORD || '',
    };
  } else if (url.includes('ticao3')) {
    return {
      username: process.env.TICAO3_USERNAME || '',
      password: process.env.TICAO3_PASSWORD || '',
    };
  }
  throw new Error(`Unknown TICAO URL: ${url}`);
}
