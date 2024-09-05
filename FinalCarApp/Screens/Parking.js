import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Alert, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout,Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const Parking = () => {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [places, setPlaces] = useState([]);
  const mapRef = useRef(null);

  // Manual data for parking locations
  const manualParkings = [

    { id: 'manual-parking-2', lat: 16.5602234, lon: 81.5255278, name: 'Vishnu Engieering College', type: 'parking' },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      fetchPlaces(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchPlaces = async (latitude, longitude) => {
    const overpassUrl = `
        [out:json];
        (
          node[amenity=parking](around:150000,${latitude},${longitude});
        );
        out;
      `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassUrl)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Fetched Data:", data);
      if (data.elements) {
        const combinedPlaces = [
          ...data.elements.filter(place => place.tags?.amenity === 'parking').map(place => ({
            id: place.id,
            lat: place.lat,
            lon: place.lon,
            name: place.tags?.name || "Parking Lot",
            type: 'parking',
          })),
          ...manualParkings,
        ];
        setPlaces(combinedPlaces);
      } else {
        console.error("No elements in API response");
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...region,
        latitudeDelta: region.latitudeDelta * 0.8,
        longitudeDelta: region.longitudeDelta * 0.8,
      }, 1000);
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...region,
        latitudeDelta: region.latitudeDelta * 1.2,
        longitudeDelta: region.longitudeDelta * 1.2,
      }, 1000);
    }
  };

  const centerOnUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    }
  };

  if (!region) {
    return (
      <View style={styles.container}>
        <MapView style={styles.map} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
        ref={mapRef}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title={"You are here"}
            pinColor={"red"}
          />
        )}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lon }}
            pinColor={"blue"}// Adjust color if needed
          >
            <Callout>
              <View>
                <Text>{place.name || "Location"}</Text>
                <Text>Latitude: {place.lat}</Text>
                <Text>Longitude: {place.lon}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
         {location && (
          <>
            <Circle
              center={{ latitude: location.latitude, longitude: location.longitude }}
              radius={50000}
              strokeColor="gray"
              fillColor="rgba(128,128,128,0.2)"
            />
            <Circle
              center={{ latitude: location.latitude, longitude: location.longitude }}
              radius={100000}
              strokeColor="gray"
              fillColor="rgba(128,128,128,0.2)"
            />
          </>
        )}
      </MapView>
      <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.zoomButton, styles.zoomOutButton]} onPress={zoomOut}>
        <MaterialIcons name="remove" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.locationButton} onPress={centerOnUserLocation}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.labelContainer}>
      <View style={styles.labelItem}>
          <MaterialIcons name="location-pin" size={24} color="red" />
          <Text style={styles.labelText}>Your location</Text>
        </View>
        
        <View style={styles.labelItem}>
          <MaterialIcons name="location-pin" size={24} color="blue" />
          <Text style={styles.labelText}>Parking locations</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  zoomButton: {
    position: 'absolute',
    bottom: 125,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30,
    padding: 10,
    zIndex: 1,
  },
  zoomOutButton: {
    bottom: 70,
  },
  locationButton: {
    position: 'absolute',
    bottom: 185,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30,
    padding: 10,
    zIndex: 1,
  },
  labelContainer: {
    position: 'absolute',
    top: 50,
    right: 15,
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 10,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  labelText: {
    fontSize: 14,
    color: 'black',
    marginLeft: 5,
  },
});

export default Parking;