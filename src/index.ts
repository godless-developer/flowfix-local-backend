import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import openaiRouter from "./routes/openai";
import infoRoutes from "./routes/infoAi";
import signupRoutes from "./routes/signup";
import loginRoutes from "./routes/login";
import router from "./routes/AdminNotif";
import connectDB from "./lib/db";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import UserModel from "./models/UserModel";

dotenv.config();

async function bootstrap() {
  const app = express();
  app.get(["/health", "/healthz"], (_req, res) => {
    res.status(200).send("ok");
  });
  app.head(["/health", "/healthz"], (_req, res) => {
    res.sendStatus(200);
  });

  app.use(express.json());
  const whitelist = [
    "http://localhost:3000",
    "https://flowfix-admin-front.vercel.app",
    "https://talent.pinebaatars.mn",
  ];

  app.use(
    cors({
      origin: (origin, cb) => {
        // Postman/cURL гэх мэт Origin илгээгүй хүсэлтийг мөн зөвшөөрнө
        if (!origin) return cb(null, true);

        // Chrome extension-ууд
        if (origin.startsWith("chrome-extension://")) return cb(null, true);

        // Манай домэйнүүд
        if (whitelist.includes(origin)) return cb(null, true);

        return cb(new Error(`Not allowed by CORS: ${origin}`));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
  app.options("*", cors());

  await connectDB();
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  const JWT_SECRET = process.env.JWT_SECRET!;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);

  app.use("/api/openai", openaiRouter);
  app.use("/", infoRoutes);
  app.use("/users", signupRoutes);
  app.use("/users", loginRoutes);
  app.use("/notif", router);
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

  const PORT = Number(process.env.PORT || 4000);
  app.listen(PORT, "0.0.0.0", () => console.log(`API listening on ${PORT}`));
}

bootstrap().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});
