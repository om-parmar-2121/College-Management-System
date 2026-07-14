import { Schema, model } from 'mongoose';

const timetableSchema = new Schema(
  {
    class_name: { type: String, required: true },
    subject: { type: String, required: true },
    faculty_id: { type: String, default: '' },
    day_of_week: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    room: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

timetableSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Timetable = model('Timetable', timetableSchema);
