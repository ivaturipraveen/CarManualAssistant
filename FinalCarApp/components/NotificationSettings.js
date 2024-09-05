import React, { useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

const NotificationSettings = ({ servicingDate, distanceTravelled }) => {
  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            Alert.alert('Permission needed', 'You need to enable notifications to receive reminders.');
          }
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
    };

    requestPermissions();
  }, []);

  const calculateNextServiceDate = () => {
    const lastServicingDate = new Date(servicingDate);
    lastServicingDate.setFullYear(lastServicingDate.getFullYear() + 1); // Adding 12 months
    return lastServicingDate;
  };

  const checkForServiceNotification = () => {
    const nextServiceDate = calculateNextServiceDate();
    const today = new Date();
    const distance = parseFloat(distanceTravelled);

    // Check if it's time for servicing based on the date or distance travelled
    const timeForServicing = today >= nextServiceDate || distance >= 10000;

    if (timeForServicing) {
      scheduleNotification();
    } else {
      Alert.alert('Not yet', 'Your car does not require servicing yet.');
    }
  };

  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for Servicing!",
        body: "It's time to service your car based on the last service date or distance traveled.",
      },
      trigger: { seconds: 2 }, // Immediate notification for demo purposes
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Check for Service" onPress={checkForServiceNotification} />
    </View>
  );
};

export default NotificationSettings;
