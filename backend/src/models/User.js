import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false, maxlength: 128 },
    avatar: { type: String, default: '', maxlength: 2048 },
    bio: { type: String, default: '', maxlength: 300 },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    tokenVersion: { type: Number, default: 0, select: false },
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
    if (this.isModified('passwordHash')) this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});
userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.passwordHash);
};
userSchema.set('toJSON', { transform: (_doc, value) => { delete value.passwordHash; delete value.tokenVersion; delete value.__v; return value; } });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
