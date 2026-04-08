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
  onLogout: () => void;
}

export default function DashboardPage({ user, onOpenProfile, onLogout }: DashboardPageProps) {
  const [hostedSessions, setHostedSessions] = useState<SessionSummary[]>([]);
  const [availableSessions, setAvailableSessions] = useState<SessionSummary[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<SessionSummary[]>([]); // Local state for demo joining
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isHostSessionOpen, setIsHostSessionOpen] = useState(false);
  const [isJoiningSessionId, setIsJoiningSessionId] = useState("");
  
  // Form State
  const [courseSubject, setCourseSubject] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [professorLastName, setProfessorLastName] = useState("");
  const [location, setLocation] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");

  const loadDashboard = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError("");

    try {
      const [data, available] = await Promise.all([
        getDashboardData(user.id),
        getAvailableSessions(user.id),
      ]);
      setHostedSessions(data.sessions || []);
      setAvailableSessions(available || []);
    } catch (err: any) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user.id]);

  // HELPER: Convert string times to sortable numbers
  const getTimeValue = (session: SessionSummary) => {
    // This looks for dates in the string format like "Apr 10" or "Monday, April 13"
    // Since it's a mock/demo, we'll try to parse it or default to a high number
    const date = new Date(session.time.replace(' at ', ' '));
    return isNaN(date.getTime()) ? Date.now() : date.getTime();
  };

  // NEXT UP LOGIC: Combine hosted and locally joined sessions, then sort by time
  const mySchedule = [...hostedSessions, ...joinedSessions].sort((a, b) => 
    getTimeValue(a) - getTimeValue(b)
  );

  const handleJoinSession = async (session: SessionSummary) => {
    setIsJoiningSessionId(session._id);
    try {
      // Call mock backend
      await joinSession({ sessionId: session._id, userId: user.id });
      
      // LOCAL MOVE: Remove from available, add to joined for this session
      setAvailableSessions(prev => prev.filter(s => s._id !== session._id));
      setJoinedSessions(prev => [...prev, { ...session, isJoined: true }]);
    } catch (err: any) {
      alert(err.message || "Could not join session.");
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
      // Formatting time to be human-readable
      const displayTime = `${new Date(sessionDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${sessionTime}`;
      
      await createSession({
        subject: formattedSubject,
        location,
        time: displayTime,
        hostName: `${user.firstName} ${user.lastName}`,
        userId: user.id,
      });

      setIsHostSessionOpen(false);
      setCourseSubject(""); setCourseNumber(""); setProfessorLastName(""); setLocation("");
      await loadDashboard(false);
    } catch (err: any) {
      setFormError(err.message || "Could not create session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAvailable = availableSessions.filter((s) =>
    `${s.subject} ${s.location} ${s.hostName}`.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-[#f9f7f2] font-sans">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Welcome Header */}
        <section className="overflow-hidden rounded-[2rem] border border-[#d9d5c7] bg-[linear-gradient(135deg,#f6f1e7_0%,#ece6d7_45%,#e4dbc6_100%)] shadow-lg">
          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6d654f]">Study Buddy Dashboard</p>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-[#201c15] sm:text-5xl">Welcome back, {user.firstName}.</h1>
              <div className="mt-8 flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsHostSessionOpen(true)} 
                  className="rounded-full bg-[#3d5a40] px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#314934]"
                >
                  Host a Session
                </button>
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
              <button onClick={onLogout} className="mt-3 w-full rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 text-center">Log Out</button>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
          {/* LEFT: NEXT UP (CHRONOLOGICAL LIST) */}
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-semibold text-[#201c15] mb-6">Next up</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {isLoading ? <p className="text-sm text-gray-500">Loading schedule...</p> : 
               mySchedule.length > 0 ? mySchedule.map(session => (
                <div key={session._id} className="p-4 rounded-2xl bg-[#f8f2e7] border border-[#efe8da] relative">
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase text-[#7d765f] px-2 py-1 bg-white/50 rounded-full">
                    {session.isJoined ? "Joined" : "Hosting"}
                  </span>
                  <h3 className="text-lg font-bold text-[#201c15] pr-12">{session.subject}</h3>
                  <p className="text-sm text-[#5e584b] mt-1">{session.time}</p>
                  <p className="text-xs text-[#7d765f] mt-2">📍 {session.location}</p>
                </div>
              )) : (
                <p className="text-sm text-gray-500 italic">No sessions scheduled. Join one from the feed!</p>
              )}
            </div>
          </div>

          {/* RIGHT: VIEW ALL SESSIONS (AVAILABLE FEED) */}
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="font-serif text-3xl font-semibold text-[#201c15]">View all sessions</h2>
              <input 
                type="search" 
                value={sessionSearch} 
                onChange={(e) => setSessionSearch(e.target.value)} 
                placeholder="Search sessions..." 
                className="w-full max-w-xs rounded-full border border-[#d6cfbf] bg-[#fcfaf4] px-4 py-2.5 text-sm outline-none focus:border-[#5a5a40]" 
              />
            </div>

            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredAvailable.length > 0 ? filteredAvailable.map((session) => (
                <article key={session._id} className="rounded-[1.5rem] border border-[#efe8da] bg-white p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-[#201c15]">{session.subject}</h3>
                      <p className="text-sm text-[#5e584b] mt-1">{session.time}</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-[#4c4638]">📍 {session.location}</p>
                        <p className="text-xs text-[#7d765f] font-semibold uppercase tracking-wider">
                          👤 Hosted by {session.hostName}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleJoinSession(session)}
                      disabled={isJoiningSessionId === session._id}
                      className="rounded-full bg-[#3d5a40] px-6 py-2 text-sm text-white font-bold transition hover:bg-[#314934] disabled:opacity-50"
                    >
                      {isJoiningSessionId === session._id ? "..." : "Join"}
                    </button>
                  </div>
                </article>
              )) : <p className="text-center py-10 text-gray-400">No joinable sessions found.</p>}
            </div>
          </div>
        </section>
      </div>

      {/* HOST SESSION MODAL */}
      {isHostSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a12]/55 px-4 backdrop-blur-sm" onClick={() => setIsHostSessionOpen(false)}>
          <div className="w-full max-w-lg rounded-[2.5rem] border border-[#e6dfd0] bg-[#fffdf8] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-3xl font-semibold text-[#201c15] mb-2">Host a Session</h2>
            <p className="text-sm text-[#6d654f] mb-6">Create a new group for others to join.</p>
            <form className="space-y-4" onSubmit={handleCreateSession}>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required value={courseSubject} onChange={(e) => setCourseSubject(e.target.value.toUpperCase().slice(0,3))} placeholder="Subject (COP)" className="rounded-xl border p-3 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none" />
                <input type="text" required value={courseNumber} onChange={(e) => setCourseNumber(e.target.value.replace(/\D/g, "").slice(0,4))} placeholder="Number (4331)" className="rounded-xl border p-3 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none" />
              </div>
              <input type="text" required value={professorLastName} onChange={(e) => setProfessorLastName(e.target.value)} placeholder="Professor Last Name" className="w-full rounded-xl border p-3 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none" />
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full rounded-xl border p-3 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" required value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="rounded-xl border p-3 text-sm outline-none" />
                <input type="time" required value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} className="rounded-xl border p-3 text-sm outline-none" />
              </div>
              {formError && <p className="text-xs text-red-500 font-bold">{formError}</p>}
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setIsHostSessionOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-full bg-[#5A5A40] px-8 py-3 text-sm text-white font-bold shadow-lg hover:bg-[#4a4a34] disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Host Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
