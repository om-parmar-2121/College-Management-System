import { Schema, model } from 'mongoose';

const studentSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    enrollment_number: { type: String, unique: true, sparse: true },
    course: { type: String, default: '' },
    year: { type: Number, default: 1 },
    department: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);
studentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Student = model('Student', studentSchema);
