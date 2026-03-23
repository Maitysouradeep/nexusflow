import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyBs6z1zh4HIBzhkVx8ALkZEFw8Humv8jwQ",
  authDomain: "saas-dashboard-e4542.firebaseapp.com",
  projectId: "saas-dashboard-e4542",
  storageBucket: "saas-dashboard-e4542.firebasestorage.app",
  messagingSenderId: "935421206907",
  appId: "1:935421206907:web:0b00af85dd3f0f5e0c5dde",
  measurementId: "G-TMPK8RMMS0"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

