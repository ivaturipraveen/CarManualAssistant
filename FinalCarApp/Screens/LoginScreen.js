import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getDownloadURL, ref, getBlob } from 'firebase/storage'; // Import Firebase Storage functions
import { auth, storage } from '../firebaseConfig'; // Import your Firebase configuration
import AsyncStorage from '@react-native-async-storage/async-storage'; // For secure storage
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import signInWithEmailAndPassword function
import { Ionicons } from '@expo/vector-icons'; // Importing icons
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [mpin, setMpin] = useState('');
    const [useMpin, setUseMpin] = useState(false); // Flag to toggle between email/password and MPIN

    const handleLogin = async () => {
        if (useMpin) {
            try {
                // Fetch the user data JSON from Firebase Storage
                const user = auth.currentUser;
                if (user) {
                    const storageRef = ref(storage,`${user.uid}/users/userdata.json`);
                    const url = await getDownloadURL(storageRef);
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.phoneNumber === phoneNumber && data.mpin === mpin) {
                        console.log('MPIN login successful');
                        navigation.replace('MainTabNavigator');
                    } else {
                        Alert.alert('Login Error', 'Invalid phone number or MPIN');
                    }
                } else {
                    Alert.alert('Login Error', 'No user is currently logged in');
                }
            } catch (error) {
                console.error('Error logging in with MPIN:', error);
                Alert.alert('Login Error', error.message);
            }
        } else {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log('User logged in:', userCredential.user);
                navigation.replace('MainTabNavigator');
            } catch (error) {
                console.error('Error logging in:', error);
                Alert.alert('Login Error', error.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.cardTitle}>
                <Text style={styles.title}>Login</Text>

                <TouchableOpacity onPress={() => setUseMpin(!useMpin)} style={styles.toggleButton}>
                    <Text style={styles.toggleButtonText}>
                        {useMpin ? 'Login with Email/Password' : 'Login with MPIN'}
                    </Text>
                </TouchableOpacity>

                {!useMpin ? (
                    <>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#FFFFFF" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                placeholderTextColor="#FFFFFF"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor="#FFFFFF"
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color="#FFFFFF" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                placeholderTextColor="#FFFFFF"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Ionicons name="key-outline" size={20} color="#FFFFFF" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="MPIN"
                                value={mpin}
                                onChangeText={setMpin}
                                secureTextEntry
                                placeholderTextColor="#FFFFFF"
                                keyboardType="numeric"
                                maxLength={4}
                            />
                        </View>
                    </>
                )}

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                    <Ionicons name="arrow-forward-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#000', // Set the background color to black
    },
    cardTitle: {
        width: '85%',
        backgroundColor: '#333', // Slightly lighter black for visibility
        borderRadius: 15,
        padding: 30, // Increase padding to add more space inside the card
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        minHeight: 300, // Set a minimum height for the card to increase its length
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF', // Set the title text color to white
        marginBottom: 20, // Add margin to space the title from the input fields
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomColor: '#444', // Lighter border to differentiate from the background
        borderBottomWidth: 1,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        color: '#FFFFFF', // Set the input text color to white
    },
    button: {
        backgroundColor: '#f4c35b',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 30, // Add margin to create space between the input fields and the button
    },
    buttonText: {
        fontSize: 18,
        color: '#000',
        fontWeight: 'bold',
        marginRight: 10,
    },
    link: {
        color: '#f4c35b',
        marginTop: 16,
        fontSize: 16,
    },
    toggleButton: {
        backgroundColor: '#444',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    toggleButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
    },
});

export default LoginScreen;