import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure you have the correct import for your icon library
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const WelcomeScreen = ({ navigation }) => {
    const handleGetStarted = () => {
        navigation.navigate('Login'); // Navigate to the Login screen when the button is pressed
    };
    return (
        <ImageBackground
            source={require('../assets/welcomecar.jpg')}
            style={styles.backgroundImage}
        >
            <View style={styles.overlay}>
                <View style={styles.darkenOverlay} />
                {/* App Name */}
                <Text style={styles.appName}>Car Assistant</Text>

                {/* Caption (Description) */}
                <Text style={styles.caption}>Wheels that you want</Text>

                {/* Get Started Button */}
                <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                    <Text style={styles.buttonText}>Get Started</Text>
                    <View style={styles.arrowContainer}>
                        <Icon name="arrow-forward" size={24} color="#000000" style={styles.arrow} />
                    </View>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    darkenOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay with 50% opacity
        marginLeft: -20, // Increase the width of the overlay by moving it left
        marginRight: -20,
    },
    appName: {
        fontSize: 35,
        fontWeight: '600',
        color: '#f4c35b',
        textAlign: 'center',
        marginTop: 50,
        letterSpacing: 2,
        fontFamily: 'serif', // Replace with your desired font
    },
    caption: {
        fontSize: 30, // Larger font size for the caption
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 550, // Positioned close to the title
        fontFamily: 'serif', // Replace with your desired font
    },
    button: {
        backgroundColor: '#f4c35b', // Matching the yellow color in the image
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: '#000000',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    arrowContainer: {
        justifyContent: 'center',
        marginLeft: 10, // Space between text and arrow
    },
    arrow: {
        alignSelf: 'center', // Center the arrow vertically
    },
});

export default WelcomeScreen;