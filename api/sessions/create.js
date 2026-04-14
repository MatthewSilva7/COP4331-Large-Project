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

      const { subject, location, time, hostName, userId } = await request.json();

      if (!subject || !location || !time || !hostName || !userId) {
        return Response.json(
          { message: "Missing required session fields" },
          { status: 400 },
        );
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return Response.json(
          { message: "Invalid user ID" },
          { status: 400 },
        );
      }

      const session = await Session.create({
        subject: String(subject).trim(),
        location: String(location).trim(),
        time: String(time).trim(),
        hostName: String(hostName).trim(),
        userId,
      });

      return Response.json(
        {
          message: "Study session created!",
          session,
        },
        { status: 201 },
      );
    } catch (error) {
      console.error("Create session error:", error);

      return Response.json(
        { message: "Server error: Could not create session" },
        { status: 500 },
      );
    }
  },
};
