import { Request, Response, NextFunction } from "express";
import Message from "../models/Message";
import mongoose from "mongoose";

// Extend Request interface to include message info
declare global {
  namespace Express {
    interface Request {
      message?: any;
    }
  }
}

// Check if user has access to the message
export const hasMessageAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const messageId = req.params.messageId;

    // Find the message with populated chat
    const message = await Message.findById(messageId).populate("chat");
    if (!message) {
      res.status(404).json({ success: false, message: "Message not found" });
      return;
    }

    const chat = message.chat as any;

    // Check if user is a participant of the chat
    if (
      !chat.participants.includes(new mongoose.Types.ObjectId(req.user.userId))
    ) {
      res
        .status(403)
        .json({
          success: false,
          message: "You do not have access to this message",
        });
      return;
    }

    // Attach message to request object
    req.message = message;

    next();
  } catch (error) {
    console.error("Message access check error:", error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};

// Check if user is the sender of the message (for edit/delete operations)
export const isMessageSender = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.message) {
      res
        .status(400)
        .json({ success: false, message: "Message not found in request" });
      return;
    }

    if (req.message.sender.toString() !== req.user?.userId) {
      res
        .status(403)
        .json({
          success: false,
          message: "You can only modify your own messages",
        });
      return;
    }

    next();
  } catch (error) {
    console.error("Message sender check error:", error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};
