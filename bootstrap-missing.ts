import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { products as initialProducts } from './src/data/mockData';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function bootstrap() {
  console.log("Reading products from Firestore...");
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const dbIds = new Set(querySnapshot.docs.map(doc => doc.id));
    console.log(`Currently in database: ${dbIds.size} items.`);

    const missing = initialProducts.filter(p => !dbIds.has(p.id));
    console.log(`Missing items: ${missing.length} items.`);

    if (missing.length > 0) {
      console.log("Writing missing products to Firestore...");
      for (const product of missing) {
        await setDoc(doc(db, 'products', product.id), product);
        console.log(`- Bootstrapped: ${product.name}`);
      }
      console.log("Successfully restored missing items!");
    } else {
      console.log("No items are missing from database.");
    }
  } catch (e) {
    console.error("Error bootstrapping database:", e);
  }
}

bootstrap();
