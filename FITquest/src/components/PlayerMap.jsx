import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import dotenv from "dotenv";
dotenv.config();

const PlayerMap = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '0.75rem'
  };

  // Center the map on the first player's location or use a default
  const getMapCenter = () => {
    if (players.length > 0) {
      return {
        lat: players[0].latitude,
        lng: players[0].longitude
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
        console.log('Fetched players:', data);
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden">
      <LoadScript googleMapsApiKey="AIzaSyCEt6aV_KOJqakf1TldZZShy74mgDwPMYE">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={getMapCenter()}
          zoom={12}
          options={{
            styles: [
              {
                featureType: 'all',
                elementType: 'all',
                stylers: [
                  { saturation: -100 },
                  { lightness: -20 }
                ]
              }
            ],
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {players.map((player) => (
            <Marker
              key={player.email}
              position={{
                lat: Number(player.latitude),
                lng: Number(player.longitude)
              }}
              onClick={() => setSelectedPlayer(player)}
              // Temporarily use a default marker until we get profile pictures working
              // icon={customMarker(player)}
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
              <div className="p-2">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedPlayer.name}</h3>
                  <p className="text-sm text-gray-600">{selectedPlayer.email}</p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Steps: {selectedPlayer.steps?.toLocaleString()}</p>
                  <p>Calories: {selectedPlayer.calories?.toFixed(0)}</p>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default PlayerMap;