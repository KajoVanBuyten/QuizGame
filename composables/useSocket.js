import { io } from 'socket.io-client';
import { ref, onMounted, onUnmounted } from 'vue';

export function useSocket() {
    const socket = ref(null);

    // Speicher geplante Event-Handler zwischen
    const pendingListeners = [];

    const on = (event, callback) => {
        // Speichere Event & Callback zwischen, falls Socket noch nicht verbunden ist
        pendingListeners.push({ event, callback });

        // Falls Socket bereits steht, direkt registrieren
        if (socket.value) {
            socket.value.on(event, callback);
        }
    };

    const emit = (event, ...args) => {
        if (socket.value) {
            socket.value.emit(event, ...args);
        }
    };

    onMounted(() => {
        socket.value = io(`http://${window.location.hostname}:4000`, {
            path: '/socket/',
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.value.on('connect', () => {
            console.log('Socket.IO client connected:', socket.value.id);

            // Registriere alle zwischengespeicherten Listener nachträglich
            for (const { event, callback } of pendingListeners) {
                socket.value.on(event, callback);
            }
        });

        socket.value.on('connect_error', (err) => {
            console.error('Socket.IO connect error:', err.message);
        });
    });

    onUnmounted(() => {
        if (socket.value) {
            console.log('Socket.IO client disconnected:', socket.value.id);
            socket.value.disconnect();
            socket.value = null;
        }
    });

    return { socket, on, emit };
}
