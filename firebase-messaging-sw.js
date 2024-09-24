// Import only the necessary parts of Firebase
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Firebase configuration object
const firebaseConfig = {
    apiKey: "Your API Key",
    authDomain: "Your Auth Domain",
    projectId: "Your Project ID",
    messagingSenderId: "Your Messaging Sender ID",
    appId: "Your App ID",
};
// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);
// Get messaging instance
const messaging = getMessaging(firebaseApp);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
    console.log('Received background message ', payload);

    try {
        // Parse the sendbird data from the payload
        const sendbirdData = JSON.parse(payload.data.sendbird);

        // Extract the channel name and message
        const channelName = sendbirdData.channel.name || 'Unnamed Channel';
        const notificationTitle = `New message in ${channelName}`;
        const notificationOptions = {
            body: payload.data.message || 'You have a new message',
        };

        // Display the notification
        self.registration.showNotification(notificationTitle, notificationOptions);
    } catch (error) {
        console.error('Error parsing sendbird data: ', error);
    }
});




self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // Focus or open your app window
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then(function(clientList) {
        if (clientList.length > 0) {
            return clientList[0].focus();
        }
        return clients.openWindow('/');
    }));
});

