import { Schema, model } from 'mongoose';

const noticeSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    published_by: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

noticeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Notice = model('Notice', noticeSchema);
