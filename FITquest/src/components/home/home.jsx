import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Activity, Map, ArrowLeft} from 'lucide-react';
import GoogleFitComponent from '../GoogleFitComponent'
import PlayerMap from '../PlayerMap';
import "./home.css" 
import ProfilePage from '../ProfilePage';
// Card components remain the same...
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
  const [showProfile, setShowProfile] = useState(false);
  const userEmail = localStorage.getItem("email");
  const scrollContainerRef = useRef(null);

  const getStepsGoal = () => {
    return parseInt(localStorage.getItem('stepsGoal')) || 5000;
  };

  const handleChallenge = async (user) => {
    const challengerEmail = localStorage.getItem("email");
    const challengeData = {
      challenger: challengerEmail,
      recipient: user.email,
      challengeType: "steps",
      date: new Date().toISOString()
    };
  
    try {
      const response = await fetch("http://localhost:5000/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(challengeData),
      });
      const data = await response.json();
      
      if (response.ok) {
        // Update local state to show challenge pending
        const updatedLeaderboardData = leaderboardData.map(player => {
          if (player.email === user.email) {
            return { ...player, challengePending: true };
          }
          return player;
        });
        setLeaderboardData(updatedLeaderboardData);
      }
    } catch (error) {
      console.error("Error sending challenge:", error);
    }
  };

  

  useEffect(() => {
    const fetchLeaderboardAndChallenges = async () => {
      try {
        // Fetch leaderboard data
        const leaderboardRes = await fetch("http://localhost:5000/leaderboard");
        const leaderboardData = await leaderboardRes.json();
        
        // Fetch pending challenges
        const challengesRes = await fetch(`http://localhost:5000/pending-challenges/${localStorage.getItem("email")}`);
        const pendingChallenges = await challengesRes.json();
        
        // Combine the data
        const updatedLeaderboardData = leaderboardData.map(user => ({
          ...user,
          challengePending: pendingChallenges.some(
            challenge => 
              (challenge.challenger === localStorage.getItem("email") && challenge.recipient === user.email) ||
              (challenge.recipient === localStorage.getItem("email") && challenge.challenger === user.email)
          )
        }));
        
        setLeaderboardData(updatedLeaderboardData);
        
        // Scroll to user's position
        const userIndex = updatedLeaderboardData.findIndex(user => user.email === userEmail);
        if (userIndex !== -1 && scrollContainerRef.current) {
          const itemHeight = 96;
          scrollContainerRef.current.scrollTop = Math.max(0, (userIndex-1) * itemHeight);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchLeaderboardAndChallenges();
  }, [userEmail]);

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <CardTitle> Profile </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ProfilePage />
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderLeaderboard = () => {
    if (leaderboardData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[288px]">
          <p className="text-gray-400">Leaderboard coming soon!</p>
        </div>
      );
    }

    return (
      <div className="relative h-[288px]">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none"></div>
        
        <div 
          ref={scrollContainerRef}
          className="h-full overflow-y-auto overflow-x-hidden hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="space-y-2">
            {leaderboardData.map((user) => {
              const stepsGoal = user.email === userEmail ? getStepsGoal() : 10000;
              return (
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
                        <p className="font-medium text-gray-100">{user.name}</p>
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
                      {user.email !== userEmail && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleChallenge(user);
    }}
    disabled={user.challengePending}
    className={`px-3 py-1 text-sm font-medium text-white rounded-lg shadow-md transition-transform hover:scale-105 ${
      user.challengePending 
        ? 'bg-gray-600 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700'
    }`}
  >
    {user.challengePending ? 'Challenge Pending' : 'Challenge'}
  </button>
)}
                      {user.email === userEmail && (
                        <div className="flex flex-col space-y-2 items-end">
                          <div className="w-22">
                            <p className="text-xs text-gray-400 mb-1">Steps Progress</p>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-fuchsia-500 h-2 rounded-full"
                                style={{ width: `${Math.min((user.steps / stepsGoal) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setShowProfile(true)}
                            className="px-3 py-1 text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg shadow-md transition-transform hover:scale-105"
                          >
                            Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );  
};

  // Rest of the component remains the same...
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
            <PlayerMap/>
          </CardContent>
        </Card>

      </div>
    </div>
    

  );
};

export default Home;

