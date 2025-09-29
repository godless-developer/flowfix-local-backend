import express, { Request, Response } from "express";
import InfoAiModel from "../models/InfoAiModel.js";

const router = express.Router();

// === POST: add new info ===
router.post("/info", (req: Request, res: Response): void => {
  (async () => {
    try {
      const { title, info, files } = req.body; // ⬅️ fileName/fileExt биш, files[]
      if (!info) return res.status(400).json({ error: "Info is required" });

      const created = await InfoAiModel.create({
        title,
        info,
        files, // ⬅️ шууд массив хадгална
      });

      res.status(201).json({ message: "Info saved", data: created });
    } catch (err) {
      console.error("POST /info error:", err);
      res.status(500).json({ error: "Server error while saving info" });
    }
  })();
});

// === GET: fetch all info entries ===
router.get("/infos", async (_: Request, res: Response) => {
  try {
    const all = await InfoAiModel.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    console.error("GET /info error:", err);
    res.status(500).json({ error: "Server error while fetching info" });
  }
});

// === PUT: update info ===
router.put("/info/:id", (req: Request, res: Response): void => {
  (async () => {
    try {
      const { id } = req.params;
      const { title, info, files } = req.body; // ⬅️ files array

      if (!info) {
        return res.status(400).json({ error: "Info is required for update" });
      }

      const updated = await InfoAiModel.findByIdAndUpdate(
        id,
        { title, info, files },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: "Info not found" });
      }

      res.json({ message: "Info updated", data: updated });
    } catch (err) {
      console.error("PUT /info/:id error:", err);
      res.status(500).json({ error: "Server error while updating info" });
    }
  })();
});

// === DELETE: remove info ===
router.delete("/info/:id", (req: Request, res: Response): void => {
  (async () => {
    try {
      const { id } = req.params;

      const deleted = await InfoAiModel.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Info not found" });
      }

      res.json({ message: "Info deleted", data: deleted });
    } catch (err) {
      console.error("DELETE /info/:id error:", err);
      res.status(500).json({ error: "Server error while deleting info" });
    }
  })();
});

export default router;
