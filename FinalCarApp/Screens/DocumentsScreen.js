import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure you have this package installed
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

const DocumentsScreen = () => {
    const [license, setLicense] = useState(null);
    const [rcBook, setRcBook] = useState(null);
    const [pollutionControl, setPollutionControl] = useState(null);
    const [insurance, setInsurance] = useState(null);

    const storage = getStorage();
    const user = getAuth().currentUser;

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const docTypes = ['drivers_license.pdf', 'rc_book.pdf', 'pollution_control.pdf', 'insurance.pdf'];
                const setDocument = {
                    'drivers_license.pdf': setLicense,
                    'rc_book.pdf': setRcBook,
                    'pollution_control.pdf': setPollutionControl,
                    'insurance.pdf': setInsurance,
                };

                for (const type of docTypes) {
                    const storageRef = ref(storage, `${user.uid}/uploads/${type}`);
                    try {
                        const url = await getDownloadURL(storageRef);
                        setDocument[type](url);
                    } catch (error) {
                        if (error.code === 'storage/object-not-found') {
                            setDocument[type](null);
                        } else {
                            console.error('Error fetching document:', error);
                            Alert.alert('Error', 'An error occurred while fetching the documents.');
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
                Alert.alert('Error', 'An error occurred while fetching the documents.');
            }
        };

        fetchDocuments();
    }, [user]);

    const handleDocumentPick = async (type) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
            });

            if (result && !result.canceled && result.assets && result.assets.length > 0) {
                const { uri, name } = result.assets[0];

                const fileNameMap = {
                    license: 'drivers_license.pdf',
                    rcBook: 'rc_book.pdf',
                    pollutionControl: 'pollution_control.pdf',
                    insurance: 'insurance.pdf',
                };

                Alert.alert(
                    'Confirm Upload',
                    `Do you want to upload this file?\n\nFile Name: ${name}`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                try {
                                    if (type === 'license') setLicense('uploading');
                                    if (type === 'rcBook') setRcBook('uploading');
                                    if (type === 'pollutionControl') setPollutionControl('uploading');
                                    if (type === 'insurance') setInsurance('uploading');

                                    const response = await fetch(uri);
                                    const fileBlob = await response.blob();
                                    const fileName = fileNameMap[type];
                                    const storageRef = ref(storage, `${user.uid}/uploads/${fileName}`);

                                    await uploadBytes(storageRef, fileBlob, { contentType: 'application/pdf' });
                                    const downloadURL = await getDownloadURL(storageRef);

                                    if (type === 'license') setLicense(downloadURL);
                                    if (type === 'rcBook') setRcBook(downloadURL);
                                    if (type === 'pollutionControl') setPollutionControl(downloadURL);
                                    if (type === 'insurance') setInsurance(downloadURL);

                                    Alert.alert('Success', 'Document uploaded successfully.');
                                } catch (uploadError) {
                                    console.error('Error uploading document:', uploadError);
                                    Alert.alert('Error', 'An error occurred while uploading the document.');
                                }
                            },
                        },
                    ],
                );
            } else {
                Alert.alert('Error', 'No file selected or the picker was canceled.');
            }
        } catch (error) {
            console.error('Error in document handling:', error);
            Alert.alert('Error', 'An error occurred while processing the document.');
        }
    };

    const handleDelete = async (type, url, setDocumentState) => {
        try {
            if (url) {
                const fileNameMap = {
                    license: 'drivers_license.pdf',
                    rcBook: 'rc_book.pdf',
                    pollutionControl: 'pollution_control.pdf',
                    insurance: 'insurance.pdf',
                };
                const fileName = fileNameMap[type];
                const storageRef = ref(storage, `${user.uid}/uploads/${fileName}`);

                await deleteObject(storageRef);
                setDocumentState(null);

                Alert.alert('Delete complete', 'Document has been deleted.');
            } else {
                Alert.alert('Error', 'No document available to delete.');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            Alert.alert('Error', 'An error occurred while deleting the document.');
        }
    };

    const handleOpenInBrowser = async (documentUrl) => {
        if (documentUrl) {
            try {
                await Linking.openURL(documentUrl);
            } catch (error) {
                console.error('Error opening document in browser:', error);
                Alert.alert('Error', 'An error occurred while trying to open the document in the browser.');
            }
        } else {
            Alert.alert('Error', 'Document URL not available.');
        }
    };

    const renderBox = (title, type, document, setDocumentState) => (
        <TouchableOpacity
            style={styles.box}
            onPress={() => {
                if (!document) {
                    handleDocumentPick(type);
                }
            }}
        >
            <Text style={styles.boxTitle}>{title}</Text>
            {document ? (
                document === 'uploading' ? (
                    <Text style={styles.boxDescription}>Uploading...</Text>
                ) : (
                    <View style={styles.iconRow}>
                        <TouchableOpacity onPress={() => handleOpenInBrowser(document)}>
                            <Icon name="visibility" size={24} color="#f4c35b" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDocumentPick(type)}>
                            <Icon name="attach-file" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(type, document, setDocumentState)}>
                            <Icon name="delete" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )
            ) : (
                <View style={styles.noDocumentContainer}>
                    <Text style={styles.boxDescription}>No document uploaded</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Upload Documents</Text>
            <View style={styles.content}>
                <View style={styles.row}>
                    {renderBox("Driver’s License", "license", license, setLicense)}
                    {renderBox("RC Book", "rcBook", rcBook, setRcBook)}
                </View>
                <View style={styles.row}>
                    {renderBox("Pollution Control", "pollutionControl", pollutionControl, setPollutionControl)}
                    {renderBox("Insurance", "insurance", insurance, setInsurance)}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#000', // Dark background to match LoginScreen
        justifyContent: 'center', // Center contents vertically
        alignItems: 'center', // Center contents horizontally
    },
    title: {
        fontSize: 28, // Larger title font
        fontWeight: 'bold',
        color: '#f4c35b', // Highlight color from LoginScreen
        textAlign: 'center',
        marginBottom: 24,
    },
    content: {
        width: '100%', // Ensure that the content takes full width
        alignItems: 'center', // Center children horizontally
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%', // Full width to ensure boxes are spaced evenly
        marginBottom: 20,
    },
    box: {
        flex: 1,
        marginHorizontal: 8,
        padding: 16,
        backgroundColor: '#333', // Dark grey background for boxes
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#444', // Slightly darker border
    },
    boxTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF', // White text color
        marginBottom: 12,
    },
    noDocumentContainer: {
        flexDirection: 'row',  // Set children to be laid out horizontally
        alignItems: 'center',  // Vertically center the text and icon
    },
    boxDescription: {
        fontSize: 16,
        color: '#f4c35b', // Highlight color for description
        marginBottom: 8,
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    chooseButton: {
        marginTop: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DocumentsScreen;