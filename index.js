import * as firebase from 'firebase/app';
import { getMessaging, getToken  } from 'firebase/messaging';
import SendbirdChat, {SessionHandler} from '@sendbird/chat';
import { FeedChannelModule } from '@sendbird/chat/feedChannel';
// import 'firebase/messaging';

const firebaseConfig = {
    apiKey: "Your API Key",
    authDomain: "Your Auth Domain",
    projectId: "Your Project ID",
    messagingSenderId: "Your Messaging Sender ID",
    appId: "Your App ID",
};
firebase.initializeApp(firebaseConfig);


if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register(
                new URL('firebase-messaging-sw.js', import.meta.url),
                { type: 'module' }
            );
            console.log('Service Worker registered: ', registration);
        } catch (error) {
            console.log('Service Worker registration failed: ', error);
        }

        navigator.serviceWorker.addEventListener('message', (event) => {
            const payload = event.data;

            console.log('Message received while page is in the foreground: ', payload);

            const notificationTitle = `New message from ${payload.data.channelName}`;
            const notificationOptions = {
                body: payload.data.message,
            };

            if (Notification.permission === 'granted') {
                new Notification(notificationTitle, notificationOptions);
            }
        });
    });
}




const sendbird = SendbirdChat.init({
    appId: "CB156F23-D978-4B08-973D-BCB1EC7BA0BD",
    modules: [
        new FeedChannelModule(),
    ],
});

(async () => {

    sendbird.setSessionHandler(new SessionHandler({
        onSessionTokenRequired: (resolve, reject) => {
            // issueSessionToken() // This function is created by you to fetch a new token for the user
            //     .then(token => resolve(token))
            //     .catch(err => reject(err));
        },
        onSessionRefreshed: () => {
            // session is refreshed
        },
        onSessionError: (err) => {
            // session refresh failed
        },
        onSessionClosed: () => {
            // session is closed
        },
    }));
})();

const registerDeviceTokenToSendbird = async (token, userId, accessToken) => {
    try {
        // Authenticate the user
        await sendbird.authenticate( userId, accessToken);
        // Retrieve the previously registered token and user ID from localStorage
        const storedData = JSON.parse(localStorage.getItem('sendbird_registered_data')) || {};
        const storedToken = storedData.token;
        const storedUserId = storedData.userId;

        // Check if the current user or token has changed
        if (storedUserId !== userId || storedToken !== token) {
            // If a different user or token was stored, unregister the old token
            if (storedToken) {
                //Use your server to unregister the old token for the previous user

                console.log('Old token removed for user:', storedUserId);
            }

            // Register the new token for the current user
            const tokenRegistered = await sendbird.registerFCMPushTokenForCurrentUser(token);
            console.log('New token registered for user:', userId);

            // Store the new token and user ID in localStorage
            localStorage.setItem('sendbird_registered_data', JSON.stringify({ token, userId }));
        } else {
            console.log('Token already registered for this user, no action needed.');
        }
    } catch (e) {
        console.error('Error managing FCM token:', e);
    }
}






// Request permission for notifications
const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();


        if (permission === 'granted') {
            console.log('Notification permission granted.');

            const messaging = getMessaging();

            // Get the current FCM token
            const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                // Send the token to your server here
                const userId = 'YOUR_USER_ID';
                const accessToken = 'YOUR_ACCESS_TOKEN_OR_SESSION_TOKEN';
                // const accessToken = '93ebc2dd6b6d7299d4ef9ee4214f224ed634fb59';
                await registerDeviceTokenToSendbird(currentToken, userId, accessToken);
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }

        } else {
            console.log('Notification permission denied.');
        }
    } catch (error) {
        console.error('Error occurred while requesting permission or retrieving token:', error);
    }
};










requestNotificationPermission();


