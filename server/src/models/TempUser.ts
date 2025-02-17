import mongoose, { Document, Schema } from 'mongoose';

export interface ITempUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  otp: string;
  otpExpires: Date;
}

const TempUserSchema: Schema = new Schema<ITempUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<ITempUser>('TempUser', TempUserSchema);
