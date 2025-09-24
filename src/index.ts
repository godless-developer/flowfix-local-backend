declare module "jsonwebtoken";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import openaiRouter from "./routes/openai.js";
import connectDB from "../lib/db.js";
import infoRoutes from "./routes/infoAi.js";
import signupRoutes from "./routes/signup.js";
import loginRoutes from "./routes/login.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import UserModel from "./models/UserModel.js";
import router from "./routes/AdminNotif.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

await connectDB();

app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const JWT_SECRET = process.env.JWT_SECRET!;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
app.use("/api/openai", openaiRouter);
app.use("/", infoRoutes);
app.use("/users", signupRoutes);
app.use("/users", loginRoutes);
app.use("/notif", router);

// POST - Google Auth
app.post("/auth/google", (req, res): void => {
  (async () => {
    try {
      const { id_token } = req.body || {};
      if (!id_token) {
        res.status(400).send("id_token required");
        return;
      }

      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        res.status(401).send("Invalid Google token");
        return;
      }

      // upsert user by email
      const update = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || "",
        picture: payload.picture || "",
      };

      const user = await UserModel.findOneAndUpdate(
        { email: payload.email },
        { $set: update },
        { new: true, upsert: true }
      );

      const token = jwt.sign(
        { sub: user._id.toString(), email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          buddyName: user.buddyName,
          buddyUrl: user.buddyUrl,
          picture: user.picture,
          role: user.role,
          status: user.status,
        },
      });
    } catch (err) {
      console.error("Auth error", err);
      res.status(401).send((err as Error)?.message || "Auth failed");
    }
  })();
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Auth server listening on :${port}`));
