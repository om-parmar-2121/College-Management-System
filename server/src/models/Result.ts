import { Schema, model } from 'mongoose';

const resultSchema = new Schema(
  {
    student_id: { type: String, required: true },
    subject: { type: String, required: true },
    marks_obtained: { type: Number, required: true, default: 0 },
    total_marks: { type: Number, required: true, default: 100 },
    exam_type: { type: String, required: true, default: 'final' },
    entered_by: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

resultSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Result = model('Result', resultSchema);
