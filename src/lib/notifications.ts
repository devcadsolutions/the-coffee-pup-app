import { db, doc, setDoc, getDoc } from './firebase';

export async function requestNotificationPermission(userId: string) {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications.');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    // In a real app, you'd register a push subscription here
    // For this minimal patch, we'll just track permission in Firestore
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { notificationsEnabled: true }, { merge: true });
    return true;
  }
  return false;
}

export async function sendLocalNotification(title: string, body: string, url?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  registration.showNotification(title, {
    body,
    icon: '/coffee-pup-logo.png',
    data: { url }
  });
}

export async function checkNotificationStatus(userId: string) {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() && docSnap.data().notificationsEnabled;
}
