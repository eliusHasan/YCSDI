import type { NextFunction, Request, Response } from "express";
import { getFirebaseAdmin } from "../modules/auth/firebase/firebase-admin.js";

export async function firebaseAuthMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token = request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    response.status(401).json({ message: "Missing authorization token" });
    return;
  }

  try {
    const decodedToken = await getFirebaseAdmin().auth().verifyIdToken(token);
    response.locals.firebaseUser = decodedToken;
    next();
  } catch {
    response.status(401).json({ message: "Invalid authorization token" });
  }
}
