import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import openaiRouter from "./routes/openai";
import infoRoutes from "./routes/infoAi";
import signupRoutes from "./routes/signup";
import loginRoutes from "./routes/login";
import router from "./routes/AdminNotif";
import connectDB from "./lib/db";

dotenv.config();

async function bootstrap() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://flowfix-admin-front.vercel.app",
      ],
      credentials: true,
    })
  );

  await connectDB();

  app.use("/api/openai", openaiRouter);
  app.use("/v1", infoRoutes);
  app.use("/users", signupRoutes);
  app.use("/users", loginRoutes);
  app.use("/notif", router);

  const PORT = Number(process.env.PORT || 4000);
  app.listen(PORT, "0.0.0.0", () => console.log(`API listening on ${PORT}`));
}

bootstrap().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});
