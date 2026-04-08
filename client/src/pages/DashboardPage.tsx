import React, { useEffect, useState } from "react";
import {
  createSession,
  getAvailableSessions,
  getDashboardData,
  joinSession,
} from "../services/authService";
import type { AuthUser, DashboardData, SessionSummary } from "../types/auth";

interface DashboardPageProps {
  user: AuthUser;
  onOpenProfile: () => void;
  onLogout: () => void; // Added for the new Logout button
}

export default function DashboardPage({ user, onOpenProfile, onLogout }: DashboardPageProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [availableSessions, setAvailableSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [isJoinSessionOpen, setIsJoinSessionOpen] = useState(false);
  const [isHostSessionOpen, setIsHostSessionOpen] = useState(false);
  const [isJoiningSessionId, setIsJoiningSessionId] = useState("");
  const [courseSubject, setCourseSubject] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [professorLastName, setProfessorLastName] = useState("");
  const [location, setLocation] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");
  const [showProfileMatchesOnly, setShowProfileMatchesOnly] = useState(false);

  const loadDashboard = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError("");

    try {
      const [data, available] = await Promise.all([
        getDashboardData(user.id),
        getAvailableSessions(user.id),
      ]);
      setDashboardData(data);
      setAvailableSessions(available);
    } catch (err: any) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        const [data, available] = await Promise.all([
          getDashboardData(user.id),
          getAvailableSessions(user.id),
        ]);
        if (isMounted) {
          setDashboardData(data);
          setAvailableSessions(available);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Could not load dashboard data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    initializeDashboard();
    return () => { isMounted = false; };
  }, [user.id]);

  // COMBINE SESSIONS FOR THE MAIN LIST
  // We merge hosted sessions (from dashboardData) and joinable ones (availableSessions)
  const allSessions = [
    ...(dashboardData?.sessions ?? []).map(s => ({ ...s, canJoin: false })),
    ...availableSessions.map(s => ({ ...s, canJoin: true }))
  ];

  const handleJoinSession = async (sessionId: string) => {
    setIsJoiningSessionId(sessionId);
    setJoinError("");
    setJoinMessage("");
    try {
      const result = await joinSession({ sessionId, userId: user.id });
      setJoinMessage(result.message);
      await loadDashboard(false);
    } catch (err: any) {
      setJoinError(err.message || "Could not join session.");
    } finally {
      setIsJoiningSessionId("");
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const formattedSubject = `${courseSubject.toUpperCase()} ${courseNumber} - Prof. ${professorLastName}`;
      await createSession({
        subject: formattedSubject,
        location,
        time: `${sessionDate} at ${sessionTime}`,
        hostName: `${user.firstName} ${user.lastName}`,
        userId: user.id,
      });

      setIsHostSessionOpen(false);
      await loadDashboard(false);
    } catch (err: any) {
      setFormError(err.message || "Could not create session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter combined list based on search
  const filteredSessions = allSessions.filter((session) => {
    const haystack = `${session.subject} ${session.location} ${session.hostName}`.toLowerCase();
    return haystack.includes(sessionSearch.toLowerCase());
  });

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-[#f9f7f2]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#d9d5c7] bg-[linear-gradient(135deg,#f6f1e7_0%,#ece6d7_45%,#e4dbc6_100%)] shadow-lg">
          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6d654f]">Study Buddy Dashboard</p>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-[#201c15] sm:text-5xl">Welcome back, {user.firstName}.</h1>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => setIsJoinSessionOpen(true)} className="rounded-full bg-[#3d5a40] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#314934]">Browse Sessions</button>
                <button onClick={() => setIsHostSessionOpen(true)} className="rounded-full border border-[#8a826b] bg-white/70 px-5 py-3 text-sm font-semibold text-[#2e2a22] transition hover:bg-white">Host a Session</button>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-white/60 bg-white/70 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7a735c]">Account</p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5a5a40] text-2xl font-semibold text-white">{user.firstName.charAt(0)}</div>
                <div>
                  <h2 className="text-xl font-semibold text-[#201c15]">{user.firstName} {user.lastName}</h2>
                  <p className="text-sm text-[#5f584a]">{user.email}</p>
                </div>
              </div>
              <button onClick={onOpenProfile} className="mt-6 w-full rounded-full border border-[#8a826b] px-4 py-3 text-sm font-semibold transition hover:bg-[#f7f2e8]">Open profile page</button>
              
              {/* LOGOUT BUTTON */}
              <button onClick={onLogout} className="mt-3 w-full rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100">Log Out</button>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.72fr_1.58fr]">
          {/* LEFT: UPCOMING (HOSTED) */}
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-semibold text-[#201c15]">Next up</h2>
            {isLoading ? <p className="mt-4">Loading...</p> : dashboardData?.sessions[0] ? (
              <div className="mt-6 rounded-[1.5rem] bg-[#f8f2e7] p-5 border border-[#efe8da]">
                <h3 className="text-2xl font-semibold">{dashboardData.sessions[0].subject}</h3>
                <p className="mt-3 text-sm">{dashboardData.sessions[0].time}</p>
                <p className="mt-4 text-xs font-bold uppercase text-[#7d765f]">You're hosting this</p>
              </div>
            ) : <p className="mt-4 text-gray-500">Nothing scheduled yet.</p>}
          </div>

          {/* RIGHT: ALL SESSIONS FEED */}
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="font-serif text-3xl font-semibold text-[#201c15]">View all sessions</h2>
              <input type="search" value={sessionSearch} onChange={(e) => setSessionSearch(e.target.value)} placeholder="Search sessions..." className="w-full max-w-xs rounded-full border border-[#d6cfbf] bg-[#fcfaf4] px-4 py-2.5 text-sm" />
            </div>

            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredSessions.map((session) => (
                <article key={session._id} className="rounded-[1.5rem] border border-[#efe8da] bg-white p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-[#201c15]">{session.subject}</h3>
                      <p className="mt-1 text-sm text-[#5e584b]">{session.time}</p>
                      <p className="mt-3 text-sm text-[#4c4638]">Location: {session.location}</p>
                    </div>
                    {session.canJoin ? (
                      <button 
                        onClick={() => handleJoinSession(session._id)}
                        disabled={isJoiningSessionId === session._id}
                        className="rounded-full bg-[#3d5a40] px-4 py-2 text-sm text-white font-semibold"
                      >
                        {isJoiningSessionId === session._id ? "Joining..." : "Join"}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#5a5a40] bg-[#f5efe2] px-3 py-1 rounded-full">Your Session</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* MODALS RENDERED AS BEFORE... (Host Session Modal, etc.) */}
    </main>
  );
}
