import React, { useState, useEffect } from 'react';
import { Trophy, Activity, Map } from 'lucide-react';
import GoogleFitComponent from '../GoogleFitComponent'

// Custom Card Components
const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl bg-gray-900/50 border-0 backdrop-blur-md shadow-xl transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-4 border-b border-gray-800">
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h2 className="text-xl font-bold text-gray-100">
    {children}
  </h2>
);

const CardContent = ({ children }) => (
  <div className="p-4">
    {children}
  </div>
);

const Home = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const userEmail = localStorage.getItem("email");
  const userName = localStorage.getItem("name");

  useEffect(() => {
    fetch("http://localhost:5000/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched leaderboard data:", data);
        setLeaderboardData(data);
      })
      .catch((error) => console.error("Error fetching leaderboard:", error));
  }, []);

  const renderLeaderboard = () => {
    if (leaderboardData.length === 0) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-400">Leaderboard coming soon!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {leaderboardData.map((user) => (
          <div
            key={user.email}
            className={`
              relative p-4 rounded-xl backdrop-blur-sm transition-all duration-300
              ${user.email === userEmail 
                ? "bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 shadow-lg hover:shadow-fuchsia-500/20" 
                : "bg-gray-900/40 hover:bg-gray-900/50"}
              hover:transform hover:scale-102 cursor-pointer
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${user.rank <= 3 ? 'bg-gradient-to-r from-amber-400 to-yellow-600 text-black' : 'bg-gray-800'}
                `}>
                  {user.rank}
                </div>
                <div>
                  <p className="font-medium text-gray-100">{userName}</p>
                  {user.email === userEmail && (
                    <div className="text-xs text-fuchsia-400">That's you!</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Steps</p>
                  <p className="text-lg font-semibold text-gray-100">{user.steps.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Calories</p>
                  <p className="text-lg font-semibold text-gray-100">{parseFloat(user.calories).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-purple-500/10">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <CardTitle>Fitness Connect</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <GoogleFitComponent />
            </CardContent>
          </Card>

          <Card className="md:col-span-2 hover:shadow-fuchsia-500/10">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-fuchsia-400" />
                <CardTitle>Leaderboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {renderLeaderboard()}
            </CardContent>
          </Card>
        </div>

        <Card className="hover:shadow-cyan-500/10">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Map className="w-5 h-5 text-cyan-400" />
              <CardTitle>Player Map</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-xl bg-gray-800/50 flex items-center justify-center">
              <p className="text-gray-400">Map placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;