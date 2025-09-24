// models/User.ts
import mongoose from "mongoose";

const infoAiSchema = new mongoose.Schema({
  info: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("InfoAi", infoAiSchema);
