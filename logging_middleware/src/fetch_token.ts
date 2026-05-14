import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AUTH_URL = 'http://4.224.186.213/evaluation-service/auth';

async function fetchToken() {
  const payload = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  };

  try {
    console.log('Fetching access token...');
    const response = await axios.post(AUTH_URL, payload);
    const token = response.data.access_token;

    if (token) {
      console.log('Token fetched successfully.');
      const envPath = path.resolve(__dirname, '../../.env');
      let envContent = fs.readFileSync(envPath, 'utf-8');
      
      // Update or add ACCESS_TOKEN
      if (envContent.includes('ACCESS_TOKEN=')) {
        envContent = envContent.replace(/ACCESS_TOKEN=.*/, `ACCESS_TOKEN=${token}`);
      } else {
        envContent += `\nACCESS_TOKEN=${token}`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log('Updated .env with new access_token.');
    }
  } catch (error: any) {
    console.error('Error fetching token:', error.response?.data || error.message);
  }
}

fetchToken();
