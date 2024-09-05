import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../firebaseConfig';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);


const ProfileScreen = ({ navigation }) => {
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        carModel: '',
        carYear: '',
        licensePlate: '',
        engineNumber: '',
        profilePicture: ''
    });
    const [imageUri, setImageUri] = useState('');
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const storageRef = ref(storage,    `${user.uid}/profiles/profile.json`);
                    try {
                        const profileSnapshot = await getDownloadURL(storageRef);
                        const response = await fetch(profileSnapshot);
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        const profileData = await response.json();
                        setProfile(profileData);
                        setImageUri(profileData.profilePicture || '');
                    } catch (fetchError) {
                        if (fetchError.code === 'storage/object-not-found') {
                            console.log('Profile does not exist for this user.');
                            setProfile({
                                fullName: '',
                                email: '',
                                phoneNumber: '',
                                address: '',
                                carModel: '',
                                carYear: '',
                                licensePlate: '',
                                engineNumber: '',
                                profilePicture: ''
                            });
                        } else {
                            console.error('Failed to fetch profile:', fetchError);
                            Alert.alert("Error", "Failed to load profile. Please check your network connection and try again.");
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load profile.", error);
                Alert.alert("Error", "Failed to load profile. Please check your network connection and try again.");
            }
        };

        loadProfile();
    }, []);

    const handleInputChange = (key, value) => {
        setProfile({ ...profile, [key]: value });
    };

    const uploadProfilePicture = async (uri) => {
        if (!uri) return '';
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const fileName = uri.substring(uri.lastIndexOf('/') + 1);
            const storageRef = ref(storage, `${auth.currentUser.uid}/profilePictures/${fileName}`);
            await uploadBytes(storageRef, blob);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error("Failed to upload profile picture.", error);
            Alert.alert("Error", "Failed to upload profile picture. Please try again.");
        }
    };

    const saveProfile = async () => {
        try {
            let updatedProfile = { ...profile };
            if (imageUri) {
                updatedProfile.profilePicture = await uploadProfilePicture(imageUri);
            }
            const user = auth.currentUser;
            if (user) {
                const profileData = JSON.stringify(updatedProfile);
                const blob = new Blob([profileData], { type: 'application/json' });
                const storageRef = ref(storage, `${user.uid}/profiles/profile.json`);
                await uploadBytes(storageRef, blob);
                Alert.alert('Profile saved!');
                setIsEditable(false);
            }
        } catch (error) {
            console.error("Failed to save profile.", error);
            Alert.alert("Error", "Failed to save profile. Please try again.");
        }
    };

    const requestMediaLibraryPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status === 'granted') {
            setPermissionsGranted(true);
        } else {
            Alert.alert('Permission Required', 'Sorry, we need media library permissions to pick an image.');
        }
    };

    const selectProfilePicture = async () => {
        if (!permissionsGranted) {
            await requestMediaLibraryPermissions();
            if (!permissionsGranted) return;
        }
    
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });
    
            if (!result.canceled) {
                const selectedImage = result.assets[0];
                setImageUri(selectedImage.uri);
                setProfile({ ...profile, profilePicture: selectedImage.uri });
            } else if (result.errorCode) {
                console.error('ImagePicker Error: ', result.errorMessage);
                Alert.alert('Error', 'An error occurred while selecting the image. Please try again.');
            }
        } catch (error) {
            console.error('ImagePicker Error: ', error);
            Alert.alert('Error', 'An error occurred while opening the image picker. Please try again.');
        }
    };

    const toggleEditProfile = () => {
        setIsEditable(!isEditable);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            
            <View style={styles.card}>
                <View style={styles.profilePictureContainer}>
                    <TouchableOpacity onPress={selectProfilePicture} disabled={!isEditable}>
                        <Image
                            source={profile.profilePicture ? { uri: profile.profilePicture } : require('../assets/default-profile.png')}
                            style={styles.profilePicture}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <FontAwesome name="user" size={20} color="#fff" />
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabledInput]}
                        placeholder="Full Name"
                        value={profile.fullName}
                        onChangeText={(text) => handleInputChange('fullName', text)}
                        editable={isEditable}
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={20} color="#fff" />
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabledInput]}
                        placeholder="Email Address"
                        value={profile.email}
                        onChangeText={(text) => handleInputChange('email', text)}
                        editable={isEditable}
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <FontAwesome name="phone" size={20} color="#fff" />
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabledInput]}
                        placeholder="Phone Number"
                        value={profile.phoneNumber}
                        onChangeText={(text) => handleInputChange('phoneNumber', text)}
                        editable={isEditable}
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={styles.inputContainer}>
                <MaterialIcons name="location-on" size={20} color="#fff" />

                    <TextInput
                        style={[styles.input, !isEditable && styles.disabledInput]}
                        placeholder="Address"
                        value={profile.address}
                        onChangeText={(text) => handleInputChange('address', text)}
                        editable={isEditable}
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <FontAwesome name="car" size={20} color="#fff" />
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabledInput]}
                        placeholder="Car Model"
                        value={profile.carModel}
                        onChangeText={(text) => handleInputChange('carModel', text)}
                        editable={isEditable}
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                <TextInput
                        style={[styles.input, !isEditable && styles.disabledInput]}
                        placeholder="Car Year"
                        value={profile.carYear}
                        onChangeText={(text) => handleInputChange('carYear', text)}
                        editable={isEditable}
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <FontAwesome name="id-card" size={20} color="#fff" />
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabledInput]}
                        placeholder="License Plate Number"
                        value={profile.licensePlate}
                        onChangeText={(text) => handleInputChange('licensePlate', text)}
                        editable={isEditable}
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <FontAwesome name="gears" size={20} color="#fff" />
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabledInput]}
                        placeholder="Engine Number"
                        value={profile.engineNumber}
                        onChangeText={(text) => handleInputChange('engineNumber', text)}
                        editable={isEditable}
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={styles.buttonContainer}>
                    {isEditable ? (
                        <>
                         <TouchableOpacity style={styles.button} onPress={toggleEditProfile}>
                                <Text style={styles.buttonText}>Cancel Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={saveProfile}>
                                <Text style={styles.buttonText}>Save Profile</Text>
                            </TouchableOpacity>
                           
                        </>
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={toggleEditProfile}>
                            <Text style={styles.buttonText}>Edit Profile</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#000',
        paddingVertical: 20,
        paddingHorizontal: 18,
    },
    card: {
        backgroundColor: '#333',
        borderRadius: 20,
        padding: 5,
        marginBottom: 10,
        elevation: 5,
        alignItems: 'center',
        shadowColor: '#000',
    },
    profilePictureContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profilePicture: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        paddingBottom: 5,
    },
    input: {
        flex: 1,
        color: '#fff',
        paddingHorizontal: 20,
    },
    disabledInput: {
        color: '#fff',
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around', // Ensures space between buttons
        width: '100%', // Ensures the container spans full width
    },
    button: {
        backgroundColor: '#f4c35b',
        borderRadius: 20, 
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginVertical: 5,
        width: '40%',
    },
    buttonText: {
        color: '#000', 
        fontSize: 16,
    },
});

export default ProfileScreen;