// routes/login.ts
import express from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";

const router = express.Router();

router.post("/loginAdmin", async (req, res): Promise<void> => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      res.status(400).json({ message: "Нэр болон нууц үг шаардлагатай." });
      return;
    }

    const user = await UserModel.findOne({ name });
    if (!user) {
      res.status(404).json({ message: "Хэрэглэгч олдсонгүй." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Нууц үг буруу байна." });
      return;
    }

    // зөвхөн ADMIN руу нэвтрүүлэх
    if (user.role !== "ADMIN") {
      res
        .status(403)
        .json({ message: "Уучлаарай, зөвхөн ADMIN нэвтрэх боломжтой." });
      return;
    }

    res.status(200).json({
      message: "Амжилттай нэвтэрлээ.",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        department: user.department,
        position: user.position,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Серверийн алдаа.", error });
  }
});

// POST /api/login - Login user
router.post("/login", (req, res): void => {
  (async () => {
    try {
      const { name, password } = req.body;
      if (!name || !password) {
        return res
          .status(400)
          .json({ message: "Нэр болон нууц үг шаардлагатай." });
      }

      const user = await UserModel.findOne({ name });
      if (!user) {
        return res.status(404).json({ message: "Хэрэглэгч олдсонгүй." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Нууц үг буруу байна." });
      }

      return res.status(200).json({
        message: "Амжилттай нэвтэрлээ.",
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          buddyUrl: user.buddyUrl,
          buddyName: user.buddyName,
          status: user.status,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Серверийн алдаа.", error });
    }
  })();
});

// GET /api/login?name=USERNAME - Get user info
router.get("/login", (req, res): void => {
  (async () => {
    try {
      const { name } = req.query;
      if (!name) return res.status(400).json({ message: "name шаардлагатай." });

      const user = await UserModel.findOne({ name });
      if (!user)
        return res.status(404).json({ message: "Хэрэглэгч олдсонгүй." });

      return res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          buddyUrl: user.buddyUrl,
          buddyName: user.buddyName,
          status: user.status,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: "Серверийн алдаа." });
    }
  })();
});

router.patch("/login", (req, res): void => {
  (async () => {
    try {
      const { name, updates } = req.body;
      if (!name || !updates) {
        return res
          .status(400)
          .json({ message: "name болон updates шаардлагатай." });
      }

      const user = await UserModel.findOneAndUpdate({ name }, updates, {
        new: true,
      });

      if (!user) {
        return res.status(404).json({ message: "Хэрэглэгч олдсонгүй." });
      }

      return res.status(200).json({
        message: "Мэдээллийг шинэчиллээ.",
        user: {
          name: user.name,
          role: user.role,
          buddyUrl: user.buddyUrl,
          buddyName: user.buddyName,
          status: user.status,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Серверийн алдаа.", error });
    }
  })();
});
router.get("/alluser", async (_req, res) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });

    res.status(200).json(
      users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        buddyUrl: user.buddyUrl,
        buddyName: user.buddyName,
        status: user.status,
        createdAt: user.createdAt,
        position: user.position,
        department: user.department,
      }))
    );
  } catch (err) {
    console.error("GET /users/alluser error:", err);
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

export default router;
