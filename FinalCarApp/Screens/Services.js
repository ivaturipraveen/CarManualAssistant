import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const Services = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.iconWrapper}
            onPress={() => navigation.navigate('UpdateDetails')}
          >
            <Image 
              source={require('../assets/mands.png')} // Replace with your icon source
              style={styles.icon}
            />
            <Text style={styles.iconLabel}>Mechanical Service</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconWrapper}
           onPress={() => navigation.navigate('Parking')}
          >
            <Image 
              source={require('../assets/park.png')} // Replace with your icon source
              style={styles.icon}
            />
            <Text style={styles.iconLabel}>Parking Assistance</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.iconWrapper}
           onPress={() => navigation.navigate('Documents')}
          >
            <Image 
              source={require('../assets/carins.png')} // Replace with your icon source
              style={styles.icon}
            />
            <Text style={styles.iconLabel}>Document Management</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconWrapper}
           onPress={() => navigation.navigate('CarComponents')}
          >
            <Image 
              source={require('../assets/oserv.jpg')} // Replace with your icon source
              style={styles.icon}
            />
            <Text style={styles.iconLabel}>Other services</Text>
          </TouchableOpacity>
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
    backgroundColor: '#000',
  },
  card: {
    backgroundColor: 'black', // Grey background for the card
    borderRadius: 10,
    padding: 20,
    margin: 10,
    width: '100%', // Adjust width as needed
    elevation: 5, // Shadow for Android
    shadowColor: 'black', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.5, // Shadow opacity for iOS
    shadowRadius: 5, // Shadow radius for iOS
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  icon: {
    width: 160,
    height: 100,
    borderWidth: 0.5, // Adding border width
    borderColor: 'black', // Slightly darker border color
    borderRadius: 6, // Slightly rounded corners
    marginBottom: 10,
  },
  iconLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // White text color
  },
});

export default Services;
