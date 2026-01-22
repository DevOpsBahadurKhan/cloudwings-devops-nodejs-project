require('dotenv').config();

module.exports = {
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACKURL
    },

    jwt: {
        secret: process.env.jwtSecret,
        refreshSecret: process.env.jwtRefreshSecret
    },

    mongoURL: process.env.mongoURL,

    redis: {
        host: process.env.redisHOST,
        port: parseInt(process.env.redisPORT, 10),
        password: process.env.redisPassword || ''
    },

    app: {
        port: parseInt(process.env.port, 10) || 3000,
        nodeEnv: process.env.NODE_ENV || 'development'
    }
};
