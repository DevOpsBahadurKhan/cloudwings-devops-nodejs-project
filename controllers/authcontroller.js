const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const validationHandler = require('../validations/validationHandler');

const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });


exports.login = async (req, res, next) => {
    validationHandler(req);
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            let error = new Error("Wrong Credentials");
            error.statusCode = 401;
            throw error;
        }

        const validPassword = await user.validPassword(password);
        if (!validPassword) {
            let error = new Error("Wrong Credentials");
            error.statusCode = 401;
            throw error;
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.jwtSecret,
            { expiresIn: '1m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.jwtRefreshSecret,
            { expiresIn: '7d' }
        );

        // Save refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        // Set HTTP-only cookie for refresh token
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Generate and set CSRF token
        const csrfToken = req.csrfToken();
        res.cookie('XSRF-TOKEN', csrfToken, {
            httpOnly: false, // Must be readable by JS
            secure: true,
            sameSite: 'strict'
        });

        res.json({
            user: { id: user.id, email: user.email, role: user.role },
            accessToken,
            csrfToken
        });

    } catch (err) {
        next(err);
    }
};

exports.signup = async (req, res, next) => {
    try {
        validationHandler(req);

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            const error = new Error("Email already used");
            error.statusCode = 403;
            throw error;
        }

        let user = new User();
        user.email = req.body.email;
        user.password = req.body.password;
        user.name = req.body.name;
        user = await user.save();

        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.jwtSecret,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.jwtRefreshSecret,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 din
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            accessToken
        });
    } catch (err) {
        next(err);
    }
};


exports.refreshToken = [
    csrfProtection, // CSRF validation middleware
    async (req, res, next) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) throw new Error('Refresh token missing', { statusCode: 401 });

            const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret);
            const user = await User.findById(payload.id).select('+refreshToken');

            if (!user || user.refreshToken !== refreshToken) {
                throw new Error('Invalid refresh token', { statusCode: 403 });
            }

            // Generate new tokens
            const newAccessToken = jwt.sign(
                { id: user.id, role: user.role },
                process.env.jwtSecret,
                { expiresIn: '1m' }
            );

            const newCsrfToken = req.csrfToken(); // Generate new CSRF token
            res.cookie('XSRF-TOKEN', newCsrfToken, {
                httpOnly: false,
                secure: true,
                sameSite: 'strict'
            });

            res.json({
                accessToken: newAccessToken,
                csrfToken: newCsrfToken
            });

        } catch (err) {
            next(err);
        }
    }
];

exports.me = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-refreshToken');
        res.send(user);
    } catch (err) {
        next(err)
    }
}


// // Stateless Login
// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({ email }).select("+password");

//         if (!user) {
//             const error = new Error("Wrong Credentials");
//             error.statusCode = 401;
//             throw error;
//         }

//         const validPassword = await user.validPassword(password);
//         if (!validPassword) {
//             const error = new Error("Wrong Credentials");
//             error.statusCode = 401;
//             throw error;
//         }

//         // Access Token (short-lived)
//         const accessToken = jwt.sign(
//             { id: user.id, role: user.role },
//             process.env.jwtSecret,
//             { expiresIn: '15m' }
//         );

//         // Refresh Token (long-lived, but rotated)
//         const refreshToken = jwt.sign(
//             { id: user.id },
//             process.env.jwtRefreshSecret,
//             { expiresIn: '7d' }
//         );

//         // Stateless: No database storage of refresh token
//         // Send tokens to client (no httpOnly cookie)
//         res.json({
//             user: {
//                 id: user.id,
//                 email: user.email,
//                 role: user.role,
//             },
//             tokens: {
//                 accessToken,
//                 refreshToken // Client must store this securely
//             }
//         });

//     } catch (err) {
//         next(err);
//     }
// };

// // Stateless Token Refresh
// exports.refreshToken = async (req, res, next) => {
//     try {
//         const { refreshToken } = req.body; // Get from request body (not cookie)

//         if (!refreshToken) {
//             let error = new Error('Refresh token missing');
//             error.statusCode = 401;
//             throw error;
//         }

//         // Verify token signature only (no DB check)
//         const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret);

//         // Optional: Check if user exists (but no token check)
//         const user = await User.findById(payload.id);
//         if (!user) {
//             let error = new Error('User not found');
//             error.statusCode = 404;
//             throw error;
//         }

//         // Generate new tokens (rotation)
//         const newAccessToken = jwt.sign(
//             { id: user.id, role: user.role },
//             process.env.jwtSecret,
//             { expiresIn: '15m' }
//         );

//         const newRefreshToken = jwt.sign(
//             { id: user.id },
//             process.env.jwtRefreshSecret,
//             { expiresIn: '7d' }
//         );

//         res.json({
//             accessToken: newAccessToken,
//             refreshToken: newRefreshToken // Client must update stored token
//         });

//     } catch (err) {
//         next(err);
//     }
// };



