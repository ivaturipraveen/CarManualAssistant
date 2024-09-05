import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes } from 'firebase/storage'; // Import Firebase Storage functions
import { auth, storage } from '../firebaseConfig'; // Import your Firebase configuration
import { Ionicons } from '@expo/vector-icons'; // Importing icons
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [mpin, setMpin] = useState('');
    const [confirmMpin, setConfirmMpin] = useState('');

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (mpin !== confirmMpin) {
            Alert.alert('Error', 'MPINs do not match');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Prepare the data to store in Firebase Storage
            const userData = {
                email: email,
                phoneNumber: phoneNumber,
                password:password,
                mpin: mpin,
            };

            // Convert user data to a JSON string and upload it to Firebase Storage
            const userBlob = new Blob([JSON.stringify(userData)], { type: 'application/json' });
            const storageRef = ref(storage, `${user.uid}/users/userdata.json`);

            await uploadBytes(storageRef, userBlob);
            console.log('User data stored in Firebase Storage');

            navigation.replace('Login');
        } catch (error) {
            console.error('Error registering:', error);
            Alert.alert('Registration Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.cardTitle}>
                <Text style={styles.title}>Register</Text>
                
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
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholderTextColor="#FFFFFF"
                    />
                </View>
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
                        maxLength={4} // Restrict MPIN to 4 digits
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Ionicons name="key-outline" size={20} color="#FFFFFF" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm MPIN"
                        value={confirmMpin}
                        onChangeText={setConfirmMpin}
                        secureTextEntry
                        placeholderTextColor="#FFFFFF"
                        maxLength={4} // Restrict MPIN to 4 digits
                    />
                </View>
                
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                    <Ionicons name="arrow-forward-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // Keep your existing styles
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
        minHeight: 350, // Set a minimum height for the card to increase its length
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
});

export default RegisterScreen;
