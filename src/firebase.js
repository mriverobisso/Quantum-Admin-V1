import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for Quantum OS (Grupo Quantum project)
const firebaseConfig = {
  apiKey: "AIzaSyBdoVD3clUh0TlHYAyvsriZ20beTrZQjL0",
  authDomain: "quantum-1723222219022.firebaseapp.com",
  projectId: "quantum-1723222219022",
  storageBucket: "quantum-1723222219022.firebasestorage.app",
  messagingSenderId: "741072878910",
  appId: "1:741072878910:web:be4942f81dc906c3c8c06f",
  measurementId: "G-PM67Q4DY6S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
export default app;
