// models/User.ts
import mongoose from "mongoose";

const AdminNotifSchema = new mongoose.Schema({
  AdNotif: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AdminNotif", AdminNotifSchema);
