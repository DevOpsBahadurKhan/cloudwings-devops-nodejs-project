const express = require('express');
const router = express.Router();

const passportJWT = require('../middleware/passportJWT')();
const verifyAccess = require('../middleware/verifyAccess');
const userController = require('../controllers/user.controller');
const preventSelfDelete = require('../middleware/preventSelfDelete');

router.get(
    '/',
    passportJWT.authenticate(),
    verifyAccess('read', 'profile', 'own'),
    userController.getProfile
);

router.put(
    '/',
    passportJWT.authenticate(),
    verifyAccess('update', 'profile', 'own'),
    userController.updateProfile
);

router.delete('/:id', passportJWT.authenticate(),
    verifyAccess('delete', 'profile', 'own'),
    preventSelfDelete(['admin', 'superAdmin']),
    userController.deleteProfile
);

module.exports = router;
