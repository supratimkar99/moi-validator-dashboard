import axios from 'axios';

const fetchGuardianUptime = async (kramaId) => {
  try {
    const response = await axios.get(
      `https://voyage-rpc.moi.technology/babylon/v2/watchdog/<VOYAGEAPIKEY>/uptime/${kramaId}`,
      { timeout: 5000 } // Timeout set to 5 seconds (5000 milliseconds)
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching uptime for Krama ID ${kramaId}:`, error);
    if (error.code === 'ECONNABORTED') {
      // Request timed out
      console.error('Request timed out, retrying...');
      return 'Retry'; // Indicate to retry
    } else {
      return 'Error';
    }
  }
};

export default fetchGuardianUptime;
