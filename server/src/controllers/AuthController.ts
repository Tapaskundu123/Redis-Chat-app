import Prisma from "../config/db.config";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

interface UserData {
  name: string;
  email: string;
  provider: string;
  image?: string;
  oauth_id: string;
}

export async function AuthLogin(req: Request, res: Response) {
  try {
    const body: UserData = req.body;

    if (!body || !body.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    let user = await Prisma.user.findUnique({
      where: { email: body.email },
    });

    if (user) {
      // ✅ Update user data if already exists (optional but recommended)
      user = await Prisma.user.update({
        where: { email: body.email },
        data: {
          name: body.name,
          image: body.image,
          provider: body.provider,
          oauth_id: body.oauth_id,
        },
      });
    } else {
      // ✅ Create user if doesn't exist
      user = await Prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          provider: body.provider,
          image: body.image,
          oauth_id: body.oauth_id,
        },
      });
    }

    // ✅ Ensure JWT secret exists
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT secret not defined");
    }

    // ✅ Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user,
      token, // Return token for frontend to use in Authorization header
    });
  } catch (error) {
    console.error("AuthController Error:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}
