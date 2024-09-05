import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDaLCPj4AGXEOjOc2ve8OdatMolbAh7Hec",
  authDomain: "carmanual-23e3b.firebaseapp.com",
  projectId: "carmanual-23e3b",
  storageBucket: "carmanual-23e3b.appspot.com",
  messagingSenderId: "734147226134",
  appId: "1:734147226134:web:28e9da75a719cab3c8a337"
};

// Initialize Firebase app only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Check if Auth has been initialized already, if not, initialize with persistence
let auth;
if (!auth) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Export initialized instances
export { auth, db, storage };
