import React from 'react';

const UserCard = ({
  moiId,
  name,
  emailId,
  guardiansData,
  loadingState,
  fetchGuardianData,
}) => {
  return (
    <div key={moiId} className="user-card">
      <div className="title-row">
        <h3 className="capitalize">{name}</h3>
        <button
          className="btn fetch-guardian-button btn-tertiary btn-40"
          onClick={() => fetchGuardianData(moiId)}
          disabled={loadingState[moiId]}
        >
          {loadingState[moiId] ? 'Fetching...' : 'Fetch user data'}
        </button>
      </div>

      <div className="text-content">
        <p className="psmall">Email: {emailId}</p>
        <p className="psmall">
          Total Nodes: {guardiansData[moiId]?.guardian_nodes || ''}
        </p>
        <p className="psmall">
          Total Rewards: {guardiansData[moiId]?.guardian_rewards || ''}
        </p>
      </div>
    </div>
  );
};

export default UserCard;
