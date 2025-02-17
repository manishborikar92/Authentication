import mongoose, { Document, Schema } from 'mongoose';

export interface IPasswordReset extends Document {
  email: string;
  otp: string;
  otpExpires: Date;
}

const PasswordResetSchema: Schema = new Schema<IPasswordReset>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema); 