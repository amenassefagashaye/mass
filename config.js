// config.js - Secure Configuration for Bingo Game
// Compatible with GitHub and Deno deployment

// ===== ENVIRONMENT DETECTION =====
export const ENVIRONMENT = (() => {
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'development';
    } else if (hostname.includes('test') || hostname.includes('staging')) {
        return 'staging';
    } else if (hostname.includes('github.io')) {
        return 'github';
    } else {
        return 'production';
    }
})();

console.log(`🌍 Environment: ${ENVIRONMENT}`);

// ===== BACKEND CONFIGURATION =====

// Primary Backend Server (Main server - 81)
const PRIMARY_BACKEND = {
    ws: 'wss://ameng-gogs-mass2-81.deno.dev/',
    api: 'https://ameng-gogs-mass2-81.deno.dev/',
    domain: 'ameng-gogs-mass2-81.deno.dev',
    name: 'Primary Server (81)'
};

// Backup Server (60)
const BACKUP_SERVER = {
    ws: 'wss://ameng-gogs-mass2-60.deno.dev/',
    api: 'https://ameng-gogs-mass2-60.deno.dev/',
    domain: 'ameng-gogs-mass2-60.deno.dev',
    name: 'Backup Server (60)'
};

// ===== WEBSOCKET CONNECTION CONFIG =====
export const WS_CONFIG = {
    // Connection settings
    RECONNECT_DELAY: 2000, // 2 seconds
    MAX_RECONNECT_ATTEMPTS: 3,
    CONNECTION_TIMEOUT: 10000, // 10 seconds
    
    // Heartbeat settings
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
    HEARTBEAT_TIMEOUT: 5000, // 5 seconds
    
    // Message types
    MESSAGE_TYPES: {
        AUTH: 'auth',
        GAME_STATE: 'game_state',
        PLAYER_JOIN: 'player_join',
        PLAYER_LEAVE: 'player_leave',
        NUMBER_CALLED: 'number_called',
        BINGO: 'bingo',
        ADMIN_COMMAND: 'admin_command',
        ERROR: 'error',
        PING: 'ping',
        PONG: 'pong',
        CONNECTION_CHECK: 'connection_check'
    }
};

// ===== ADMIN CONFIGURATION =====
export const ADMIN_CONFIG = {
    PASSWORD: 'assefa2024',
    SESSION_TIMEOUT: 3600000, // 1 hour
    ALLOWED_ACTIONS: [
        'start_game',
        'pause_game',
        'end_game',
        'reset_game',
        'call_number',
        'announcement',
        'kick_player',
        'ban_player',
        'change_settings'
    ]
};

// ===== GAME CONFIGURATION =====
export const GAME_CONFIG = {
    // Game settings
    BOARD_SIZE: 5,
    TOTAL_NUMBERS: 75,
    NUMBERS_PER_ROW: 5,
    
    // Game timing (in milliseconds)
    GAME_START_DELAY: 5000,
    NUMBER_CALL_INTERVAL: 3000,
    BINGO_VERIFICATION_TIME: 3000,
    
    // Game states
    STATES: {
        LOBBY: 'lobby',
        STARTING: 'starting',
        PLAYING: 'playing',
        PAUSED: 'paused',
        ENDED: 'ended'
    }
};

// ===== SECURITY CONFIGURATION =====
export const SECURITY_CONFIG = {
    // Rate limiting
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    MAX_REQUESTS_PER_WINDOW: 100,
    
    // Player validation
    MIN_PLAYER_NAME_LENGTH: 2,
    MAX_PLAYER_NAME_LENGTH: 20,
    
    // Session management
    SESSION_COOKIE_NAME: 'bingo_session',
    SESSION_MAX_AGE: 86400000, // 24 hours
    
    // CORS settings
    ALLOWED_ORIGINS: [
        'https://ameng-gogs-mass2-81.deno.dev',
        'https://ameng-gogs-mass2-60.deno.dev',
        'https://*.github.io',
        'http://localhost:3000',
        'http://localhost:8080'
    ]
};

// ===== CONNECTION MANAGEMENT =====
let activeBackend = PRIMARY_BACKEND;
let connectionAttempts = 0;

