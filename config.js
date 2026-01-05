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
    ws: 'wss://ameng-gogs-mass2-81.deno.dev/ws',
    api: 'https://ameng-gogs-mass2-81.deno.dev/api',
    domain: 'ameng-gogs-mass2-81.deno.dev'
};

// Backup Servers (in case primary fails)
const BACKUP_SERVERS = [
    {
        ws: 'wss://ameng-gogs-mass2-81.deno.dev/ws',
        api: 'https://ameng-gogs-mass2-81.deno.dev/api',
        name: 'Primary Server'
    },
    {
        ws: 'wss://bingo-backup-1.deno.dev/ws',
        api: 'https://bingo-backup-1.deno.dev/api',
        name: 'Backup Server 1'
    },
    {
        ws: 'wss://bingo-backup-2.deno.dev/ws',
        api: 'https://bingo-backup-2.deno.dev/api',
        name: 'Backup Server 2'
    }
];

// Local development server
const LOCAL_SERVER = {
    ws: 'ws://localhost:8000/ws',
    api: 'http://localhost:8000/api',
    domain: 'localhost'
};

// GitHub Pages configuration
const GITHUB_CONFIG = {
    ws: 'wss://ameng-gogs-mass2-81.deno.dev/ws',
    api: 'https://ameng-gogs-mass2-81.deno.dev/api',
    domain: 'ameng-gogs-mass2-81.deno.dev'
};

// ===== EXPORTED CONFIGURATION =====

// WebSocket URLs
export const WS_URL = (() => {
    switch (ENVIRONMENT) {
        case 'development':
            return LOCAL_SERVER.ws;
        case 'github':
            return GITHUB_CONFIG.ws;
        case 'production':
        case 'staging':
        default:
            return PRIMARY_BACKEND.ws;
    }
})();

// Backup WebSocket URLs (for failover)
export const WS_BACKUP_URLS = [
    ...BACKUP_SERVERS.map(server => server.ws),
    GITHUB_CONFIG.ws,
    LOCAL_SERVER.ws
].filter((url, index, self) => 
    url !== WS_URL && self.indexOf(url) === index // Remove duplicates and primary
);

// API Base URLs
export const API_BASE_URL = (() => {
    switch (ENVIRONMENT) {
        case 'development':
            return LOCAL_SERVER.api;
        case 'github':
            return GITHUB_CONFIG.api;
        case 'production':
        case 'staging':
        default:
            return PRIMARY_BACKEND.api;
    }
})();

// Backup API URLs
export const API_BACKUP_URLS = [
    ...BACKUP_SERVERS.map(server => server.api),
    GITHUB_CONFIG.api,
    LOCAL_SERVER.api
].filter((url, index, self) => 
    url !== API_BASE_URL && self.indexOf(url) === index
);

// ===== GAME CONFIGURATION =====

export const GAME_CONFIG = {
    // Game Types
    gameTypes: {
        '75ball': {
            name: '75 Ball Bingo',
            numbers: 75,
            patterns: ['Full House', 'Line', 'Four Corners', 'X Pattern'],
            gridSize: 5,
            columns: ['B', 'I', 'N', 'G', 'O'],
            stakes: [5, 10, 25, 50, 100]
        },
        '90ball': {
            name: '90 Ball Bingo',
            numbers: 90,
            patterns: ['One Line', 'Two Lines', 'Full House'],
            gridSize: 9,
            columns: 10,
            stakes: [5, 10, 25, 50, 100, 200]
        },
        'bingo75': {
            name: 'Ethiopian Bingo 75',
            numbers: 75,
            patterns: ['Full House', 'Cross', 'Diagonal'],
            gridSize: 5,
            stakes: [10, 25, 50, 100, 200]
        },
        'bingo90': {
            name: 'Ethiopian Bingo 90',
            numbers: 90,
            patterns: ['Full House', 'Star', 'Square'],
            gridSize: 9,
            stakes: [10, 25, 50, 100, 200, 500]
        }
    },

    // Default game settings
    defaultGameType: '75ball',
    defaultStake: 25,
    minStake: 5,
    maxStake: 1000,
    
    // Room settings
    maxPlayersPerRoom: 50,
    maxRooms: 100,
    roomIdLength: 6,
    
    // Game timing
    gameStartDelay: 5000, // 5 seconds
    numberCallInterval: 3000, // 3 seconds
    winClaimTimeout: 10000, // 10 seconds
    
    // Payment settings
    minPaymentAmount: 10,
    maxPaymentAmount: 10000,
    paymentMethods: ['TeleBirr', 'CBE Birr', 'Dashen Bank', 'Awash Bank', 'Cash'],
    
    // Withdrawal settings
    minWithdrawalAmount: 50,
    maxWithdrawalAmount: 5000,
    withdrawalFee: 0.05, // 5%
    
    // Currency
    currency: 'ETB',
    currencySymbol: 'ብር',
    
    // Security
    sessionTimeout: 3600000, // 1 hour
    maxLoginAttempts: 5,
    rateLimitWindow: 60000, // 1 minute
    rateLimitMax: 100 // requests per minute
};

