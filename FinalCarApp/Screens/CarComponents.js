import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Linking, StyleSheet } from 'react-native';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const spareParts = [
    { id: '1', name: 'Oil Filter', price: 'Rs 400/-', link: 'https://www.amazon.in/MANN-FILTER-HU-816-Oil-Filter/dp/B001DRHMRI', image: require('../assets/oilfilters.jpeg') },
    { id: '2', name: 'Air Filter', price: 'Rs 450/-', link: 'https://www.amazon.in/Auto-Spare-World-Hyundai-2007-2014/dp/B07FZHR18G', image: require('../assets/Airfilter.jpg') },
    { id: '3', name: 'Brake Pads', price: 'Rs 1,499/-', link: 'https://www.amazon.in/MECHDEALS-Front-Break-VERITO-eVERITO/dp/B0D8W4QXYB', image: require('../assets/Brakepads.png') },
    { id: '4', name: 'Spark Plugs', price: 'Rs 600/-', link: 'https://www.amazon.in/NIKAVI-Compatible-Splendor-Models-Passion/dp/B07VVR5JBC', image: require('../assets/sparkplugs.webp') },
    { id: '5', name: 'Wind Wipers', price: 'Rs 1,285/-', link: 'https://www.amazon.in/Bosch-3397118980-Performance-Trusted-Conventional/dp/B00BJLTVMM', image: require('../assets/Windshield wipers.jpeg') },
    { id: '6', name: 'Battery', price: 'Rs 449/-', link: 'https://www.amazon.in/Amaron-Go-00095D26R-65Ah-Front-Battery/dp/B00PY59TZS', image: require('../assets/battery.jpg') },
    { id: '7', name: 'Tires', price: 'Rs 6,999/-', link: 'https://www.amazon.in/MRF-ZVTV-195-Tubeless-Tyre/dp/B00Y0U3YKE', image: require('../assets/Tyres.webp') },
    { id: '8', name: 'Headlight Bulbs', price: 'Rs 6,416/-', link: 'https://www.amazon.in/LEDBeam-Automotive-22000Lm-headlight-2bulbs/dp/B0BK91HNWK', image: require('../assets/Headlight.jpg') },
    { id: '9', name: 'Brake Fluid', price: 'Rs 249/-', link: 'https://www.amazon.in/Bosch-1987479207GEH-ENV-Brake-Fluid/dp/B076X3767Y', image: require('../assets/battery.jpg') },
];

const CarComponents = () => {
    const renderItem = ({ item }) => (
        <View style={styles.partContainer}>
            <View style={styles.partDetails}>
                <Image source={item.image} style={styles.partImage} />
                <View style={styles.partInfo}>
                    <Text style={styles.partName}>{item.name}</Text>
                    <Text style={styles.partPrice}>{item.price}</Text>
                </View>
            </View>
            <View style={styles.partOrder}>
                <Text 
                    style={styles.orderLink}
                    onPress={() => Linking.openURL(item.link)}
                >
                    Order Now
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={spareParts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 15,
    },
    list: {
        flex: 1,
    },
    partContainer: {
        backgroundColor: '#333',
        borderRadius: 12,
        padding: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    partDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    partImage: {
        width: 80,
        height: 80,
        marginRight: 12,
        borderRadius: 8,
    },
    partInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    partName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    partPrice: {
        fontSize: 16,
        color: '#FFFFFF',
        marginTop: 4,
    },
    partOrder: {
        alignItems: 'center',
    },
    orderLink: {
        fontSize: 16,
        color: '#f4c35b',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end', // Align the text to the right end
        textAlign: 'right', // Align the text content to the right
        width: '100%', // Ensures the text takes the full width of the container
    },
    
});

export default CarComponents;
