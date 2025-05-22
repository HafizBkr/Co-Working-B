import { Request, Response, NextFunction } from 'express';
import Chat from '../models/Chat';
import mongoose from 'mongoose';

// Extend Request interface to include chat info
declare global {
  namespace Express {
    interface Request {
      chat?: any;
    }
  }
}

// Check if user has access to the chat
export const hasChatAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatId = req.params.chatId;

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant of the chat
    if (!chat.participants.includes(new mongoose.Types.ObjectId(req.user.userId))) {
      return res.status(403).json({ message: 'You do not have access to this chat' });
    }

    // Attach chat to request object
    req.chat = chat;

    next();
  } catch (error) {
    console.error('Chat access check error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