// ===== WEBRTC CONFIGURATION =====

// ICE Servers for WebRTC (STUN/TURN)
export const ICE_SERVERS = {
    production: [
        // Free STUN servers
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302'
            ]
        },
        {
            urls: 'stun:global.stun.twilio.com:3478'
        },
        {
            urls: 'stun:stun.services.mozilla.com:3478'
        }
    ],
    
    // Add TURN servers if available (commented out - add your credentials)
    /*
    turn: [
        {
            urls: 'turn:your-turn-server.com:3478',
            username: 'your-username',
            credential: 'your-password'
        }
    ]
    */
};

// Current ICE servers based on environment
export const CURRENT_ICE_SERVERS = ICE_SERVERS.production;

// ===== SECURITY CONFIGURATION =====

export const SECURITY_CONFIG = {
    // JWT Settings
    jwt: {
        headerName: 'Authorization',
        tokenPrefix: 'Bearer ',
        localStorageKey: 'bingo_auth_token',
        refreshInterval: 300000 // 5 minutes
    },
    
    // CORS settings
    cors: {
        allowedOrigins: [
            'https://ameng-gogs-mass2-81.deno.dev',
            'https://*.github.io',
            'http://localhost:*',
            'http://127.0.0.1:*'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization']
    },
    
    // Encryption
    encryption: {
        algorithm: 'AES-GCM',
        keyLength: 256,
        ivLength: 12
    },
    
    // Rate limiting
    rateLimiting: {
        windowMs: 60000,
        maxRequests: 100,
        message: 'Too many requests, please try again later.'
    },
    
    // Input validation
    validation: {
        maxNameLength: 50,
        minNameLength: 2,
        phoneRegex: /^(\+251|251|0)?9\d{8}$/,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        passwordMinLength: 6
    }
};

// ===== ERROR HANDLING CONFIGURATION =====

export const ERROR_CONFIG = {
    // WebSocket error codes
    wsErrors: {
        1000: 'Normal closure',
        1001: 'Going away',
        1002: 'Protocol error',
        1003: 'Unsupported data',
        1005: 'No status received',
        1006: 'Abnormal closure',
        1007: 'Invalid frame payload data',
        1008: 'Policy violation',
        1009: 'Message too big',
        1010: 'Missing extension',
        1011: 'Internal error',
        1012: 'Service restart',
        1013: 'Try again later',
        1014: 'Bad gateway',
        1015: 'TLS handshake failed'
    },
    
    // Reconnection settings
    reconnection: {
        maxAttempts: 5,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffFactor: 2
    },
    
    // Error messages
    messages: {
        connectionFailed: 'Connection to server failed. Please check your internet connection.',
        serverError: 'Server error occurred. Please try again later.',
        timeout: 'Request timeout. Please try again.',
        invalidResponse: 'Invalid response from server.',
        authenticationFailed: 'Authentication failed. Please login again.',
        insufficientBalance: 'Insufficient balance. Please add funds.',
        roomFull: 'Room is full. Please try another room.',
        gameInProgress: 'Game is already in progress.'
    }
};

// ===== UI/UX CONFIGURATION =====

export const UI_CONFIG = {
    // Theme
    theme: {
        primaryColor: '#4CAF50',
        secondaryColor: '#2196F3',
        accentColor: '#FF9800',
        dangerColor: '#F44336',
        successColor: '#4CAF50',
        backgroundColor: '#f5f5f5',
        textColor: '#333333',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    
    // Animations
    animations: {
        duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms'
        },
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    // Responsive breakpoints
    breakpoints: {
        mobile: '480px',
        tablet: '768px',
        desktop: '1024px',
        largeDesktop: '1200px'
    },
    
    // Fonts
    fonts: {
        primary: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        heading: "'Arial', sans-serif",
        code: "'Courier New', monospace"
    }
};

// ===== ANALYTICS & MONITORING =====

export const ANALYTICS_CONFIG = {
    // Google Analytics (optional)
    googleAnalyticsId: null, // 'UA-XXXXXXXXX-X'
    
    // Error tracking
    sentryDsn: null, // 'https://xxxxxxxxxxxx@xxxx.ingest.sentry.io/xxxxx'
    
    // Performance monitoring
    enablePerformance: true,
    performanceThreshold: 100, // ms
    
    // Logging levels
    logLevel: ENVIRONMENT === 'production' ? 'warn' : 'debug',
    
    // Event tracking
    trackEvents: [
        'game_started',
        'game_completed',
        'payment_made',
        'withdrawal_requested',
        'player_registered'
    ]
};

// ===== LOCAL STORAGE KEYS =====

export const STORAGE_KEYS = {
    playerId: 'bingo_player_id',
    playerName: 'bingo_player_name',
    playerPhone: 'bingo_player_phone',
    balance: 'bingo_balance',
    stake: 'bingo_stake',
    gameType: 'bingo_game_type',
    authToken: 'bingo_auth_token',
    refreshToken: 'bingo_refresh_token',
    lastRoom: 'bingo_last_room',
    settings: 'bingo_settings',
    theme: 'bingo_theme'
};

// ===== EXPORTED FUNCTIONS =====

/**
 * Get current backend configuration
 */
export function getBackendConfig() {
    return {
        environment: ENVIRONMENT,
        wsUrl: WS_URL,
        apiUrl: API_BASE_URL,
        backupUrls: WS_BACKUP_URLS,
        isSecure: WS_URL.startsWith('wss://')
    };
}

/**
 * Check if connection is secure
 */
export function isConnectionSecure() {
    return window.location.protocol === 'https:' && WS_URL.startsWith('wss://');
}

/**
 * Get appropriate game configuration based on game type
 */
export function getGameConfig(gameType = '75ball') {
    return GAME_CONFIG.gameTypes[gameType] || GAME_CONFIG.gameTypes['75ball'];
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone) {
    return SECURITY_CONFIG.validation.phoneRegex.test(phone);
}

/**
 * Validate amount
 */
export function validateAmount(amount) {
    return amount >= GAME_CONFIG.minStake && amount <= GAME_CONFIG.maxStake;
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
    return `${GAME_CONFIG.currencySymbol} ${amount.toLocaleString()}`;
}

/**
 * Get backup URLs for failover
 */
export function getBackupUrls(currentUrl) {
    const allUrls = [WS_URL, ...WS_BACKUP_URLS];
    return allUrls.filter(url => url !== currentUrl);
}

/**
 * Check if environment is production
 */
export function isProduction() {
    return ENVIRONMENT === 'production';
}

/**
 * Check if environment is development
 */
export function isDevelopment() {
    return ENVIRONMENT === 'development';
}

/**
 * Check if running on GitHub Pages
 */
export function isGitHubPages() {
    return ENVIRONMENT === 'github';
}

/**
 * Get connection status message
 */
export function getConnectionStatus() {
    return {
        environment: ENVIRONMENT,
        backend: PRIMARY_BACKEND.domain,
        secure: isConnectionSecure(),
        timestamp: new Date().toISOString()
    };
}

// ===== INITIALIZATION =====

// Initialize configuration
(function initConfig() {
    console.group('🔧 Bingo Game Configuration');
    console.log('Environment:', ENVIRONMENT);
    console.log('WebSocket URL:', WS_URL);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Backup URLs:', WS_BACKUP_URLS.length);
    console.log('Secure Connection:', isConnectionSecure());
    console.log('Primary Backend:', PRIMARY_BACKEND.domain);
    console.groupEnd();
    
    // Store config in global scope for debugging
    if (isDevelopment()) {
        window.BingoConfig = {
            getBackendConfig,
            getGameConfig,
            isConnectionSecure,
            validatePhoneNumber,
            validateAmount,
            formatCurrency
        };
    }
})();

// Export all configurations
export default {
    // Environment
    ENVIRONMENT,
    isProduction,
    isDevelopment,
    isGitHubPages,
    
    // URLs
    WS_URL,
    WS_BACKUP_URLS,
    API_BASE_URL,
    API_BACKUP_URLS,
    
    // Configurations
    GAME_CONFIG,
    ICE_SERVERS: CURRENT_ICE_SERVERS,
    SECURITY_CONFIG,
    ERROR_CONFIG,
    UI_CONFIG,
    ANALYTICS_CONFIG,
    STORAGE_KEYS,
    
    // Functions
    getBackendConfig,
    isConnectionSecure,
    getGameConfig,
    validatePhoneNumber,
    validateAmount,
    formatCurrency,
    getBackupUrls,
    getConnectionStatus
};
