import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  LOG_API_URL: 'http://4.224.186.213/evaluation-service/logs',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
};
