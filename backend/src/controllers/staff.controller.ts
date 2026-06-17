import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Institute } from "../models/Institute.js";
import { Staff } from "../models/Staff.js";
import { User } from "../models/User.js";

async function verifyInstituteIds(rawIds: unknown): Promise<{ ok: true; ids: string[] } | { ok: false; message: string }> {
  if (!Array.isArray(rawIds) || rawIds.length === 0) {
    return { ok: false, message: "instituteIds must be a non-empty array" };
  }
  const ids = rawIds.map(String);
  if (ids.some((id) => !isValidObjectId(id))) {
    return { ok: false, message: "instituteIds contains an invalid id" };
  }
  const found = await Institute.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) {
    return { ok: false, message: "One or more instituteIds do not exist" };
  }
  return { ok: true, ids };
}

export class StaffController {
  static async list(_req: Request, res: Response) {
    const staff = await Staff.find()
      .populate("instituteIds", "name code")
      .populate("userId", "userId role")
      .sort({ createdAt: -1 });
    res.status(200).json(staff);
  }

  static async get(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid staff id" });
      return;
    }
    const staff = await Staff.findById(id)
      .populate("instituteIds", "name code")
      .populate("userId", "userId role");
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    res.status(200).json(staff);
  }

  static async create(req: Request, res: Response) {
    const { fullName, email, phone, photoUrl, instituteIds, status, userId, password } = req.body ?? {};

    if (!fullName) {
      res.status(400).json({ message: "fullName is required" });
      return;
    }
    if (!userId || !password) {
      res.status(400).json({ message: "userId and password are required to create login credentials" });
      return;
    }

    const check = await verifyInstituteIds(instituteIds);
    if (!check.ok) {
      res.status(400).json({ message: check.message });
      return;
    }

    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      res.status(409).json({ message: "userId already exists" });
      return;
    }

    const staff = await Staff.create({
      fullName,
      email,
      phone,
      photoUrl,
      instituteIds: check.ids,
      status,
    });

    try {
      const user = await User.create({ userId, password, role: "staff", refId: staff._id });
      staff.userId = user._id as typeof staff.userId;
      await staff.save();
    } catch (error: any) {
      await Staff.deleteOne({ _id: staff._id });
      if (error?.code === 11000) {
        res.status(409).json({ message: "userId already exists" });
        return;
      }
      throw error;
    }

    const populated = await Staff.findById(staff._id)
      .populate("instituteIds", "name code")
      .populate("userId", "userId role");
    res.status(201).json(populated);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid staff id" });
      return;
    }

    const { fullName, email, phone, photoUrl, instituteIds, status } = req.body ?? {};
    const patch: Record<string, unknown> = {};
    if (fullName !== undefined) patch.fullName = fullName;
    if (email !== undefined) patch.email = email;
    if (phone !== undefined) patch.phone = phone;
    if (photoUrl !== undefined) patch.photoUrl = photoUrl;
    if (status !== undefined) patch.status = status;

    if (instituteIds !== undefined) {
      const check = await verifyInstituteIds(instituteIds);
      if (!check.ok) {
        res.status(400).json({ message: check.message });
        return;
      }
      patch.instituteIds = check.ids;
    }

    const staff = await Staff.findByIdAndUpdate(id, patch, { new: true, runValidators: true })
      .populate("instituteIds", "name code")
      .populate("userId", "userId role");
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    res.status(200).json(staff);
  }

  /** Admin: set a new login password for a staff member (e.g. when they forget it). */
  static async resetPassword(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid staff id" });
      return;
    }

    const { password } = req.body ?? {};
    if (typeof password !== "string" || password.trim().length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    if (!staff.userId) {
      res.status(400).json({ message: "This staff has no login account" });
      return;
    }

    const user = await User.findById(staff.userId);
    if (!user) {
      res.status(404).json({ message: "Login account not found" });
      return;
    }

    user.password = password.trim(); // hashed by the User pre-save hook
    await user.save();
    res.status(200).json({ message: "Password updated" });
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid staff id" });
      return;
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }

    if (staff.userId) {
      await User.deleteOne({ _id: staff.userId });
    }
    await Staff.deleteOne({ _id: staff._id });
    res.status(200).json({ message: "Staff deleted" });
  }
}
