import { connectToDatabase } from "../../_lib/db.js";
import { Session } from "../../_lib/models.js";

export default {
  async fetch(request) {
    try {
      await connectToDatabase();

      const url = new URL(request.url);
      const userId = decodeURIComponent(url.pathname.split("/").pop() || "");

      const sessions = await Session.find({
        userId: { $ne: userId },
        joinedUserIds: { $ne: userId },
      })
        .sort({ createdAt: -1 })
        .lean();

      return Response.json({ sessions });
    } catch (error) {
      console.error("Available sessions error:", error);

      return Response.json(
        { message: "Server error: Could not load available sessions" },
        { status: 500 },
      );
    }
  },
};
