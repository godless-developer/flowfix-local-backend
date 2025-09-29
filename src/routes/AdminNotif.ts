// routes/AdminNotif.ts
import express, { Request, Response } from "express";
import AdminNotifModel from "../models/AdminNotifModel.js";

const router = express.Router();

router.post("/admin", async (req: Request, res: Response): Promise<void> => {
  try {
    const { AdNotif, title } = req.body;
    if (!AdNotif) {
      res.status(400).json({ message: "AdNotif is required" });
      return;
    }
    const created = await AdminNotifModel.create({ AdNotif, title });
    res.status(201).json({
      message: "Мэдэгдэл амжилттай хадгалагдлаа",
      data: created,
    });
  } catch (err) {
    console.error("POST /notif/admin error:", err);
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

router.get("/all", async (_req: Request, res: Response): Promise<void> => {
  try {
    const allNotif = await AdminNotifModel.find().sort({ createdAt: -1 });
    if (!allNotif || allNotif.length === 0) {
      res.status(404).json({ message: "No notifs found" });
      return;
    }
    res.status(200).json(allNotif);
  } catch (err) {
    console.error("GET /notif/all error:", err);
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await AdminNotifModel.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Notif not found" });
      return;
    }
    res.status(200).json({ message: "Notif deleted", data: deleted });
  } catch (err) {
    console.error("DELETE /notif/:id error:", err);
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { AdNotif, title } = req.body;
    if (!AdNotif) {
      res.status(400).json({ message: "AdNotif is required" });
      return;
    }
    const updated = await AdminNotifModel.findByIdAndUpdate(
      id,
      { AdNotif, title },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: "Notif not found" });
      return;
    }
    res.status(200).json({ message: "Notif updated", data: updated });
  } catch (err) {
    console.error("PUT /notif/:id error:", err);
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

router.get("/latest", async (_req: Request, res: Response): Promise<void> => {
  try {
    const latest = await AdminNotifModel.findOne().sort({ createdAt: -1 });
    if (!latest) {
      res.status(404).json({ message: "Мэдэгдэл олдсонгүй" });
      return;
    }
    res.status(200).json({
      notif: latest.AdNotif,
      title: latest.title,
      createdAt: latest.createdAt,
    });
  } catch (err) {
    console.error("GET /notif/latest error:", err);
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

export default router;
