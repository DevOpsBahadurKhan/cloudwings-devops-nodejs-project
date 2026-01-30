const express = require('express');
const router = express.Router();

// routes/admin.routes.js or include in existing admin-related routes
const passportJWT = require('../middleware/passportJWT')();
const verifyAccess = require('../middleware/verifyAccess');
const controller = require('../controllers/admin.controller');


router.patch(
    '/auth/role/:userId',
    passportJWT.authenticate(),
    verifyAccess('update', 'user', 'any'),
    controller.updateUserRole
);


module.exports = router;
