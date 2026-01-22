const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });


// Public routes
router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});


const passportJWT = require('../middleware/passportJWT')();
const verifyAccess = require('../middleware/verifyAccess');
const authController = require('../controllers/authcontroller');
const { isEmail, hasPassword, hasName } = require('../validations/validator');


router.post('/login', [isEmail, hasPassword], csrfProtection, authController.login);
router.post('/signup', [isEmail, hasPassword, hasName], authController.signup);

router.post('/refresh-token', csrfProtection, authController.refreshToken);

router.get(
    '/me',
    passportJWT.authenticate(),
    verifyAccess('read', 'profile', 'own'),  // or 'any' if admin can access all
    authController.me
);

module.exports = router;