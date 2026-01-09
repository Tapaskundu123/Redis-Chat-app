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

export async function POST(req: Request, res: Response) {
  try {
    const body: UserData = req.body;

    if (!body || !body.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    const existingUser = await Prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ✅ Create user first
    const user = await Prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        provider: body.provider,
        image: body.image,
        oauth_id: body.oauth_id,
      },
    });

    // ✅ Ensure JWT secret exists
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT secret not defined");
    }

    // ✅ Generate token AFTER user creation
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // ✅ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
