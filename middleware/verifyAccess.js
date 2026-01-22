const ac = require('../utils/accessControl');

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = function verifyAccess(action, resource, possession = 'any') {
    return (req, res, next) => {
        try {
            const role = req.user?.role;
            if (!role) return res.status(403).json({ message: 'Missing role' });

            const methodName = `${action}${capitalize(possession)}`; // e.g. "readOwn"
            const permission = ac.can(role)[methodName](resource);

            if (!permission.granted) {
                return res.status(403).json({ message: 'Access Denied' });
            }

            // Optionally attach filtered data or permission to request
            req.permission = permission;

            next();
        } catch (err) {
            console.error('[AccessControl Error]', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};
