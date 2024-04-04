import axios from 'axios';

const runLogsScript = async (ipAddress, password) => {
  try {
    const data = {
      ipAddress: ipAddress,
      password: password,
    };
    const response = await axios.post('http://localhost:3001/get_logs', data, {
      'Content-Type': 'application/json',
    });
    return response.data;
  } catch (error) {
    console.error('Error running Logs script:', error);
  }
};

export default runLogsScript;
