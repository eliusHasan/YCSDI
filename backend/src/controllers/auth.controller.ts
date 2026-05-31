import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { signToken } from "../middleware/auth.middleware.js";

export class AuthController {
  static async login(req: Request, res: Response) {
    const { userId, password } = req.body ?? {};

    if (!userId || !password) {
      res.status(400).json({ message: "userId and password are required" });
      return;
    }

    const user = await User.findOne({ userId });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken(user);
    res.status(200).json({
      token,
      user: {
        id: String(user._id),
        userId: user.userId,
        role: user.role,
      },
    });
  }

  static async me(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    res.status(200).json({
      user: {
        id: String(req.user._id),
        userId: req.user.userId,
        role: req.user.role,
      },
    });
  }
}