/**
 * Get the active backend URL
 * @returns {Object} Active backend configuration
 */
export function getActiveBackend() {
    return activeBackend;
}

/**
 * Switch to backup server
 */
export function switchToBackup() {
    console.log(`🔄 Switching from ${activeBackend.name} to ${BACKUP_SERVER.name}`);
    activeBackend = BACKUP_SERVER;
    return activeBackend;
}

/**
 * Switch back to primary server
 */
export function switchToPrimary() {
    console.log(`🔄 Switching back to ${PRIMARY_BACKEND.name}`);
    activeBackend = PRIMARY_BACKEND;
    return activeBackend;
}

/**
 * Get WebSocket URL with connection parameters
 * @returns {string} WebSocket URL
 */
export function getWebSocketUrl() {
    const backend = getActiveBackend();
    const url = backend.ws;
    
    console.log(`🔗 Using WebSocket URL: ${url}`);
    return url;
}

/**
 * Get API URL for HTTP requests
 * @param {string} endpoint - API endpoint
 * @returns {string} Full API URL
 */
export function getApiUrl(endpoint = '') {
    const backend = getActiveBackend();
    const baseUrl = backend.api.endsWith('/') ? backend.api.slice(0, -1) : backend.api;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
}

/**
 * Wake up the backend server to prevent cold start
 * @returns {Promise<boolean>} Success status
 */
export async function wakeBackend() {
    try {
        console.log(`🚀 Waking up backend: ${activeBackend.name}`);
        
        // Try both servers when waking up
        const serversToWake = [PRIMARY_BACKEND, BACKUP_SERVER];
        let anySuccess = false;
        
        for (const server of serversToWake) {
            try {
                const startTime = Date.now();
                const response = await fetch(server.api, {
                    method: 'GET',
                    cache: 'no-cache',
                    headers: {
                        'X-Wake-Up': 'true',
                        'X-Client': 'bingo-web',
                        'X-Timestamp': Date.now().toString()
                    },
                    signal: AbortSignal.timeout(3000)
                });
                
                const endTime = Date.now();
                console.log(`✅ ${server.name} wake-up: ${response.status} (${endTime - startTime}ms)`);
                anySuccess = true;
                
            } catch (error) {
                console.warn(`⚠️ ${server.name} wake-up failed: ${error.message}`);
            }
        }
        
        return anySuccess;
        
    } catch (error) {
        console.warn('⚠️ Backend wake-up failed:', error.message);
        return false;
    }
}

/**
 * Quick connection test to WebSocket server
 * @returns {Promise<boolean>} Connection status
 */
export async function quickConnectionTest() {
    return new Promise((resolve) => {
        console.log(`🔍 Quick connection test to: ${activeBackend.name}`);
        
        const socket = new WebSocket(activeBackend.ws);
        let connected = false;
        
        const timeout = setTimeout(() => {
            if (!connected) {
                socket.close();
                console.log(`⏰ ${activeBackend.name} connection timeout`);
                resolve(false);
            }
        }, 3000); // Reduced timeout for quicker testing
        
        socket.onopen = () => {
            clearTimeout(timeout);
            connected = true;
            console.log(`✅ ${activeBackend.name} connection successful`);
            socket.close();
            resolve(true);
        };
        
        socket.onerror = () => {
            clearTimeout(timeout);
            console.log(`❌ ${activeBackend.name} connection failed`);
            resolve(false);
        };
        
        socket.onclose = () => {
            if (!connected) {
                clearTimeout(timeout);
                resolve(false);
            }
        };
    });
}

/**
 * Initialize connection with smart server selection
 * @returns {Promise<Object>} Connection result
 */
