import axios from 'axios';

const fetchGuardianVersion = async (kramaId) => {
  try {
    const response = await axios.get(
      `https://api-voyage.moi.technology/api/guardian/version?krama_id=${kramaId}`,
      { timeout: 5000 } // Timeout set to 5 seconds (5000 milliseconds)
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `Error fetching MOIPOD version for Krama ID ${kramaId}:`,
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

export default fetchGuardianVersion;
