import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request notification permission
export const requestNotificationPermission = async () => {
try {
 const permission = await Notification.requestPermission();
 if (permission === 'granted') {
   const token = await getToken(messaging, {
     vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
   });
   console.log('📱 FCM Token:', token);
   return token;
 }
} catch (error) {
 console.error('Notification permission error:', error);
}
};

// Listen for incoming messages
export const onMessageListener = () =>
new Promise((resolve) => {
 onMessage(messaging, (payload) => {
   console.log('📬 Message received:', payload);
   resolve(payload);
 });
});

// Send notification to user
export const sendNotificationToUser = async (userId, notification) => {
try {
 const response = await fetch('/api/notifications/send', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
     userId,
     title: notification.title,
     body: notification.body,
     data: notification.data
   })
 });
 return await response.json();
} catch (error) {
 console.error('Send notification error:', error);
}
};

export default { requestNotificationPermission, onMessageListener, sendNotificationToUser };
