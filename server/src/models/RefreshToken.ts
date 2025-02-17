import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  expires: Date;
  createdAt: Date;
}

const RefreshTokenSchema: Schema = new Schema<IRefreshToken>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
