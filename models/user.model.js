const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false // hide by default
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'doctor', 'admin', 'superAdmin']
    },
    refreshToken: {
        type: String,
        select: false
    }


});

// hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


UserSchema.methods.validPassword = async function (candidatePassword) {
    const result = await bcrypt.compare(candidatePassword, this.password);
    return result;
}

module.exports = mongoose.model("User", UserSchema);