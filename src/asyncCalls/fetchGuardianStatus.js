import axios from 'axios';

const fetchGuardianStatus = async (kramaId, type) => {
  try {
    const response = await axios.get(
      `https://api-voyage.moi.technology/api/guardian/status?krama_id=${kramaId}&type=${type}`,
      { timeout: 5000 } // Timeout set to 5 seconds (5000 milliseconds)
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `Error fetching ${type} status for Krama ID ${kramaId}:`,
      error
    );
    if (error.code === 'ECONNABORTED') {
      // Request timed out
      console.error('Request timed out, retrying...');
      return 'Retry'; // Indicate to retry
    } else {
      return 'Error';
    }
  }
};

export default fetchGuardianStatus;
