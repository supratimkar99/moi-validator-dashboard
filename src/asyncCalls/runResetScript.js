import axios from 'axios';

const runResetScript = async (ipAddress, password, nodepassword) => {
  try {
    const data = {
      ipAddress: ipAddress,
      password: password,
      nodepassword: nodepassword,
    };
    const response = await axios.post(
      'http://localhost:3001/node_reset',
      data,
      {
        'Content-Type': 'application/json',
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error running reset script:', error);
  }
};

export default runResetScript;
