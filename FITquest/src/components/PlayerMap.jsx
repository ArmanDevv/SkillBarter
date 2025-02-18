import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
import ReactDOMServer from 'react-dom/server';

// Custom map style - Light modern theme
const mapStyle = [
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e9e9e9"
      },
      {
        "lightness": 17
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      },
      {
        "lightness": 20
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      },
      {
        "lightness": 17
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#ffffff"
      },
      {
        "lightness": 29
      },
      {
        "weight": 0.2
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      },
      {
        "lightness": 18
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      },
      {
        "lightness": 16
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      },
      {
        "lightness": 21
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dedede"
      },
      {
        "lightness": 21
      }
    ]
  }
];

// Enhanced Avatar Marker Component with hover effect
const AvatarMarker = ({ isHovered }) => (
  <svg
    width="40"
    height="48"
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow - larger when hovered */}
    <ellipse
      cx="20"
      cy="44"
      rx={isHovered ? "8" : "6"}
      ry={isHovered ? "3" : "2"}
      fill="rgba(0,0,0,0.2)"
      style={{ transition: "all 0.3s ease" }}
    />
    {/* Pointer */}
    <path
      d="M20 28L26 38L20 46L14 38L20 28Z"
      fill={isHovered ? "#2563EB" : "#3B82F6"}
      style={{ transition: "all 0.3s ease" }}
    />
    {/* Avatar Circle - slightly larger when hovered */}
    <circle
      cx="20"
      cy="16"
      r={isHovered ? "15" : "14"}
      fill={isHovered ? "#2563EB" : "#3B82F6"}
      stroke="white"
      strokeWidth="2"
      style={{ transition: "all 0.3s ease" }}
    />
    {/* Generic Person Icon */}
    <path
      d="M20 8a4 4 0 100 8 4 4 0 000-8zm-6 18c0-3.3 4-5 6-5s6 1.7 6 5"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const PlayerMap = () => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '0.75rem'
  };

  // Function to create custom marker icon
  const createCustomMarker = (isHovered) => {
    const svgString = encodeURIComponent(
      ReactDOMServer.renderToString(<AvatarMarker isHovered={isHovered} />)
    ).replace(/'/g, '%27').replace(/"/g, '%22');

    return {
      url: `data:image/svg+xml,${svgString}`,
      scaledSize: new window.google.maps.Size(40, 48),
      anchor: new window.google.maps.Point(20, 46),
      origin: new window.google.maps.Point(0, 0)
    };
  };

  const getMapCenter = () => {
    const loggedInEmail = localStorage.getItem("email");
    const loggedInUser = players.find(player => player.email === loggedInEmail);

    if (loggedInUser) {
      return {
        lat: Number(loggedInUser.latitude),
        lng: Number(loggedInUser.longitude)
      };
    } else if (players.length > 0) {
      return {
        lat: Number(players[0].latitude),
        lng: Number(players[0].longitude)
      };
    }
    return {
      lat: 20,
      lng: 0
    };
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('http://localhost:5000/players-location');
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkerMouseOver = (player) => {
    setHoveredPlayer(player);
  };

  const handleMarkerMouseOut = () => {
    setHoveredPlayer(null);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={getMapCenter()}
        zoom={12}
        onLoad={map => setMapRef(map)}
        options={{
          styles: mapStyle,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP
          },
          fullscreenControl: false,
          gestureHandling: 'greedy',
          backgroundColor: '#f5f5f5'
        }}
      >
        {players.map((player, index) => (
          <Marker
            key={player.email}
            position={{
              lat: Number(player.latitude) + index * 0.00001,
              lng: Number(player.longitude) + index * 0.00001
            }}
            onClick={() => setSelectedPlayer(player)}
            onMouseOver={() => handleMarkerMouseOver(player)}
            onMouseOut={handleMarkerMouseOut}
            icon={createCustomMarker(hoveredPlayer?.email === player.email)}
            zIndex={hoveredPlayer?.email === player.email ? 999 : 1}
          />
        ))}

        {selectedPlayer && (
          <InfoWindow
            position={{
              lat: Number(selectedPlayer.latitude),
              lng: Number(selectedPlayer.longitude)
            }}
            onCloseClick={() => setSelectedPlayer(null)}
          >
            <div className="p-2 min-w-[200px]">
              <div className="border-b border-gray-200 pb-2 mb-2">
                <h3 className="font-medium text-gray-900">{selectedPlayer.name}</h3>
                <p className="text-sm text-gray-600">{selectedPlayer.email}</p>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex justify-between">
                  <span>Steps:</span>
                  <span className="font-medium">{selectedPlayer.steps?.toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span>Calories:</span>
                  <span className="font-medium">{selectedPlayer.calories?.toFixed(0)}</span>
                </p>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default PlayerMap;