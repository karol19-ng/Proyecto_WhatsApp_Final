import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  phone: string;
  code: string;
  verified: boolean;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    phone: { type: String, required: true },
    code: { type: String, required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-eliminar OTPs expirados
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTP>("OTP", OTPSchema);
