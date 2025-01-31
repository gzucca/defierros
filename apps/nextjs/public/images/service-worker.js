// const { log } = require("@/utils/log");

// const installEvent = () => {
//   self.addEventListener("install", () => {
//     log("service worker installed");
//   });
// };
// installEvent();

// const activateEvent = () => {
//   self.addEventListener("activate", () => {
//     log("service worker activated");
//   });
// };
// activateEvent();

// self.addEventListener("notificationclick", (e) => {
//   // Close the notification popout
//   e.notification.close();
//   // Get all the Window clients
//   e.waitUntil(
//     clients.matchAll({ type: "window" }).then((clientsArr) => {
//       // If a Window tab matching the targeted URL already exists, focus that;
//       const hadWindowToFocus = clientsArr.some((windowClient) =>
//         windowClient.url === e.notification.data.url
//           ? (windowClient.focus(), true)
//           : false,
//       );
//       // Otherwise, open a new tab to the applicable URL and focus it.
//       if (!hadWindowToFocus)
//         clients
//           .openWindow(e.notification.data.url)
//           .then((windowClient) => (windowClient ? windowClient.focus() : null));
//     }),
//   );
// });

// self.addEventListener('sync', event => {
//   log(event.tag)
//   if (event.tag === 'fetch-notifications') {
//     log('entramos')
//     event.waitUntil(fetchUndeliveredNotifications());
//   }
// });

// async function fetchUndeliveredNotifications() {
//   const response = await fetch('https://api.autobidmarket.com/api/notifications/undelivered');
//   log(response)
//   const notifications = await response.json();

//   for (const notification of notifications) {
//     self.registration.showNotification(notification.title, notification.options);
//   }

//   await fetch(`/api/notifications/${notification.id}/mark-as-delivered`, { method: 'POST' });
// }

// self.addEventListener("push", (event) => {
//   log(event)
//   const data = event.data.json();
//   const title = data.title;
//   const body = data.message;
//   const icon = "some-icon.png";
//   const notificationOptions = {
//     body: body,
//     tag: "simple-push-notification-example",
//     icon: icon,
//   };
//   return self.Notification.requestPermission().then((permission) => {
//     if (permission === "granted") {
//       return new self.Notification(title, notificationOptions);
//     }
//   });
// });

// self.addEventListener('push', function(event) {
//   const promiseChain = self.registration.showNotification('Hello, World.');

//   event.waitUntil(promiseChain);
// });

// const listenNotifications = () => {
//   log("event listener instalado");
//   self.addEventListener("push", (event) => {
//     log(event.data.json())
//     const data = event.data.json();
//     const promiseChain = self.registration.showNotification(
//       data.title,
//       data.options
//     );

//     event.waitUntil(promiseChain);
//   });
// };
// listenNotifications();
