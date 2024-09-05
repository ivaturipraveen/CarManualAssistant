import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Alert, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const Map = () => {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [places, setPlaces] = useState([]);
  const mapRef = useRef(null);

  // Manual data for fuel stations and showrooms
  const manualFuelStations = [
    { id: 'manual-fuel-1', lat: 16.586184327400154, lon: 81.46412705708065, name: 'Bharat Petroleum, Petrol Pump -Sai Petro Products', type: 'fuel' },
    { id: 'manual-fuel-2', lat: 16.54414515053277, lon: 81.51092171520276, name: 'Bharat Petroleum BP Petrol Bunk', type: 'fuel' },
    { id: 'manua;-fuel-3', lat: 16.548074533113105, lon: 81.51534770750706, name: 'IndianOil, Petrol Pump', type: 'fuel' },
    { id: 'manua;-fuel-4', lat: 16.548423020209995, lon: 81.51499866844779, name: 'HP Petrol Pump-RAMA Service Station', type: 'fuel' },
    { id: 'manua;-fuel-5', lat: 16.546426434704312, lon: 81.52703486862838, name: 'BharatPetroleum, Petrol Pump', type: 'fuel' },
    { id: 'manua;-fuel-6', lat: 16.5565716254027, lon: 81.5229699379432, name: 'IPB LPG, Petrol bunk', type: 'fuel' },
    { id: 'manua;-fuel-7', lat: 16.565360995571385, lon: 81.19815912516786, name: 'Bharat Petroleum, Petrol Pump', type: 'fuel' },
  ];

  const manualShowrooms = [
    { id: 'manual-showroom-1', lat: 16.5502371991723865, lon: 80.63352424645866, name: 'Kusalava Hyunda Vijayawada', type: 'showroom' },
    { id: 'manual-showroom-2', lat: 37.78925, lon: -122.4354, name: 'Manual Showroom 2', type: 'showroom' },
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
          node[shop=car](around:100000,${latitude},${longitude});
          node[fuel](around:10000,${latitude},${longitude});
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
          ...data.elements.filter(place => place.tags?.shop === 'car').map(place => ({
            id: place.id,
            lat: place.lat,
            lon: place.lon,
            name: place.tags?.name || "Car Showroom",
            type: 'showroom',
          })),
          ...data.elements.filter(place => place.tags?.fuel).map(place => ({
            id: place.id,
            lat: place.lat,
            lon: place.lon,
            name: place.tags?.name || "Fuel Station",
            type: 'fuel',
          })),
          ...manualShowrooms,
          ...manualFuelStations,
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
            pinColor={place.type === 'showroom' ? "blue" : (place.type === 'fuel' ? "green" : "gray")}
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
          <MaterialIcons name="location-pin" size={24} color="green" />
          <Text style={styles.labelText}>Petrol Bunks</Text>
        </View>
        <View style={styles.labelItem}>
          <MaterialIcons name="location-pin" size={24} color="blue" />
          <Text style={styles.labelText}>Car Showrooms</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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

export default Map;
