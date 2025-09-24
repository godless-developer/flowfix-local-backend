import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /signup
 * Шинэ хэрэглэгч бүртгэх
 */
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    email,
    password = "",
    buddyUrl = "",
    buddyName = "",
    role = "USER",
    department = "",
    position = "",
  } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      buddyUrl,
      buddyName,
      role,
      department,
      position,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("POST /signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /me
 * Одоогийн хэрэглэгч (JWT-ээс)
 */
router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await UserModel.findById(req.user!.sub).lean();
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      console.error("GET /me error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * POST /me/tasks
 * Одоогийн хэрэглэгчид task нэмэх
 */
router.post(
  "/me/tasks",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, datetime } = req.body;
      if (!title || !datetime) {
        res.status(400).json({ message: "Title and datetime required" });
        return;
      }

      const newTask = {
        title,
        datetime: new Date(datetime),
        status: "PENDING" as const,
      };

      const user = await UserModel.findByIdAndUpdate(
        req.user!.sub,
        { $push: { tasks: newTask } },
        { new: true }
      ).lean();

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      console.error("POST /me/tasks error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * PUT /me
 * Одоогийн хэрэглэгч өөрийн профайлаа шинэчилнэ
 */
router.put(
  "/me",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const ALLOWED = ["name", "picture", "buddyUrl", "buddyName"] as const;
      const updates: Record<string, unknown> = {};
      for (const k of ALLOWED) {
        if (k in req.body) updates[k] = (req.body as any)[k];
      }

      const user = await UserModel.findByIdAndUpdate(req.user!.sub, updates, {
        new: true,
      }).lean();

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      console.error("PUT /me error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * PATCH /signup
 * Нэрээр нь buddy мэдээлэл шинэчлэх (хуучин логик тань)
 */
router.patch("/signup", async (req: Request, res: Response): Promise<void> => {
  const { name, buddyUrl, buddyName } = req.body;
  try {
    const updated = await UserModel.findOneAndUpdate(
      { name },
      { buddyUrl, buddyName },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "Buddy updated", user: updated });
  } catch (err) {
    console.error("PATCH /signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /update/:id
 * Админ: хэрэглэгчийн мэдээлэл шинэчлэх
 */
router.put(
  "/update/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await UserModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).lean();

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({ message: "User updated successfully", user });
    } catch (err) {
      console.error("PUT /update/:id error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * DELETE /delete/:id
 * Админ: хэрэглэгч устгах
 */
router.delete(
  "/delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await UserModel.findByIdAndDelete(id);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({ message: "User deleted successfully", user });
    } catch (err) {
      console.error("DELETE /delete/:id error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
