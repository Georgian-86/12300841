import axios from 'axios';
import fs from 'fs';
import path from 'path';

const REGISTER_URL = 'http://4.224.186.213/evaluation-service/register';

const userDetails = {
  email: "optimus4586prime@gmail.com",
  name: "Golu Kumar",
  mobileNo: "8950214195",
  githubUsername: "Georgian-86",
  rollNo: "12300841",
  accessCode: "TRvZWq"
};

async function register() {
  try {
    console.log('Registering user...');
    const response = await axios.post(REGISTER_URL, userDetails);
    const { clientID, clientSecret } = response.data;

    if (clientID && clientSecret) {
      console.log('Registration successful.');
      console.log('ClientID:', clientID);
      console.log('ClientSecret:', clientSecret);

      const envPath = path.resolve(__dirname, '../../.env');
      let envContent = `CLIENT_ID=${clientID}\nCLIENT_SECRET=${clientSecret}\n`;
      envContent += `EMAIL=${userDetails.email}\nNAME="${userDetails.name}"\n`;
      envContent += `ROLL_NO=${userDetails.rollNo}\nACCESS_CODE=${userDetails.accessCode}\n`;
      envContent += `MOBILE_NO=${userDetails.mobileNo}\nGITHUB_USERNAME=${userDetails.githubUsername}\n`;
      
      fs.writeFileSync(envPath, envContent);
      console.log('Saved credentials to .env');
    }
  } catch (error: any) {
    console.error('Registration failed:', error.response?.data || error.message);
  }
}

register();
