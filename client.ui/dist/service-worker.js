self.addEventListener("push", (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || "/favicon.png",
      badge: "/favicon.png",
      vibrate: [100, 50, 100],
      tag: data.conversationId,
      data: {
        url: data.url || "/",
        conversationId: data.conversationId,
      },
    };

    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
        let isFocused = false;
        for (let i = 0; i < windowClients.length; i++) {
          if (windowClients[i].focused) {
            isFocused = true;
            break;
          }
        }

        // Only show notification if the user isn't actively looking at the app
        if (!isFocused) {
          return self.registration.showNotification(data.title, options);
        }
      })
    );
  } catch (err) {
    console.error("Push event error:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || "/";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // If not open, open a new tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
