import React from 'react';
import GoogleFitComponent from "../GoogleFitComponent"  // Import the new component

const Home = () => {
  const renderLeaderboard = () => {
    const leaderboardData = [
      { rank: 1, name: "John Doe", steps: 10000 },
      { rank: 2, name: "Jane Smith", steps: 9500 },
      { rank: 3, name: "Mike Johnson", steps: 9000 }
    ];

    if (leaderboardData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Leaderboard coming soon!</p>
        </div>
      );
    }

    return (
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Rank</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-right">Steps</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user) => (
              <tr key={user.rank} className="border-b">
                <td className="p-2">{user.rank}</td>
                <td className="p-2">{user.name}</td>
                <td className="p-2 text-right">{user.steps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex text-black justify-center flex-wrap gap-4">
        {/* Google Fit Connection Component */}
        <div className="w-full md:w-1/3 bg-white shadow-md rounded-lg border">
          <h2 className="text-xl font-bold p-4 border-b">Google Fit Connection</h2>
          <GoogleFitComponent />
        </div>

        {/* Leaderboard Component */}
        <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg border">
          <h2 className="text-xl font-bold p-4 border-b">Leaderboard</h2>
          {renderLeaderboard()}
        </div>
      </div>

      {/* Map Component */}
      <div className="w-full bg-white shadow-md rounded-lg border">
        <h2 className="text-xl font-bold p-4 border-b">Player Map</h2>
        <div className="h-[500px] bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Map placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default Home;