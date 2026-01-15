import { Request, Response } from "express";
import prisma from "../config/db.config";

export const getChatExistsController = {
    getChatExists: async (req: Request, res: Response) => {
  try {
    const { id} = req.params;

    const checkGroupExists = await prisma.chatGroup.findUnique({
      where: { id:id },
    });

    if (!checkGroupExists) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "Group not found",
      });
    }

    return res.status(200).json({
      success: true,
      exists: true,
      group: checkGroupExists,
    });
  } catch (error) {
    console.log("Chat Exists Error:", error);

    return res.status(500).json({
      success: false,
      exists: false,
      message: "Server error",
    });
  }}
}