export async function initializeConnection() {
    console.log('🔌 Starting connection initialization...');
    
    // Step 1: Wake up both servers
    await wakeBackend();
    
    // Step 2: Try primary server first
    console.log(`🔄 Testing primary server: ${PRIMARY_BACKEND.name}`);
    switchToPrimary();
    
    const primaryTest = await quickConnectionTest();
    
    if (primaryTest) {
        console.log(`✅ Using primary server: ${PRIMARY_BACKEND.name}`);
        return {
            success: true,
            server: PRIMARY_BACKEND.name,
            url: PRIMARY_BACKEND.ws,
            isBackup: false,
            timestamp: new Date().toISOString()
        };
    }
    
    // Step 3: If primary fails, try backup
    console.log(`🔄 Primary server failed, trying backup: ${BACKUP_SERVER.name}`);
    switchToBackup();
    
    const backupTest = await quickConnectionTest();
    
    if (backupTest) {
        console.log(`✅ Using backup server: ${BACKUP_SERVER.name}`);
        return {
            success: true,
            server: BACKUP_SERVER.name,
            url: BACKUP_SERVER.ws,
            isBackup: true,
            timestamp: new Date().toISOString()
        };
    }
    
    // Step 4: Both servers failed
    console.error('❌ All connection attempts failed');
    return {
        success: false,
        error: 'Unable to connect to game servers. Please check your internet connection and try again.',
        timestamp: new Date().toISOString()
    };
}

/**
 * Create a WebSocket connection with proper error handling
 * @returns {Promise<WebSocket>} WebSocket instance
 */
export async function createWebSocketConnection() {
    const connection = await initializeConnection();
    
    if (!connection.success) {
        throw new Error(connection.error);
    }
    
    console.log(`🎮 Creating WebSocket connection to: ${connection.server}`);
    
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(getWebSocketUrl());
        let isConnected = false;
        
        const timeout = setTimeout(() => {
            if (!isConnected) {
                socket.close();
                reject(new Error(`Connection timeout to ${connection.server}`));
            }
        }, 10000);
        
        socket.onopen = () => {
            clearTimeout(timeout);
            isConnected = true;
            console.log(`✅ WebSocket connected to ${connection.server}`);
            resolve(socket);
        };
        
        socket.onerror = (error) => {
            clearTimeout(timeout);
            console.error(`❌ WebSocket error on ${connection.server}:`, error);
            reject(new Error(`Failed to connect to ${connection.server}`));
        };
        
        socket.onclose = (event) => {
            if (!isConnected) {
                clearTimeout(timeout);
                reject(new Error(`Connection closed to ${connection.server}`));
            }
        };
    });
}

/**
 * Get connection status for UI display
 * @returns {Object} Connection status object
 */
export function getConnectionStatus() {
    const backend = getActiveBackend();
    
    return {
        server: backend.name,
        wsUrl: backend.ws,
        apiUrl: backend.api,
        environment: ENVIRONMENT,
        isBackup: backend === BACKUP_SERVER,
        timestamp: new Date().toISOString()
    };
}

/**
 * Monitor connection and auto-switch if needed
 * @param {WebSocket} socket - WebSocket instance to monitor
 * @returns {Function} Function to stop monitoring
 */
export function monitorConnection(socket) {
    let lastPingTime = Date.now();
    let isMonitoring = true;
    
    const pingInterval = setInterval(() => {
        if (!isMonitoring) return;
        
        if (socket.readyState === WebSocket.OPEN) {
            const currentTime = Date.now();
            
            // Send ping if connection seems stale
            if (currentTime - lastPingTime > WS_CONFIG.HEARTBEAT_TIMEOUT) {
                try {
                    socket.send(JSON.stringify({
                        type: WS_CONFIG.MESSAGE_TYPES.PING,
                        timestamp: currentTime
                    }));
                    lastPingTime = currentTime;
                } catch (error) {
                    console.warn('Failed to send ping:', error);
                }
            }
        }
    }, WS_CONFIG.HEARTBEAT_INTERVAL);
    
    // Return function to stop monitoring
    return () => {
        isMonitoring = false;
        clearInterval(pingInterval);
    };
}

// ===== EXPORTS =====
export default {
    ENVIRONMENT,
    PRIMARY_BACKEND,
    BACKUP_SERVER,
    WS_CONFIG,
    ADMIN_CONFIG,
    GAME_CONFIG,
    SECURITY_CONFIG,
    getActiveBackend,
    switchToBackup,
    switchToPrimary,
    getWebSocketUrl,
    getApiUrl,
    wakeBackend,
    quickConnectionTest,
    initializeConnection,
    createWebSocketConnection,
    getConnectionStatus,
    monitorConnection
};
