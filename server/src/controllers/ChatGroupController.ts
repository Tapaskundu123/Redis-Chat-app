import { Request, Response } from "express";
import prisma from "../config/db.config";

interface Group {
  title: string;
  passcode: string;
}

export const Chatgroup = {
  // ================= GET =================
  get: async (req: Request, res: Response) => {
    try {
      const user = req.user;

      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const groups = await prisma.chatGroup.findMany({
        where: {
          user_id: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Chat groups fetched successfully",
        groups,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  },

  // ================= POST =================
  post: async (req: Request, res: Response) => {
    try {
      const data: Group = req.body;
      const user = req.user;

      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const group = await prisma.chatGroup.create({
        data: {
          title: data.title,
          passcode: data.passcode,
          user_id: user.id,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Group chat created successfully",
        group,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  },

  // ================= UPDATE =================
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user;

      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const group = await prisma.chatGroup.update({
        where: {
          id_user_id: {
            id,
            user_id: user.id, // 🔐 prevents updating others’ groups
          },
        },
        data: {
          title: data.title,
          passcode: data.passcode,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Chat group updated successfully",
        group,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  },
};
