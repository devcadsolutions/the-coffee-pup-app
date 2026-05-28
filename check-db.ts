import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  console.log("Checking products collection...");
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    console.log(`Total products in DB: ${querySnapshot.size}`);
    querySnapshot.forEach((doc) => {
      console.log(`- ID: ${doc.id}, Name: ${doc.data().name}, Status: ${doc.data().status}`);
    });
  } catch (e) {
    console.error("Error checking Firestore database:", e);
  }
}

check();
