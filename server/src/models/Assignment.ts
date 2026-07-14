import { Schema, model } from 'mongoose';

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    subject: { type: String, required: true },
    faculty_id: { type: String, default: '' },
    due_date: { type: String, default: '' },
    file_url: { type: String, default: '' },
    class_name: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

assignmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Assignment = model('Assignment', assignmentSchema);
