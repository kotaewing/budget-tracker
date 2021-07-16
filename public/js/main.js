if ('serviceWorker' in navigator) {
    console.log('Service Worker Supported');
    navigator
        .serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker Registered'))
        .catch(err => console.log('Service Worker Failed: ' + err))
}