const User = require('../models/user.model');

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.user.id })
        if (!user) {
            let error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        res.send(user);

    } catch (err) {
        next(err)
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
};

exports.deleteProfile = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(targetUserId);
        res.json({ message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};