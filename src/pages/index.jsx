import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import SummaryTableAllUsers from '../components/SummaryTableAllUsers';
import UserCard from '../components/UserCard';

const API_URL = 'https://api-voyage.moi.technology/api/network/info?moi_id=';
const CSV_DIR = '/data/app-data.csv';

const App = () => {
  const [usersData, setUsersData] = useState([]); // Array[] of Objetcs{}
  const [guardiansData, setGuardiansData] = useState({}); // Object{} key: moidId, value: guardianData{}
  const [totalRewards, setTotalRewards] = useState(null);
  const [loadingState, setLoadingState] = useState({}); // Object{} key: moiId, value: Boolean
  const [uniqueName, setUniqueNames] = useState([]); // Array[] of Strings

  // Fetches user data from a csv file at a given directory
  const fetchUserData = async () => {
    const csvData = await fetch(CSV_DIR).then((response) => response.text());

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (
          result.meta.fields.includes('Name') &&
          result.meta.fields.includes('MOI ID')
        ) {
          setUsersData(result.data);
        } else {
          console.error("CSV must contain 'Name' and 'MOI ID' columns.");
        }
      },
    });
  };

  // Fetch User Data from CSV at initial render
  useEffect(() => {
    fetchUserData();
  }, []);

  // Filter unique names in usersData everytime usersData state updates
  useEffect(() => {
    const filterUniqueEntries = () => {
      const uniqueNames = [...new Set(usersData.map((item) => item['Name']))];
      setUniqueNames(uniqueNames);
    };
    filterUniqueEntries();
  }, [usersData]);

  // Calculates the total reward from all guardiansData
  const calculateTotalRewards = () => {
    let totalRewardsValue = 0;

    Object.entries(guardiansData).forEach(([key, value]) => {
      const rewardsText = value.guardian_rewards;
      const rewardsValue = parseFloat(rewardsText.replace('K MOI', '').trim());

      if (!isNaN(rewardsValue)) {
        totalRewardsValue += rewardsValue;
      }
    });

    setTotalRewards(totalRewardsValue);
  };

  // Fetches the guardian data (total rewards & nodes) for a particular guardian/user uaing their unique moiId
  const fetchGuardianDataAsync = async (moiId) => {
    setLoadingState((prevLoadingState) => ({
      ...prevLoadingState,
      [moiId]: true, // Set loading to true for the specific user
    }));

    try {
      const response = await axios.get(`${API_URL}${moiId}`);
      const apiResponse = response.data.data;

      setGuardiansData((prevApiData) => ({
        ...prevApiData,
        [moiId]: apiResponse,
      }));
    } catch (error) {
      console.error(`API Error for MOI ID ${moiId}:`, error);
    } finally {
      setLoadingState((prevLoadingState) => ({
        ...prevLoadingState,
        [moiId]: false, // Set loading to false for the specific user
      }));
    }
  };

  const fetchGuardianData = async (moiId) => {
    await fetchGuardianDataAsync(moiId);
  };

  // Fetch all guardians data at once by clicking on all the 'Fetch Guardian Data' buttons
  const fetchAllGuardiansData = () => {
    const fetchButtons = document.querySelectorAll('.fetch-guardian-button');

    fetchButtons.forEach((button) => {
      button.click();
    });
  };

  const renderUserCards = () => {
    const uniqueNames = new Set();

    return usersData
      .map((userEntry) => {
        const { Name: name, 'Email ID': emailId, 'MOI ID': moiId } = userEntry;

        if (!name || uniqueNames.has(name)) {
          return null;
        }

        uniqueNames.add(name);

        return (
          <UserCard
            key={moiId}
            moiId={moiId}
            name={name}
            emailId={emailId}
            guardiansData={guardiansData}
            loadingState={loadingState}
            fetchGuardianData={fetchGuardianData}
          />
        );
      })
      .filter(Boolean);
  };

  return (
    <div className="App">
      <div className="container grid gap-64">
        <div className="grid gap-48">
          <div className="title-row">
            <h1 className="text-high">Guardians</h1>
            <div className="grid gap-8 text-right">
              <div className="flex gap-24">
                <button
                  className="btn btn-primary btn-40"
                  onClick={fetchAllGuardiansData}
                >
                  Fetch all
                </button>
                <button
                  className="btn btn-secondary btn-40"
                  onClick={calculateTotalRewards}
                >
                  Total rewards
                </button>
              </div>
              {totalRewards !== null && (
                <h4>{totalRewards.toFixed(2)} K MOI</h4>
              )}
            </div>
          </div>
          <div className="card-grid">{renderUserCards()}</div>
        </div>

        <SummaryTableAllUsers usersData={usersData} uniqueNames={uniqueName} />
      </div>
    </div>
  );
};

export default App;
