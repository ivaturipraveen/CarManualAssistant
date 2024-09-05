import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { auth, storage } from '../firebaseConfig';
import { ref, deleteObject } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const chatsFilePath = FileSystem.documentDirectory + 'chats.json';

const SideNav = ({ navigation }) => {
    const [savedChats, setSavedChats] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigation.navigate('Login');
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        loadSavedChats();
    }, []);

    const loadSavedChats = async () => {
        try {
            const fileData = await FileSystem.readAsStringAsync(chatsFilePath);
            const chatsArray = fileData ? JSON.parse(fileData) : [];
            setSavedChats(chatsArray);
        } catch (error) {
            console.error('Failed to load saved chats:', error);
        }
    };

    const handleChatPress = (chat) => {
        navigation.navigate('ChatBotContent', { chat });
    };

    const handleChatDelete = (chatId) => {
        Alert.alert(
            'Delete Chat',
            'Are you sure you want to delete this chat?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            // Delete from local file system
                            const filteredChats = savedChats.filter(chat => chat.id !== chatId);
                            await FileSystem.writeAsStringAsync(chatsFilePath, JSON.stringify(filteredChats));
                            setSavedChats(filteredChats);

                            // Delete from Firebase
                            const user = auth.currentUser;
                            if (user) {
                                const chatRef = ref(storage, `${user.uid}/chats/${chatId}.json`);
                                await deleteObject(chatRef);
                            }

                            Alert.alert('Success', 'Chat deleted successfully!');
                        } catch (error) {
                            console.error('Failed to delete chat:', error);
                            Alert.alert('Error', 'Failed to delete the chat. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderChatItem = ({ item }) => (
        <View style={styles.chatItemContainer}>
            <TouchableOpacity onPress={() => handleChatPress(item)}>
                <View style={styles.chatItem}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatDate}>{new Date(item.timestamp).toLocaleString()}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleChatDelete(item.id)}>
                <Ionicons name="trash-bin" size={24} color="#C10000" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>SAVED CHATS</Text>
            <FlatList
                data={savedChats}
                renderItem={renderChatItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.chatList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding:20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 5,
        marginTop: 25,
    },
    chatList: {
        paddingBottom: 20,
    },
    chatItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8, // Reduced padding to decrease the gap
        paddingHorizontal: 5, // Added horizontal padding for better spacing
        borderBottomWidth: 0, // Removed the border
        backgroundColor: '#f9f9f9', // Light background color
        marginBottom: 10, // Added margin to separate chat items
        borderRadius: 10, // Curved shape
        elevation: 2, // Add shadow effect on Android
        shadowColor: '#000', // Add shadow effect on iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset
        shadowOpacity: 0.2, // Shadow opacity
        shadowRadius: 2, // Shadow radius
    },
    chatItem: {
        flex: 1,
    },
    chatName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    chatDate: {
        fontSize: 14,
        color: '#666',
    },
});

export default SideNav;
