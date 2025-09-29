import mongoose from "mongoose";

const infoAiSchema = new mongoose.Schema({
  title: { type: String },
  info: { type: String, required: true },
  fileName: { type: String }, // өргөтгөлгүй нэр
  fileExt: { type: String }, // зөвхөн өргөтгөл (.pdf, .doc г.м)
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("InfoAi", infoAiSchema);
