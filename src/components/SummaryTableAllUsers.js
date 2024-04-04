import React, { useEffect, useState } from 'react';
import { Table, Space, Checkbox } from 'antd';
import ConsoleDisplay from './ConsoleDisplay'; // Import the ConsoleDisplay component
import fetchGuardianStatus from '../asyncCalls/fetchGuardianStatus';
import fetchGuardianIncentives from '../asyncCalls/fetchGuardianIncentives';
import fetchGuardianVersion from '../asyncCalls/fetchGuardianVersion';
import runResetScript from '../asyncCalls/runResetScript';
import runRegisteroldScript from '../asyncCalls/runRegisteroldScript';
import runLogsScript from '../asyncCalls/runLogsScript';
import fetchGuardianUptime from '../asyncCalls/fetchGuardianUptime';
import ConsoleDisplayRedesigned from './ConsoleDisplayRedesigned';

const { Column } = Table;

// const FETCH_COUNT = 20;
// const FETCH_WAIT_TIME = 3000;

const SummaryTableAllUsers = ({ usersData, uniqueNames }) => {
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState({});
  const [button2Loading, setButton2Loading] = useState({});
  const [button3Loading, setButton3Loading] = useState({});
  const [button4Loading, setButton4Loading] = useState({});
  const [button5Loading, setButton5Loading] = useState({});
  const [nodeInfo, setNodeInfo] = useState({});
  const [actionsToPerform, setActionsToPerform] = useState({
    nodeStatus: true,
    syncStatus: true,
    incentives: true,
    version: true,
    upTime: true,
  });
  const [syncedSyncColumn, setSyncedSyncColumn] = useState(0);
  const [notSyncedSyncColumn, setNotSyncedSyncColumn] = useState(0);
  const [errorSyncColumn, setErrorSyncColumn] = useState(0);
  const [syncedNodeColumn, setSyncedNodeColumn] = useState(0);
  const [notSyncedNodeColumn, setNotSyncedNodeColumn] = useState(0);
  const [errorNodeColumn, setErrorNodeColumn] = useState(0);
  const [uptimeBars, setUptimeBars] = useState({});
  const [upTimeData, setUpTimeData] = useState({});
  const [actionableKramaEntries, setActionableKramaEntries] = useState([]);

  const getUpTimeBool = (upTimeData) => {
    let isUp = 0;
    let isDown = 0;
    for (const upTimeInstance of upTimeData) {
      upTimeInstance ? (isUp = isUp + 1) : (isDown = isDown + 1);
    }
    return isUp > isDown ? 'UP' : 'DOWN';
  };

  // Define renderUptimeBar function outside of the component
  const renderUptimeBar = async (kramaId) => {
    const data = await fetchGuardianUptime(kramaId);

    if (data === 'Error') {
      return null; // Return null if there's an error
    }

    const uptimeData = data.uptime.slice(-48); // Get the last 48 entries

    setUpTimeData((prevUpTimeData) => ({
      ...prevUpTimeData,
      [kramaId]: getUpTimeBool(uptimeData),
    }));

    return uptimeData.map((uptime, index) => (
      <div
        key={index}
        className="uptime-bar"
        style={{ backgroundColor: uptime ? 'green' : 'red' }}
      />
    ));
  };

  useEffect(() => {
    const fetchKramaEntries = async () => {
      // Extracting KramaIDs from all parsed data
      const myObj = usersData.filter((obj) => obj['IP'].length !== 0);
      // console.log(myObj);
      const fieldValuesArray = myObj.map((obj) => obj['Krama ID']);
      setActionableKramaEntries(fieldValuesArray);
      if (Object.keys(usersData).length !== 0) {
        setLoading(false);
      }
    };

    fetchKramaEntries();
  }, [usersData]);

  useEffect(() => {
    const updateCounts = () => {
      let syncedSync = 0;
      let notSyncedSync = 0;
      let errorSync = 0;
      let syncedNode = 0;
      let notSyncedNode = 0;
      let errorNode = 0;

      for (const kramaId in nodeInfo) {
        const info = nodeInfo[kramaId];

        // Count for Sync Status column
        if (info.syncStatus === 'synced') {
          syncedSync++;
        } else if (info.syncStatus === 'not synced') {
          notSyncedSync++;
        } else if (info.syncStatus === 'Error') {
          errorSync++;
        }

        // Count for Node Status column
        if (info.nodeStatus === 'active') {
          syncedNode++;
        } else if (info.nodeStatus === 'not synced') {
          notSyncedNode++;
        } else if (info.nodeStatus === 'Error') {
          errorNode++;
        }
      }

      setSyncedSyncColumn(syncedSync);
      setNotSyncedSyncColumn(notSyncedSync);
      setErrorSyncColumn(errorSync);

      setSyncedNodeColumn(syncedNode);
      setNotSyncedNodeColumn(notSyncedNode);
      setErrorNodeColumn(errorNode);
    };

    updateCounts();
  }, [nodeInfo]);

  const updateObject = (kramaId, updatedValues) => {
    setNodeInfo((prevState) => {
      // Create a copy of the original state object
      const updatedState = { ...prevState };

      // Check if the key exists in the state object
      if (updatedState.hasOwnProperty(kramaId)) {
        // If the key exists, update the nested object with the new values
        updatedState[kramaId] = { ...updatedState[kramaId], ...updatedValues };
      } else {
        // If the key doesn't exist, create a new entry with the key and values
        updatedState[kramaId] = updatedValues;
      }

      // Return the updated state object
      return updatedState;
    });
  };

  const handleUpdateDetails = async () => {
    try {
      // const updatedNodeInfo = { ...nodeInfo };

      for (const entry of actionableKramaEntries) {
        // const kramaId = entry["Krama ID"];
        const kramaId = entry;
        let sync1Status, node1Status, incentives, uptime, version;
        let updatedNodeInfo = {};

        try {
          if (actionsToPerform.syncStatus) {
            sync1Status = await fetchGuardianStatus(kramaId, 'Sync');
            updatedNodeInfo.syncStatus = sync1Status;
          }
          if (actionsToPerform.nodeStatus) {
            node1Status = await fetchGuardianStatus(kramaId, 'node');
            updatedNodeInfo.nodeStatus = node1Status;
          }
          if (actionsToPerform.incentives) {
            incentives = await fetchGuardianIncentives(kramaId);
            updatedNodeInfo.incentives = incentives;
          }
          if (actionsToPerform.upTime) {
            uptime = await renderUptimeBar(kramaId);
            setUptimeBars((prevUptimeBars) => ({
              ...prevUptimeBars,
              [kramaId]: uptime,
            }));
          }
          if (actionsToPerform.version) {
            version = await fetchGuardianVersion(kramaId);
            updatedNodeInfo.version = version;
          }

          // Update the uptimeBars for the current kramaId

          // Set the updated nodeInfo
          updateObject(kramaId, updatedNodeInfo);

          // Delay for better visual representation (optional)
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error fetching additional details:', error);
          updatedNodeInfo[kramaId] = {
            syncStatus: 'Error',
            nodeStatus: 'Error',
            incentives: 'Error',
            verson: 'Error',
          };
        }
      }

      alert('Details fetched successfully!');
    } catch (error) {
      console.error('Error updating details:', error);
      alert('Error updating details. Please try again.');
    }
  };

  const handleFetch1Details = async (kramaId) => {
    try {
      setButtonLoading((prevButtonLoading) => ({
        ...prevButtonLoading,
        [kramaId]: true,
      }));
      const sync1Status = await fetchGuardianStatus(kramaId, 'Sync');
      const node1Status = await fetchGuardianStatus(kramaId, 'node');
      const incentives = await fetchGuardianIncentives(kramaId);
      const uptime = await renderUptimeBar(kramaId); // Fetch uptime for the specific krama ID
      const version = await fetchGuardianVersion(kramaId); // Fetch uptime for the specific krama ID

      setNodeInfo((prevNodeInfo) => ({
        ...prevNodeInfo,
        [kramaId]: {
          syncStatus: sync1Status,
          nodeStatus: node1Status,
          incentives: incentives,
          version: version,
        },
      }));

      // Update uptimeBars state only for the specific krama ID
      setUptimeBars((prevUptimeBars) => ({
        ...prevUptimeBars,
        [kramaId]: uptime,
      }));

      setButtonLoading((prevButtonLoading) => ({
        ...prevButtonLoading,
        [kramaId]: false,
      }));
      alert('Details fetched successfully!');
    } catch (error) {
      console.error('Error fetching additional details:', error);
      alert('Error fetching additional details. Please try again.');
      setButtonLoading((prevButtonLoading) => ({
        ...prevButtonLoading,
        [kramaId]: false,
      }));
    }
  };

  const handleResetScript = async (kramaId) => {
    try {
      // Set resetLoading to true for the specific button clicked
      setButton3Loading((prevLoading) => ({
        ...prevLoading,
        [kramaId]: true,
      }));

      // Find the entry with the matching Krama ID
      console.log('Krama ID: ', kramaId);
      const matchingEntry = usersData.find(
        (entry) => entry['Krama ID'] === kramaId
      );

      if (matchingEntry) {
        const ip = matchingEntry['IP'];
        const password = matchingEntry['Password'];
        const nodepassword = matchingEntry['Nodepassword'];
        const machineName = matchingEntry['Server Name'];

        // Run the script using the obtained IP and password
        const ip_address = `root@${ip}`;
        console.log(`IP Address: ${ip_address}`);
        // console.log(`Field 2: ${password}`);
        console.log('Server Name: ', machineName);

        const scriptResult = await runResetScript(
          ip_address,
          password,
          nodepassword
        );
        console.log(scriptResult);

        // alert("Reset Script executed successfully!");
      } else {
        console.warn(`No matching entry found for Krama ID: ${kramaId}`);
        alert('No matching entry found for the selected Krama ID.');
      }
    } catch (error) {
      console.error('Error fetching node.csv:', error);
      alert('Error fetching node.csv. Please try again.');
    } finally {
      // Set resetLoading to false for the specific button clicked
      setButton3Loading((prevLoading) => ({
        ...prevLoading,
        [kramaId]: false,
      }));
    }
  };

  const handleSequentialReset = async () => {
    try {
      for (const entry of actionableKramaEntries) {
        const kramaId = entry;
        await handleResetScript(kramaId);
      }
      alert('Sequential reset completed successfully!');
    } catch (error) {
      console.error('Error during sequential reset:', error);
      alert('Error during sequential reset. Please try again.');
    }
  };

  const handleSequentialRegisterOld = async () => {
    try {
      for (const entry of actionableKramaEntries) {
        const kramaId = entry;
        await handleRegisteroldScript(kramaId);
      }
      alert('Sequential Register completed successfully!');
    } catch (error) {
      console.error('Error during sequential reset:', error);
      alert('Error during sequential reset. Please try again.');
    }
  };

  const handleRegisteroldScript = async (kramaId) => {
    try {
      // // Show a confirmation dialog before resetting
      // const isConfirmed = window.confirm(
      //   'Are you sure you want to register node to new machine?'
      // );

      // if (!isConfirmed) {
      //   return; // If not confirmed, do nothing
      // }

      // Set resetLoading to true for the specific button clicked
      setButton5Loading((prevLoading) => ({
        ...prevLoading,
        [kramaId]: true,
      }));

      // Find the entry with the matching Krama ID
      console.log('Krama ID: ', kramaId);
      const matchingEntry = usersData.find(
        (entry) => entry['Krama ID'] === kramaId
      );

      if (matchingEntry) {
        const ip = matchingEntry['IP'];
        const password = matchingEntry['Password'];
        const nodepassword = matchingEntry['Nodepassword'];
        const nodeindex = matchingEntry['Node Index'];
        const walletaddress = matchingEntry['Wallet Address'];
        const name = matchingEntry['Name'];

        // Run the script using the obtained IP and password
        const ip_address = `root@${ip}`;
        const fullip = `http://${ip}:1600`;
        console.log(`IP Address: ${ip_address}`);

        const scriptResult = await runRegisteroldScript(
          ip_address,
          fullip,
          password,
          nodepassword,
          nodeindex,
          walletaddress,
          name
        );
        console.log(scriptResult);

        // alert('Node shifted to new machine!');
      } else {
        console.warn(`No matching entry found for Krama ID: ${kramaId}`);
        alert('No matching entry found for the selected Krama ID.');
      }
    } catch (error) {
      console.error('Error fetching node.csv:', error);
      alert('Error fetching node.csv. Please try again.');
    } finally {
      // Set resetLoading to false for the specific button clicked
      setButton5Loading((prevLoading) => ({
        ...prevLoading,
        [kramaId]: false,
      }));
    }
  };

  const handleLogsScript = async (kramaId) => {
    try {
      // Set resetLoading to true for the specific button clicked
      setButton4Loading((prevLoading) => ({
        ...prevLoading,
        [kramaId]: true,
      }));

      // Find the entry with the matching Krama ID
      console.log('Krama ID: ', kramaId);
      const matchingEntry = usersData.find(
        (entry) => entry['Krama ID'] === kramaId
      );

      if (matchingEntry) {
        const ip = matchingEntry['IP'];
        const password = matchingEntry['Password'];

        // Run the script using the obtained IP and password
        const ip_address = `root@${ip}`;
        console.log(`IP Address: ${ip_address}`);

        const scriptResult = await runLogsScript(ip_address, password);
        console.log(scriptResult);

        alert('Logs downloaded successfully!');
      } else {
        console.warn(`No matching entry found for Krama ID: ${kramaId}`);
        alert('No matching entry found for the selected Krama ID.');
      }
    } catch (error) {
      console.error('Error fetching node.csv:', error);
      alert('Error fetching node.csv. Please try again.');
    } finally {
      // Set resetLoading to false for the specific button clicked
      setButton4Loading((prevLoading) => ({
        ...prevLoading,
        [kramaId]: false,
      }));
    }
  };

  const getNameFilters = () => {
    const filters = [];
    for (let i = 0; i < uniqueNames.length; i++) {
      filters.push({
        text: uniqueNames[i],
        value: uniqueNames[i],
      });
    }
    return filters;
  };

  return (
    <>
      {/* <ConsoleDisplay /> */}
      <ConsoleDisplayRedesigned />
      <div className="grid gap-16">
        <div className="flex title-row">
          <div className="grid gap-8">
            <h4 className="text-left text-medium">Nodes list</h4>
            <p className="label-default text-high">
              Table Rows: {actionableKramaEntries.length}
            </p>
          </div>
          <div className="flex gap-16">
            <Checkbox
              className="items-center text-medium"
              checked={actionsToPerform.syncStatus}
              onChange={(e) =>
                setActionsToPerform({
                  ...actionsToPerform,
                  syncStatus: e.target.checked,
                })
              }
            >
              Sync
            </Checkbox>
            <Checkbox
              className="items-center text-medium"
              checked={actionsToPerform.nodeStatus}
              onChange={(e) =>
                setActionsToPerform({
                  ...actionsToPerform,
                  nodeStatus: e.target.checked,
                })
              }
            >
              Node
            </Checkbox>
            <Checkbox
              className="items-center text-medium"
              checked={actionsToPerform.incentives}
              onChange={(e) =>
                setActionsToPerform({
                  ...actionsToPerform,
                  incentives: e.target.checked,
                })
              }
            >
              Reward
            </Checkbox>
            <Checkbox
              className="items-center text-medium"
              checked={actionsToPerform.version}
              onChange={(e) =>
                setActionsToPerform({
                  ...actionsToPerform,
                  version: e.target.checked,
                })
              }
            >
              Version
            </Checkbox>
            <Checkbox
              className="items-center text-medium"
              checked={actionsToPerform.upTime}
              onChange={(e) =>
                setActionsToPerform({
                  ...actionsToPerform,
                  upTime: e.target.checked,
                })
              }
            >
              UpTime
            </Checkbox>
            <button
              className="btn btn-primary btn-40"
              onClick={handleUpdateDetails}
            >
              Fetch all
            </button>
            <button
              className="btn btn-tertiary btn-40"
              onClick={handleSequentialReset}
            >
              Reset all
            </button>
            <button
              className="btn btn-tertiary btn-40"
              onClick={handleSequentialRegisterOld}
            >
              Register all
            </button>
          </div>
        </div>
        <div className="bg-lvl5">
          <Table
            dataSource={usersData}
            loading={loading}
            pagination={false}
            rowClassName={(record, index) =>
              index % 2 === 0 ? 'even-row' : 'odd-row'
            }
            onChange={(pagination, filters, sorter, extra) => {
              const myObj = extra.currentDataSource;
              const fieldValuesArray = myObj.map((obj) => obj['Krama ID']);
              setActionableKramaEntries(fieldValuesArray);
            }}
          >
            <Column
              className="column-1"
              title="Name"
              dataIndex="Name"
              key="Name"
              onFilter={(value, record) => value === record['Name']}
              filters={getNameFilters()}
            />
            <Column
              className="column-2"
              title="Krama ID"
              dataIndex="Krama ID"
              key="kramaIdAndUptime"
              render={(kramaId) => (
                <div className="flex-main">
                  <a
                    className="krama-link text-accent"
                    href={`https://voyage.moi.technology/guardians/activity/${kramaId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View node detail
                  </a>
                  <div
                    id={`uptime-bar-container-${kramaId}`}
                    className="uptime-bar-container"
                  >
                    {uptimeBars[kramaId]}
                  </div>
                </div>
              )}
            />
            <Column
              className="column-2a"
              title="Server Name"
              dataIndex="Server Name"
              key="Server Name"
              filters={[
                { text: 'Empty', value: 'empty' },
                { text: 'Filled', value: 'filled' },
              ]}
              defaultFilteredValue={['filled']}
              onFilter={(value, record) => {
                if (value === 'empty') {
                  return !record['IP'];
                } else if (value === 'filled') {
                  return record['IP'];
                }
              }}
            />

            <Column
              className="column"
              title="Index"
              dataIndex="Node Index"
              key="Node Index"
            />
            <Column
              className="column-3"
              title="Sync"
              dataIndex="Krama ID"
              key="syncStatus"
              render={(kramaId) => (
                <Space
                  className={`${
                    nodeInfo[kramaId] &&
                    nodeInfo[kramaId].syncStatus === 'Error'
                      ? 'error-cell'
                      : nodeInfo[kramaId] &&
                        nodeInfo[kramaId].syncStatus === 'not synced'
                      ? 'not-synced'
                      : null
                  }`}
                >
                  {nodeInfo[kramaId] && nodeInfo[kramaId].syncStatus
                    ? nodeInfo[kramaId].syncStatus
                    : 'N/A'}
                </Space>
              )}
              filters={[
                { text: 'Synced', value: 'synced' },
                { text: 'Not Synced', value: 'not synced' },
                { text: 'Error', value: 'Error' },
              ]}
              onFilter={(value, record) =>
                nodeInfo[record['Krama ID']] &&
                nodeInfo[record['Krama ID']].syncStatus === value
              }
            />
            <Column
              className="column-4"
              title="Node"
              dataIndex="Krama ID"
              key="nodeStatus"
              render={(kramaId) => (
                <Space
                  className={`${
                    nodeInfo[kramaId] &&
                    nodeInfo[kramaId].nodeStatus === 'Error'
                      ? 'error-cell'
                      : null
                  }`}
                >
                  {nodeInfo[kramaId] && nodeInfo[kramaId].nodeStatus
                    ? nodeInfo[kramaId].nodeStatus
                    : 'N/A'}
                </Space>
              )}
              filters={[
                { text: 'Active', value: 'active' },
                { text: 'Error', value: 'Error' },
              ]}
              onFilter={(value, record) =>
                nodeInfo[record['Krama ID']] &&
                nodeInfo[record['Krama ID']].nodeStatus === value
              }
            />
            <Column
              className="column-5"
              title="Version"
              dataIndex="Krama ID"
              key="version"
              render={(kramaId) => (
                <Space>
                  {nodeInfo[kramaId] && nodeInfo[kramaId].version
                    ? nodeInfo[kramaId].version
                    : 'N/A'}
                </Space>
              )}
              filters={[
                { text: '0.6.4', value: '0.6.4' },
                { text: '0.6.3', value: '0.6.3' },
                { text: 'Error', value: 'Error' },
              ]}
              onFilter={(value, record) =>
                nodeInfo[record['Krama ID']] &&
                nodeInfo[record['Krama ID']].version === value
              }
            />
            <Column
              className="column-5"
              title="Rewards"
              dataIndex="Krama ID"
              key="incentives"
              render={(kramaId) => (
                <Space>
                  {nodeInfo[kramaId] && nodeInfo[kramaId].incentives
                    ? nodeInfo[kramaId].incentives
                    : 'N/A'}
                </Space>
              )}
            />
            <Column
              className="column-6"
              title="Status"
              dataIndex="Krama ID"
              key="upTimeBool"
              filters={[
                { text: 'UP', value: 'UP' },
                { text: 'DOWN', value: 'DOWN' },
                { text: 'N/A', value: 'N/A' },
              ]}
              onFilter={(value, record) => {
                if (value === 'UP') {
                  return upTimeData[record['Krama ID']] === 'UP';
                } else if (value === 'DOWN') {
                  return upTimeData[record['Krama ID']] === 'DOWN';
                } else {
                  return upTimeData[record['Krama ID']] === undefined;
                }
              }}
              render={(kramaId) => (
                <Space>
                  {upTimeData[kramaId] ? upTimeData[kramaId] : 'N/A'}
                </Space>
              )}
            />
            <Column
              className="column-7 !text-center"
              title="Actions"
              key="actions"
              render={(text, record) => (
                <Space size="middle" className="flex gap-16">
                  <button
                    className={'btn-32 btn btn-primary'}
                    onClick={() => handleFetch1Details(record['Krama ID'])}
                  >
                    Fetch
                  </button>
                  <button
                    className={'btn-32 btn btn-secondary'}
                    onClick={() => handleLogsScript(record['Krama ID'])}
                  >
                    Get log
                  </button>
                  <button
                    className={'btn-32 btn btn-tertiary'}
                    onClick={() => handleResetScript(record['Krama ID'])}
                  >
                    Reset
                  </button>
                  <button
                    className={'btn-32 btn btn-tertiary'}
                    onClick={() => handleRegisteroldScript(record['Krama ID'])}
                  >
                    Register new
                  </button>
                </Space>
              )}
            />
          </Table>
        </div>
      </div>
    </>
  );
};

export default SummaryTableAllUsers;
