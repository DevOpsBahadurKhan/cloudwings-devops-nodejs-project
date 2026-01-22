// redisClient.js
const Redis = require('ioredis');
const config = require('../config/index');

let client;

module.exports = {
    getClient: () => {
        if (!client) {
            console.log('🔄 Reinitializing Redis with ioredis...');

            const redisConfig = {
                host: config.redisHOST,
                port: config.redisPORT,
                password: config.redisPassword,
                tls: {} // Required for Redis Cloud & production security
            };

            // Remove TLS for local dev if needed
            if (process.env.NODE_ENV !== 'production') {
                delete redisConfig.tls;
                delete redisConfig.password; // optional: skip auth locally
            }

            client = new Redis(redisConfig);

            client.on('connect', () => {
                console.log('✅ Connected to Redis');
            });

            client.on('error', (err) => {
                console.error('❌ Redis error:', err);
            });
        }

        return client;
    }
};
