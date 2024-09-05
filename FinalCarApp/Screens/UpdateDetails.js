import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions, Linking } from 'react-native';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import Icon from 'react-native-vector-icons/FontAwesome';


const { width } = Dimensions.get('window');

const UpdateDetails = () => {
  const [mechanics, setMechanics] = useState([]);
  const [newMechanic, setNewMechanic] = useState({ name: '', latitude: '', longitude: '', phone: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [filteredMechanics, setFilteredMechanics] = useState({ under1km: [], under5km: [], under10km: [] });
  const [showMechanicForm, setShowMechanicForm] = useState(false);

  const auth = getAuth();
  const storage = getStorage();

  useEffect(() => {
    const fetchUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      setNewMechanic({
        ...newMechanic,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString()
      });
    };

    const fetchMechanics = async () => {
      const userId = auth.currentUser.uid;
      const storageRef = ref(storage, `${userId}/maintenance/mechanics.json`);
      try {
        const url = await getDownloadURL(storageRef);
        const response = await fetch(url);
        const data = await response.json();
        setMechanics(data);
      } catch (error) {
        console.error('Error fetching mechanics: ', error);
      }
    };

    fetchUserLocation();
    fetchMechanics();
  }, []);

  useEffect(() => {
    if (userLocation) {
      filterMechanicsByDistance();
    }
  }, [userLocation, mechanics]);

  const filterMechanicsByDistance = () => {
    const under1km = [];
    const under5km = [];
    const under10km = [];

    mechanics.forEach(mechanic => {
      const distance = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: mechanic.latitude, longitude: mechanic.longitude }
      );
      const distanceInKm = distance / 1000;

      if (distanceInKm <= 1) under1km.push(mechanic);
      else if (distanceInKm <= 5) under5km.push(mechanic);
      else if (distanceInKm <= 10) under10km.push(mechanic);
    });

    setFilteredMechanics({ under1km, under5km, under10km });
  };

  const handleAddMechanic = () => {
    const updatedMechanics = [...mechanics, newMechanic];
    setMechanics(updatedMechanics);
    setNewMechanic({ name: '', latitude: '', longitude: '', phone: '' });
    setShowMechanicForm(false);
    saveMechanicsToFirebase(updatedMechanics);
  };

  const handleCancel = () => {
    setShowMechanicForm(false);
    setNewMechanic({ name: '', latitude: '', longitude: '', phone: '' });
  };

  const saveMechanicsToFirebase = async (mechanicsData) => {
    const userId = auth.currentUser.uid;
    const jsonDetails = JSON.stringify(mechanicsData);
    const blob = new Blob([jsonDetails], { type: 'application/json' });
    const storageRef = ref(storage, `${userId}/maintenance/mechanics.json`);

    try {
      await uploadBytes(storageRef, blob);
      console.log('Mechanics saved to Firebase Storage');
    } catch (error) {
      console.error('Error saving mechanics to Firebase Storage: ', error);
    }
  };

  const isFormComplete = () => {
    const { name, latitude, longitude, phone } = newMechanic;
    return name !== '' && latitude !== '' && longitude !== '' && phone !== '';
  };
  const renderMechanicsList = (mechanicsList, title) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {mechanicsList.length === 0 ? (
        <Text style={styles.noMechanics}>No mechanics found in this range.</Text>
      ) : (
        mechanicsList.map((mechanic, index) => (
          <View key={index} style={styles.mechanicItem}>
            <View style={styles.mechanicDetails}>
              <Text style={styles.mechanicText}>Name: {mechanic.name}</Text>
                <Text style={styles.mechanicText}>Phone: {mechanic.phone}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => Linking.openURL(`tel:${mechanic.phone}`)}
            >
              <Icon name="phone" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
  

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Latitude and Longitude Input Fields */}
          <View style={styles.inputContainer}>
            <Text style={styles.title}>Current Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Latitude"
              value={userLocation ? userLocation.latitude.toString() : ''}
              editable={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Longitude"
              value={userLocation ? userLocation.longitude.toString() : ''}
              editable={false}
            />
          </View>

          {/* Mechanic Form */}
          {showMechanicForm && (
            <View style={styles.mechanicsContainer}>
              <Text style={styles.title}>Add Mechanic</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={newMechanic.name}
                onChangeText={(text) => setNewMechanic({ ...newMechanic, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Latitude"
                value={newMechanic.latitude}
                onChangeText={(text) => setNewMechanic({ ...newMechanic, latitude: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Longitude"
                value={newMechanic.longitude}
                onChangeText={(text) => setNewMechanic({ ...newMechanic, longitude: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={newMechanic.phone}
                onChangeText={(text) => setNewMechanic({ ...newMechanic, phone: text })}
                keyboardType="phone-pad"
              />
              <View style={styles.formButtonContainer}>
                <TouchableOpacity
                  style={[styles.button, !isFormComplete() && styles.buttonDisabled]}
                  onPress={handleAddMechanic}
                  disabled={!isFormComplete()}
                >
                  <Text style={styles.buttonText}>Add Mechanic</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mechanics Lists */}
          {renderMechanicsList(filteredMechanics.under1km, 'Mechanics within 1 km')}
          {renderMechanicsList(filteredMechanics.under5km, 'Mechanics within 5 km')}
          {renderMechanicsList(filteredMechanics.under10km, 'Mechanics within 10 km')}
        </View>
      </ScrollView>

      {/* Add Mechanic Button */}
      {!showMechanicForm && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setShowMechanicForm(true)}>
            <Text style={styles.buttonText}>Add Mechanic</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#444',
    color: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#000',
    
  },
  button: {
    backgroundColor: '#f4c35b',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 15,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    borderRadius: 15,
  },
  buttonDisabled: {
    backgroundColor: '#444',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  mechanicsContainer: {
    marginBottom: 20,
  },
  mechanicItem: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  mechanicText: {
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  noMechanics: {
    color: '#fff',
  },
  formButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callButton: {
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 300,
    marginTop:-30,
  },
  callButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18, // Adjust size to fit your icon
  },
});

export default UpdateDetails;