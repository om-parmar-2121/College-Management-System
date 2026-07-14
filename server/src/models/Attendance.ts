import { Schema, model } from 'mongoose';

const attendanceSchema = new Schema(
  {
    student_id: { type: String, required: true },
    subject: { type: String, required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    status: { type: String, enum: ['present', 'absent'], default: 'absent' },
    marked_by: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

attendanceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Attendance = model('Attendance', attendanceSchema);
