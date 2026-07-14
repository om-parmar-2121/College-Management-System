import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
    full_name: { type: String, default: '' },
    phone: { type: String, default: '' },
    avatar_url: { type: String, default: '' },
    department: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Format _id to id when returned to frontend
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const User = model('User', userSchema);
