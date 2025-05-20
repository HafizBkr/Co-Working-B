import { Schema, model } from "mongoose";

const otpSchema = new Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

const Otp = model("Otp", otpSchema);

export default Otp;
