import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },

    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    birthday: { type: String, required: true }, // giữ string cho giống client đang gửi
    role: { type: String, required: true, enum: ['ADMIN', 'TEAM_OWNER', 'VIEWER'], default: 'VIEWER' },
  },
  { timestamps: true }
);

// ẩn passwordHash khi trả JSON
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  }
});

export default mongoose.model('User', UserSchema);