import { db, doc, setDoc, getDoc } from './firebase';

export async function requestNotificationPermission(userId: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('This browser does not support notifications.');
    return false;
  }

  try {
    let permission;
    if (typeof Notification.requestPermission === 'function') {
      try {
        permission = await Notification.requestPermission();
      } catch (e) {
        permission = await new Promise((resolve) => {
          Notification.requestPermission(resolve as any);
        });
      }
    }
    
    if (permission === 'granted') {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { notificationsEnabled: true }, { merge: true });
      return true;
    }
  } catch (err) {
    console.error('Failed to request notification permission:', err);
  }
  return false;
}

export async function sendLocalNotification(title: string, body: string, url?: string) {
  if (typeof window === 'undefined' || !('Notification' in window) || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return;
  }

  try {
    if (!navigator.serviceWorker) {
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    if (registration && typeof registration.showNotification === 'function') {
      registration.showNotification(title, {
        body,
        icon: '/coffee-pup-logo.png',
        data: { url }
      });
    }
  } catch (err) {
    console.error('Error sending local notification:', err);
  }
}

export async function checkNotificationStatus(userId: string) {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() && docSnap.data().notificationsEnabled;
}
