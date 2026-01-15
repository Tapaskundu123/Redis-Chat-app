import { Request, Response } from "express";
import prisma from "../config/db.config";

export const ChatController = {
    getChats: async (req: Request, res: Response) => {
        try {
            const { groupId } = req.params;

            const chats = await prisma.chatMessage.findMany({
                where: {
                    group_id: groupId,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

            return res.status(200).json({
                success: true,
                message: "Chats fetched successfully",
                chats,
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
