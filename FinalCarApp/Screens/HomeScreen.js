import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const { width, height } = Dimensions.get('window');

const carData = [
    {
        id: 1,
        name: 'Grand i10 NIOS',
        rate: 20,
        image: require('../assets/Car1.jpg'),
        features: {
            horsepower: 265,
            mileage: "28 MPG / 8.5 L/100km",
            speedLimit: "155 mph",
            seating: 4,
            luggage: 3,
            safety: 5,
        },
    },
    {
        id: 2,
        name: 'Hyundai i20 N Line',
        rate: 35,
        image: require('../assets/Car2.jpg'),
        features: {
            horsepower: 120,
            mileage: "40 MPG / 5.9 L/100km",
            speedLimit: "140 mph",
            seating: 5,
            luggage: 4,
            safety: 5,
        },
    },
    {
        id: 3,
        name: 'Hyundai VERNA',
        rate: 20,
        image: require('../assets/Car3.jpg'),
        features: {
            horsepower: 158,
            mileage: "35 MPG / 6.7 L/100km",
            speedLimit: "130 mph",
            seating: 5,
            luggage: 5,
            safety: 5,
        },
    },
    {
        id: 4,
        name: 'Hyundai CRETA',
        rate: 20,
        image: require('../assets/Car4.jpg'),
        features: {
            horsepower: 115,
            mileage: "37 MPG / 6.4 L/100km",
            speedLimit: "125 mph",
            seating: 5,
            luggage: 5,
            safety: 5,
        },
    },
    {
        id: 5,
        name: 'Hyundai VENUE',
        rate: 20,
        image: require('../assets/Car5.jpg'),
        features: {
            horsepower: 118,
            mileage: "34 MPG / 6.9 L/100km",
            speedLimit: "120 mph",
            seating: 5,
            luggage: 4,
            safety: 5,
        },
    },
    {
        id: 6,
        name: 'Hyundai IONIQ 5',
        rate: 20,
        image: require('../assets/Car6.png'),
        features: {
            horsepower: 320,
            mileage: "300 MPG / 8.5 L/100km",
            speedLimit: "155 mph",
            seating: 5,
            luggage: 5,
            safety: 5,
        },
    },
];

const CarComponent = ({ car }) => {
    const renderIcons = (feature, count) => {
        let icons = [];
        let iconName = feature === 'safety' ? 'star' : feature === 'luggage' ? 'bag-checked' : 'human-male';
        for (let i = 0; i < count; i++) {
            icons.push(
                <MaterialCommunityIcons
                    key={i}
                    name={iconName}
                    size={20}
                    color="yellow"
                />
            );
        }
        return icons;
    };

    return (
        <View style={styles.carContainer}>
            <Image source={car.image} style={styles.carImage} />
            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{car.name}</Text>
                <Text style={styles.rate}>{car.rate}$ per day</Text>

                <View style={styles.detailsGrid}>
                    <View style={styles.detailBox}>
                        <MaterialIcons name="speed" size={20} color="yellow" />
                        <Text style={styles.detail}>{car.features.horsepower} HP</Text>
                        <Text style={styles.detailLabel}>Power</Text>
                    </View>

                    <View style={styles.detailBox}>
                        <MaterialIcons name="ev-station" size={20} color="yellow" />
                        <Text style={styles.detail}>{car.features.mileage}</Text>
                        <Text style={styles.detailLabel}>Mileage</Text>
                    </View>

                    <View style={styles.detailBox}>
                        <MaterialIcons name="speed" size={20} color="yellow" />
                        <Text style={styles.detail}>{car.features.speedLimit}</Text>
                        <Text style={styles.detailLabel}>Speed Limit</Text>
                    </View>

                    <View style={styles.detailBox}>
                        <View style={styles.iconsContainer}>
                            {renderIcons('people', car.features.seating)}
                        </View>
                        <Text style={styles.detailLabel}>People</Text>
                    </View>

                    <View style={styles.detailBox}>
                        <View style={styles.iconsContainer}>
                            {renderIcons('luggage', car.features.luggage)}
                        </View>
                        <Text style={styles.detailLabel}>Bags</Text>
                    </View>

                    <View style={styles.detailBox}>
                        <View style={styles.iconsContainer}>
                            {renderIcons('safety', car.features.safety)}
                        </View>
                        <Text style={styles.detailLabel}>Safety</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const HomeScreen = () => {
    const scrollViewRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const nextIndex = (prevIndex + 1) % carData.length;
                scrollViewRef.current.scrollTo({ x: nextIndex * width, animated: true });
                return nextIndex;
            });
        }, 3000); // 3000 ms = 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000', '#111']}
                style={styles.scrollGradient}
            >
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    style={styles.scrollView}
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.floor(event.nativeEvent.contentOffset.x / width);
                        setCurrentIndex(index);
                    }}
                >
                    {carData.map(car => (
                        <CarComponent key={car.id} car={car} />
                    ))}
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollGradient: {
        flex: 1,
        position: 'relative',
        width: width,
        height: '200%'
    },
    carContainer: {
        width,
        height: height * 0.85,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        backgroundColor: 'black',
        borderRadius: 10,
        overflow: 'hidden',
    },
    carImage: {
        width: '100%',
        height: '40%',
        resizeMode: 'cover', // 'cover' will crop the image while maintaining its aspect ratio
        borderRadius: 35,
    },
    detailsContainer: {
        width: '100%',
        height: '45%',
        padding: 10, // Adjusted padding
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 5,
    },
    rate: {
        fontSize: 18,
        color: 'yellow',
        textAlign: 'center',
        marginBottom: 10,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    detailBox: {
        backgroundColor: '#333',
        padding: 10,
        width: '30%', // Adjust width to fit 3 items per row
        marginVertical: 6,
        marginHorizontal: 5, // Added horizontal margin
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3,
    },
    iconsContainer: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    detail: {
        color: '#FFF',
        fontSize: 14,
        marginTop: 2,
    },
    detailLabel: {
        color: 'grey',
        fontSize: 12,
    },
});

export default HomeScreen;