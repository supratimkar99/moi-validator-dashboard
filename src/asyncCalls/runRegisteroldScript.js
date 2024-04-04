import axios from 'axios';

const runRegisteroldScript = async (
  ipAddress,
  fullip,
  password,
  nodepassword,
  nodeindex,
  walletaddress,
  name
) => {
  try {
    const data = {
      ipAddress: ipAddress,
      fullip: fullip,
      password: password,
      nodepassword: nodepassword,
      nodeindex: nodeindex,
      walletaddress: walletaddress,
      name: name,
    };
    const response = await axios.post(
      'http://localhost:3001/node_oldregister',
      data,
      {
        'Content-Type': 'application/json',
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error running register old script:', error);
  }
};

export default runRegisteroldScript;
