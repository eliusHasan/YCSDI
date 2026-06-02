import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Institute } from "../models/Institute.js";
import { Staff } from "../models/Staff.js";

export class InstituteController {
  static async list(_req: Request, res: Response) {
    const institutes = await Institute.find().sort({ createdAt: -1 });
    res.status(200).json(institutes);
  }

  // Public: active institutes only, minimal fields for the registration form.
  static async publicList(_req: Request, res: Response) {
    const institutes = await Institute.find({ status: "active" })
      .select("name code")
      .sort({ name: 1 });
    res.status(200).json(institutes);
  }

  static async get(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid institute id" });
      return;
    }
    const institute = await Institute.findById(id);
    if (!institute) {
      res.status(404).json({ message: "Institute not found" });
      return;
    }
    res.status(200).json(institute);
  }

  static async create(req: Request, res: Response) {
    const { name, code, address, contactEmail, contactPhone, status } = req.body ?? {};

    if (!name || !code) {
      res.status(400).json({ message: "name and code are required" });
      return;
    }

    try {
      const institute = await Institute.create({
        name,
        code,
        address,
        contactEmail,
        contactPhone,
        status,
      });
      res.status(201).json(institute);
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({ message: "An institute with that code already exists" });
        return;
      }
      throw error;
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid institute id" });
      return;
    }

    const { name, code, address, contactEmail, contactPhone, status } = req.body ?? {};
    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (code !== undefined) patch.code = code;
    if (address !== undefined) patch.address = address;
    if (contactEmail !== undefined) patch.contactEmail = contactEmail;
    if (contactPhone !== undefined) patch.contactPhone = contactPhone;
    if (status !== undefined) patch.status = status;

    try {
      const institute = await Institute.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
      if (!institute) {
        res.status(404).json({ message: "Institute not found" });
        return;
      }
      res.status(200).json(institute);
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({ message: "An institute with that code already exists" });
        return;
      }
      throw error;
    }
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid institute id" });
      return;
    }

    const assignedStaffCount = await Staff.countDocuments({ instituteIds: id });
    if (assignedStaffCount > 0) {
      res.status(409).json({
        message: `Cannot delete: ${assignedStaffCount} staff member(s) are assigned to this institute. Reassign them first.`,
      });
      return;
    }

    const result = await Institute.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ message: "Institute not found" });
      return;
    }
    res.status(200).json({ message: "Institute deleted" });
  }
}
