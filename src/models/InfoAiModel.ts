import mongoose from "mongoose";

const infoAiSchema = new mongoose.Schema({
  title: { type: String },
  info: { type: String, required: true },
  files: [
    {
      fileName: { type: String },
      fileExt: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("InfoAi", infoAiSchema);
