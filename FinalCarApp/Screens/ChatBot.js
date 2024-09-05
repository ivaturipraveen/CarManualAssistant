import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Image, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { askQuestion, transcribeAudio } from '../utils/api';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { storage, auth } from '../firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';
import SideNav from './SideNav';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

const chatsFilePath = FileSystem.documentDirectory + 'chats.json';

const ensureFileExists = async () => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(chatsFilePath);
        if (!fileInfo.exists) {
            await FileSystem.writeAsStringAsync(chatsFilePath, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Failed to ensure chats file exists:', error);
    }
};

const ChatBotContent = ({ navigation, route }) => {
    const [question, setQuestion] = useState('');
    const [conversation, setConversation] = useState(route.params?.chat?.conversation || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recording, setRecording] = useState(null);
    const [audioUri, setAudioUri] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        Voice.onSpeechResults = onSpeechResults;
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    useEffect(() => {
        if (route.params?.chat) {
            setConversation(route.params.chat.conversation);
        }
    }, [route.params?.chat]);

    const handleAskQuestion = async () => {
        if (!question || loading) return;

        const newConversation = [...conversation, { type: 'question', text: question }];
        setConversation(newConversation);
        setQuestion('');
        setLoading(true);
        setError('');

        try {
            const response = await askQuestion(question);
            const newAnswer = response.answer;
            const newImage = response.images;

            setConversation([...newConversation, { type: 'answer', text: newAnswer, image: newImage }]);
        } catch (error) {
            console.error('Axios request failed:', error);
            setError('Failed to fetch the answer. Please try again.');
        }
        setLoading(false);
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                console.log('Permission to access microphone is required!');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            await recording.startAsync();
            setRecording(recording);
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);
            setAudioUri(uri);
            handleTranscription(uri);
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };

    const convertAudioToWav = async (uri) => {
        try {
            const wavUri = `${FileSystem.documentDirectory}audio.wav`;
            await FileSystem.copyAsync({ from: uri, to: wavUri });
            return wavUri;
        } catch (error) {
            console.error('Error converting audio:', error);
            throw new Error('Audio conversion failed');
        }
    };

    const handleTranscription = async (uri) => {
        setLoading(true);
        setError('');

        try {
            const wavUri = await convertAudioToWav(uri);
            const transcription = await transcribeAudio(wavUri);
            const newConversation = [...conversation, { type: 'question', text: transcription }];
            setConversation(newConversation);
            setQuestion(transcription);
        } catch (error) {
            console.error('Error transcribing audio:', error.message);
            setError('Failed to transcribe the audio. Please check your network connection.');
        }

        setLoading(false);
    };

    const onSpeechResults = (event) => {
        setQuestion(event.value[0]);
    };

    const handlePlayAnswer = (text) => {
        Speech.stop();
        Speech.speak(text);
    };

    const handleRefresh = () => {
        Speech.stop();
        setConversation([]);
        setQuestion('');
        setError('');
    };

   const handleSaveChat = async () => {
    setLoading(true); // Optionally show loading indicator during the save process
    await ensureFileExists();

    try {
        const timestamp = new Date().toISOString();
        const chatName = conversation.length > 0 ? conversation[0].text.substring(0, 20) + '...' : 'GPT Conversation';
        const chatData = { id: timestamp, timestamp, name: chatName, conversation };

        // Read file, update array, and write back in a single operation
        const savedChats = await FileSystem.readAsStringAsync(chatsFilePath);
        const chatsArray = savedChats ? JSON.parse(savedChats) : [];
        chatsArray.unshift(chatData); // Add new chat at the top

        await FileSystem.writeAsStringAsync(chatsFilePath, JSON.stringify(chatsArray));
        
        // Use batch or other optimization techniques for Firebase storage
        const user = auth.currentUser;
        if (user) {
            const chatRef = ref(storage, `${user.uid}/chats/${timestamp}.json`);
            const chatBlob = new Blob([JSON.stringify(chatData)], { type: 'application/json' });
            await uploadBytes(chatRef, chatBlob);
        }

        Alert.alert('Success', 'Chat saved successfully!');
        handleRefresh();
    } catch (error) {
        console.error('Failed to save chat:', error);
        Alert.alert('Error', 'Failed to save the chat. Please try again.');
    } finally {
        setLoading(false); // Hide loading indicator when done
    }
};


    const editMessage = (index) => {
        if (conversation[index].type === 'question') {
            setEditingIndex(index);
            setQuestion(conversation[index].text);
        }
    };

    const handleEditSave = () => {
        if (editingIndex !== null) {
            const updatedConversation = [...conversation];
            updatedConversation[editingIndex].text = question;
            setConversation(updatedConversation);
            setEditingIndex(null);
            setQuestion('');
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={[styles.messageContainer, item.type === 'question' ? styles.question : styles.answer]}>
            <Text style={[styles.messageText, item.type === 'question' ? styles.questionText : styles.answerText]}>
                {item.text}
            </Text>
            {item.image && (
                <View style={styles.imageBox}>
                    {item.image.map((img, idx) => (
                        <View key={idx} style={styles.imageWrapper}>
                            <Image source={{ uri: `data:image/png;base64,${img} `}} style={styles.image} />
                        </View>
                    ))}
                </View>
            )}
            {item.type === 'answer' && (
                <TouchableOpacity style={styles.speechButtonSmall} onPress={() => handlePlayAnswer(item.text)}>
                    <Ionicons name="play-circle" size={32} color="black" />
                </TouchableOpacity>
            )}
        </View>
    );
    
    

    const customHeader = () => (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                <Ionicons name="menu" size={32} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Car Manual Assistant</Text>
            <View style={styles.headerButtons}>
                <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
                    <Ionicons name="refresh" size={32} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveChat} style={styles.headerButton}>
                    <Ionicons name="save" size={32} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {customHeader()}
            <FlatList
                data={conversation}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.conversation}
                contentContainerStyle={styles.conversationContainer}
            />
            {loading && <ActivityIndicator size="large" color="black" style={styles.loader} />}
            <View style={styles.inputContainer}>
            <TextInput
                    style={styles.input}
                    placeholder="Ask a question"
                    value={question}
                    onChangeText={setQuestion}
                    editable={!loading}
                />
                {/* <TouchableOpacity
                    style={[styles.micButton, loading && styles.disabledButton]}
                    onPress={recording ? stopRecording : startRecording}
                    disabled={loading}
                >
                    <Ionicons name={recording ? "stop-circle" : "mic"} size={32} color={loading ? "gray" : "black"} />
                </TouchableOpacity> */}
                <TouchableOpacity
                    style={[styles.askButton, loading && styles.disabledButton]}
                    onPress={handleAskQuestion}
                    disabled={loading}
                >
                    <Ionicons name="arrow-up-circle" size={32} color={loading ? "gray" : "black"} />
                </TouchableOpacity>
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            {editingIndex !== null && (
                <View style={styles.editContainer}>
                    <TextInput
                        style={styles.editInput}
                        value={question}
                        onChangeText={setQuestion}
                    />
                    <TouchableOpacity onPress={handleEditSave} style={styles.saveEditButton}>
                        <Ionicons name="checkmark-circle" size={32} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditingIndex(null)} style={styles.cancelEditButton}>
                        <Ionicons name="close-circle" size={32} color="red" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default function ChatBot() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <SideNav {...props} />}
            screenOptions={{ headerShown: false }} // Hide the default header
        >
            <Drawer.Screen name="ChatBotContent" component={ChatBotContent} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',
        marginTop: 40, // Adjust this value to move the container down
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    menuButton: {
        marginRight: 15,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        marginLeft: 15,
    },
    conversation: {
        flex: 1,
    },
    conversationContainer: {
        paddingHorizontal: 10,
        paddingVertical: 15,
    },
    messageContainer: {
        marginBottom: 20,
    },
    question: {
        alignSelf: 'flex-start',
        backgroundColor: '#e0f7fa',
        borderRadius: 10,
        padding: 10,
        backgroundColor:"#001F3F",
        
    },
    answer: {
        alignSelf: 'flex-end',
        backgroundColor: '#e1bee7',
        borderRadius: 10,
        padding: 5,
        backgroundColor:"#f8f8f8",
    },
    messageText: {
        fontSize: 16,
        
    },
    questionText: {
        color: 'white', // White color for questions
    },
    answerText: {
        color: 'black', // Black color for answers
    },
    imageContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    imageBox: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        justifyContent: 'flex-start', // Aligns images to the start of the container
    },
    imageWrapper: {
        width: 150, // Adjust the width according to your preference
        height: 150, // Adjust the height according to your preference
        margin: 10,   // Gap between images
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#fff',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    micButton: {
        marginLeft: 10,
    },
    askButton: {
        marginLeft: 10,
    },
    speechButtonSmall: {
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    loader: {
        marginTop: 10,
      
    },
    error: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
    editContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#f8f8f8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    editInput: {
        flex: 1,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    saveEditButton: {
        marginLeft: 10,
    },
    cancelEditButton: {
        marginLeft: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
});