import express from "express";
import bcrypt from "bcryptjs";
import { requireAuth } from "../middleware/auth.js";
import UserModel from "../models/UserModel.js";

const router = express.Router();

// -------------------------
// POST - Signup
// -------------------------
router.post("/signup", (req, res): void => {
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

  (async () => {
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
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  })();
});

// -------------------------
// GET - Current user (me)
// -------------------------
router.get("/me", requireAuth, (req, res): void => {
  (async () => {
    try {
      const user = await UserModel.findById(req.user?.sub).lean();
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  })();
});

// -------------------------
// POST - Add task for user
// -------------------------
router.post("/me/tasks", requireAuth, (req, res): void => {
  (async () => {
    try {
      const { title, datetime } = req.body;
      if (!title || !datetime) {
        res.status(400).json({ message: "Title and datetime required" });
        return;
      }

      const newTask = {
        title,
        datetime: new Date(datetime),
        status: "PENDING",
      };

      const user = await UserModel.findByIdAndUpdate(
        req.user?.sub,
        { $push: { tasks: newTask } },
        { new: true }
      ).lean();

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  })();
});

// -------------------------
// PUT - Update current user (self)
// -------------------------
router.put("/me", requireAuth, (req, res): void => {
  (async () => {
    try {
      const ALLOWED = ["name", "picture", "buddyUrl", "buddyName"];
      const updates: Record<string, any> = {};
      for (const k of ALLOWED) {
        if (k in req.body) updates[k] = req.body[k];
      }

      const user = await UserModel.findByIdAndUpdate(req.user?.sub, updates, {
        new: true,
      }).lean();

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  })();
});

// -------------------------
// PATCH - Update buddy info
// -------------------------
router.patch("/signup", (req, res): void => {
  const { name, buddyUrl, buddyName } = req.body;
  (async () => {
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
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  })();
});

// -------------------------
// PUT - Update user by id (Admin)
// -------------------------
router.put("/update/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log("Update request body:", updates);

    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: updates }, // ⬅️ ИНГЭЖ ЗАС
      { new: true }
    ).lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// DELETE - Delete user by id (Admin)
// -------------------------
router.delete("/delete/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User deleted successfully", user });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
