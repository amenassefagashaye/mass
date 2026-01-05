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

// Primary Backend Server (Updated with provided URL)
const PRIMARY_BACKEND = {
    ws: 'wss://ameng-gogs-mass2-81.deno.dev/',
    api: 'https://ameng-gogs-mass2-81.deno.dev/',
    domain: 'ameng-gogs-mass2-81.deno.dev'
};

// Backup Servers (in case primary fails)
const BACKUP_SERVERS = [
    {
        ws: 'wss://ameng-gogs-mass2-81.deno.dev/',
        api: 'https://ameng-gogs-mass2-81.deno.dev/',
        name: 'Primary Server'
    },
    {
        ws: 'wss://backup1-ameng-gogs-mass2-81.deno.dev/',
        api: 'https://backup1-ameng-gogs-mass2-81.deno.dev/',
        name: 'Backup Server 1'
    }
];

// ===== WEBSOCKET CONNECTION CONFIG =====
export const WS_CONFIG = {
    // Connection settings
    RECONNECT_DELAY: 2000, // 2 seconds
    MAX_RECONNECT_ATTEMPTS: 5,
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
        PONG: 'pong'
    }
};

// ===== ADMIN CONFIGURATION =====
// IMPORTANT: In production, this should be loaded from environment variables or secure backend
export const ADMIN_CONFIG = {
    PASSWORD: 'assefa2024', // Default password - Change in production!
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
    
    // CORS settings (for API calls)
    ALLOWED_ORIGINS: [
        'https://ameng-gogs-mass2-81.deno.dev',
        'https://*.github.io',
        'http://localhost:3000',
        'http://localhost:8080'
    ]
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get the active backend URL based on environment
 * @returns {Object} Active backend configuration
 */
export function getActiveBackend() {
    // Try to use primary backend first
    if (ENVIRONMENT === 'development') {
        console.log('🔧 Using development backend configuration');
    }
    
    return PRIMARY_BACKEND;
}

/**
 * Get WebSocket URL with connection parameters
 * @returns {string} WebSocket URL
 */
export function getWebSocketUrl() {
    const backend = getActiveBackend();
    const url = new URL(backend.ws);
    
    // Add connection parameters
    url.searchParams.append('client', 'web');
    url.searchParams.append('env', ENVIRONMENT);
    url.searchParams.append('v', '1.0');
    url.searchParams.append('_t', Date.now().toString());
    
    return url.toString();
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
    
    return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * Wake up the backend server (for cold start prevention)
 * @returns {Promise<boolean>} Success status
 */
export async function wakeBackend() {
    try {
        const startTime = Date.now();
        const response = await fetch(getApiUrl('health'), {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'X-Wake-Up': 'true',
                'X-Client': 'bingo-web'
            },
            // Short timeout for wake-up request
            signal: AbortSignal.timeout(5000)
        });
        
        const endTime = Date.now();
        console.log(`🚀 Backend wake-up: ${response.status} (${endTime - startTime}ms)`);
        
        return response.ok;
    } catch (error) {
        console.warn('⚠️ Backend wake-up failed:', error.message);
        return false;
    }
}

/**
 * Test WebSocket connection
 * @returns {Promise<boolean>} Connection status
 */
export async function testWebSocketConnection() {
    return new Promise((resolve) => {
        const wsUrl = getWebSocketUrl();
        console.log(`🔗 Testing WebSocket connection to: ${wsUrl}`);
        
        const socket = new WebSocket(wsUrl);
        let connected = false;
        
        const timeout = setTimeout(() => {
            if (!connected) {
                socket.close();
                console.log('⏰ WebSocket connection timeout');
                resolve(false);
            }
        }, 5000);
        
        socket.onopen = () => {
            clearTimeout(timeout);
            connected = true;
            console.log('✅ WebSocket connection successful');
            socket.close();
            resolve(true);
        };
        
        socket.onerror = (error) => {
            clearTimeout(timeout);
            console.error('❌ WebSocket connection failed:', error);
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
 * Get connection status for UI display
 * @returns {Object} Connection status object
 */
export function getConnectionStatus() {
    const backend = getActiveBackend();
    const domain = new URL(backend.ws).hostname;
    
    return {
        domain: domain,
        wsUrl: backend.ws,
        apiUrl: backend.api,
        environment: ENVIRONMENT,
        timestamp: new Date().toISOString()
    };
}

/**
 * Initialize connection with retry logic
 * @returns {Promise<Object>} Connection result
 */
export async function initializeConnection() {
    console.log('🔌 Initializing connection...');
    
    // Step 1: Wake up backend (for Deno Deploy cold start)
    const wokeUp = await wakeBackend();
    if (!wokeUp) {
        console.warn('⚠️ Backend wake-up failed, proceeding anyway...');
    }
    
    // Step 2: Test WebSocket connection
    const wsConnected = await testWebSocketConnection();
    
    // Step 3: Determine fallback strategy
    if (!wsConnected) {
        console.warn('⚠️ Primary WebSocket connection failed');
        
        // Try backup servers
        for (let i = 0; i < BACKUP_SERVERS.length; i++) {
            const backup = BACKUP_SERVERS[i];
            console.log(`🔄 Trying backup server: ${backup.name}`);
            
            // Temporarily switch to backup for testing
            const originalWs = PRIMARY_BACKEND.ws;
            const originalApi = PRIMARY_BACKEND.api;
            
            PRIMARY_BACKEND.ws = backup.ws;
            PRIMARY_BACKEND.api = backup.api;
            
            const backupConnected = await testWebSocketConnection();
            
            if (backupConnected) {
                console.log(`✅ Connected to backup server: ${backup.name}`);
                return {
                    success: true,
                    server: backup.name,
                    url: backup.ws,
                    isBackup: true
                };
            }
            
            // Restore original
            PRIMARY_BACKEND.ws = originalWs;
            PRIMARY_BACKEND.api = originalApi;
        }
        
        return {
            success: false,
            error: 'Unable to connect to any server',
            timestamp: new Date().toISOString()
        };
    }
    
    return {
        success: true,
        server: 'Primary Server',
        url: PRIMARY_BACKEND.ws,
        isBackup: false
    };
}

// ===== EXPORTS =====
export default {
    ENVIRONMENT,
    PRIMARY_BACKEND,
    BACKUP_SERVERS,
    WS_CONFIG,
    ADMIN_CONFIG,
    GAME_CONFIG,
    SECURITY_CONFIG,
    getActiveBackend,
    getWebSocketUrl,
    getApiUrl,
    wakeBackend,
    testWebSocketConnection,
    getConnectionStatus,
    initializeConnection
};
