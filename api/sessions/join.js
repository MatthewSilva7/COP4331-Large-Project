import mongoose from "mongoose";
import { connectToDatabase } from "../_lib/db.js";
import { Session } from "../_lib/models.js";

export default {
  async fetch(request) {
    try {
      if (request.method !== "POST") {
        return Response.json({ message: "Method not allowed" }, { status: 405 });
      }

      await connectToDatabase();

      const { sessionId, userId } = await request.json();

      if (!sessionId || !userId) {
        return Response.json(
          { message: "Missing required join fields" },
          { status: 400 },
        );
      }

      if (
        !mongoose.Types.ObjectId.isValid(sessionId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return Response.json({ message: "Invalid ID provided" }, { status: 400 });
      }

      const session = await Session.findById(sessionId);

      if (!session) {
        return Response.json({ message: "Session not found" }, { status: 404 });
      }

      if (String(session.userId) === String(userId)) {
        return Response.json(
          { message: "You are already hosting this session" },
          { status: 400 },
        );
      }

      const alreadyJoined = session.joinedUserIds?.some(
        (joinedUserId) => String(joinedUserId) === String(userId),
      );

      if (alreadyJoined) {
        return Response.json(
          { message: "You have already joined this session" },
          { status: 400 },
        );
      }

      session.joinedUserIds = [...(session.joinedUserIds || []), userId];
      await session.save();

      return Response.json({
        message: "You joined the session!",
        session,
      });
    } catch (error) {
      console.error("Join session error:", error);

      return Response.json(
        { message: "Server error: Could not join session" },
        { status: 500 },
      );
    }
  },
};
