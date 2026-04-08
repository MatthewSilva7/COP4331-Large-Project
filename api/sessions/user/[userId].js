import { connectToDatabase } from "../../_lib/db.js";
import { Session } from "../../_lib/models.js";

export default {
  async fetch(request) {
    try {
      await connectToDatabase();

      const url = new URL(request.url);
      const userId = decodeURIComponent(url.pathname.split("/").pop() || "");

      const sessions = await Session.find({
        $or: [{ userId }, { joinedUserIds: userId }],
      })
        .sort({ createdAt: -1 })
        .lean();

      const sessionsHosted = sessions.filter(
        (session) => String(session.userId) === String(userId),
      );
      const sessionsJoined = sessions.filter(
        (session) => String(session.userId) !== String(userId),
      );

      return Response.json({
        stats: {
          sessionsHosted: sessionsHosted.length,
          sessionsJoined: sessionsJoined.length,
          studyStreak: 0,
        },
        sessions: sessions.map((session) => ({
          ...session,
          isJoined: String(session.userId) !== String(userId),
        })),
      });
    } catch (error) {
      console.error("Dashboard sessions error:", error);

      return Response.json(
        { message: "Server error: Could not load sessions" },
        { status: 500 },
      );
    }
  },
};
