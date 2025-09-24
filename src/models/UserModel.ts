// models/UserModel.ts
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    datetime: { type: Date, required: true },
    status: { type: String, enum: ["PENDING", "DONE"], default: "PENDING" },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    picture: { type: String },
    role: { type: String, default: "USER" },
    password: { type: String },
    buddyUrl: { type: String },
    buddyName: { type: String },
    status: { type: String, default: "ACTIVE" },
    department: { type: String }, // 👈 нэмэгдсэн
    position: { type: String }, // 👈 нэмэгдсэн
    tasks: [TaskSchema],
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
