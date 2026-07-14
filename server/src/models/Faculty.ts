import { Schema, model } from 'mongoose';

const facultySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    employee_id: { type: String, unique: true, sparse: true },
    subject: { type: String, default: '' },
    department: { type: String, default: '' },
    qualification: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

facultySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Faculty = model('Faculty', facultySchema);
