const AccessControl = require('accesscontrol');
const ac = new AccessControl();

// Basic user — can manage only their own profile
ac.grant('user')
  .readOwn('profile')
  .updateOwn('profile');

// Admin — can manage any user’s profile
ac.grant('admin')
  .extend('user')
  .readAny('profile')
  .updateAny('profile')
  .deleteAny('profile');

// Super Admin — full system access
ac.grant('superAdmin')
  .extend('admin')
  .createAny('user')
  .updateAny('user')
  .deleteAny('user');

module.exports = ac;
