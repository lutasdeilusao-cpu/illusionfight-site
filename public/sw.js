self.addEventListener('push', (event) => {
  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/illusionfight-site/favicon.svg',
    badge: '/illusionfight-site/favicon.svg',
    tag: 'tamagoshi',
    renotify: true,
    data: { url: data.url },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})
