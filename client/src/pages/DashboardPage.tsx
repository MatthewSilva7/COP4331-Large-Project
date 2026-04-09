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
  const [joinedSessions, setJoinedSessions] = useState<SessionSummary[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal States
  const [isHostSessionOpen, setIsHostSessionOpen] = useState(false);
  const [viewingParticipants, setViewingParticipants] = useState<SessionSummary | null>(null);
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
    try {
      const [data, available] = await Promise.all([
        getDashboardData(user.id),
        getAvailableSessions(user.id),
      ]);
      setHostedSessions(data.sessions || []);
      // Filter out sessions where YOU are the host
      const filteredAvailable = (available || []).filter(s => s.userId !== user.id);
      setAvailableSessions(filteredAvailable);
    } catch (err: any) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, [user.id]);

  // Helper for sorting chronological order
  const getTimeValue = (session: SessionSummary) => {
    const date = new Date(session.time.replace(' at ', ' '));
    return isNaN(date.getTime()) ? Date.now() : date.getTime();
  };

  const mySchedule = [...hostedSessions, ...joinedSessions].sort((a, b) => 
    getTimeValue(a) - getTimeValue(b)
  );

  const handleJoinSession = async (session: SessionSummary) => {
    setIsJoiningSessionId(session._id);
    try {
      await joinSession({ sessionId: session._id, userId: user.id });
      
      // Inject yourself into participants locally for the demo
      const joinedWithMe = { 
        ...session, 
        isJoined: true,
        participants: [
          ...(session.participants || []), 
          { firstName: user.firstName, lastName: user.lastName, _id: user.id }
        ]
      };

      setAvailableSessions(prev => prev.filter(s => s._id !== session._id));
      setJoinedSessions(prev => [...prev, joinedWithMe]);
    } catch (err: any) {
      alert("Could not join.");
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
    s.subject.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-[#f9f7f2]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        
        {/* Header Section */}
        <section className="overflow-hidden rounded-[2rem] border border-[#d9d5c7] bg-[linear-gradient(135deg,#f6f1e7_0%,#ece6d7_45%,#e4dbc6_100%)] shadow-lg p-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6d654f]">Study Buddy Dashboard</p>
              <h1 className="mt-3 font-serif text-5xl font-semibold text-[#201c15]">Welcome back, {user.firstName}.</h1>
              <button 
                onClick={() => setIsHostSessionOpen(true)} 
                className="mt-8 rounded-full bg-[#3d5a40] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#314934] transition-all transform active:scale-95"
              >
                Host a Session
              </button>
            </div>
            <aside className="bg-white/70 p-6 rounded-3xl border border-white/60 backdrop-blur w-64 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7a735c] mb-4">Account</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#5a5a40] flex items-center justify-center text-white font-bold">{user.firstName[0]}</div>
                <h2 className="font-bold text-[#201c15] text-sm">{user.firstName} {user.lastName}</h2>
              </div>
              <button onClick={onLogout} className="w-full rounded-full bg-red-50 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors">Log Out</button>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
          
          {/* LEFT: YOUR SCHEDULE */}
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-semibold text-[#201c15] mb-6">Your Schedule</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {mySchedule.map(s => (
                <div key={s._id} className="p-4 rounded-2xl bg-[#f8f2e7] border border-[#efe8da] group cursor-pointer" onClick={() => setViewingParticipants(s)}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold group-hover:underline text-[#201c15]">{s.subject}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-white/50 rounded-full">{s.isJoined ? "Joined" : "Host"}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{s.time}</p>
                </div>
              ))}
              {mySchedule.length === 0 && <p className="text-sm text-gray-400 italic">Nothing scheduled yet.</p>}
            </div>
          </div>

          {/* RIGHT: ALL SESSIONS */}
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="font-serif text-3xl font-semibold text-[#201c15]">Join a Session</h2>
              <input 
                type="search" 
                value={sessionSearch} 
                onChange={(e) => setSessionSearch(e.target.value)} 
                placeholder="Search subjects..." 
                className="w-full max-w-xs rounded-full border border-[#d6cfbf] bg-[#fcfaf4] px-4 py-2.5 text-sm outline-none focus:border-[#5a5a40]" 
              />
            </div>
            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredAvailable.map((session) => (
                <article key={session._id} className="rounded-[1.5rem] border border-[#efe8da] p-5 bg-white flex justify-between items-center hover:shadow-md transition-shadow">
                  <div className="cursor-pointer" onClick={() => setViewingParticipants(session)}>
                    <h3 className="text-xl font-bold text-[#201c15] hover:text-[#3d5a40]">{session.subject}</h3>
                    <p className="text-sm text-[#5e584b]">{session.time}</p>
                    <p className="text-xs text-[#7d765f] mt-1 font-semibold uppercase tracking-wider">Hosted by {session.hostName}</p>
                  </div>
                  <button 
                    onClick={() => handleJoinSession(session)}
                    disabled={isJoiningSessionId === session._id}
                    className="rounded-full bg-[#3d5a40] px-6 py-2 text-sm text-white font-bold hover:bg-[#314934] transition-colors disabled:opacity-50"
                  >
                    {isJoiningSessionId === session._id ? "..." : "Join"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* PARTICIPANT MODAL */}
      {viewingParticipants && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setViewingParticipants(null)}>
          <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-2xl font-bold mb-1">{viewingParticipants.subject}</h2>
            <p className="text-sm text-gray-400 mb-6 font-medium">Session Attendees</p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-[#5a5a40] flex items-center justify-center text-white text-xs font-bold">H</div>
                <p className="text-sm font-bold">{viewingParticipants.hostName} (Host)</p>
              </div>
              {viewingParticipants.participants?.map((p: any) => (
                <div key={p._id || p} className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">P</div>
                  <p className="text-sm font-medium">
                    {p.firstName} {p.lastName} {p._id === user.id && "(You)"}
                  </p>
                </div>
              ))}
            </div>
            <button onClick={() => setViewingParticipants(null)} className="w-full py-3 rounded-full bg-gray-900 text-white font-bold text-sm">Close</button>
          </div>
        </div>
      )}

      {/* HOST MODAL */}
      {isHostSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a12]/55 px-4 backdrop-blur-sm" onClick={() => setIsHostSessionOpen(false)}>
          <div className="w-full max-w-lg rounded-[2.5rem] border border-[#e6dfd0] bg-[#fffdf8] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-3xl font-semibold text-[#201c15] mb-6">Host a Session</h2>
            <form className="space-y-4" onSubmit={handleCreateSession}>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required value={courseSubject} onChange={(e) => setCourseSubject(e.target.value.toUpperCase().slice(0,3))} placeholder="Subject (COP)" className="rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#5A5A40]" />
                <input type="text" required value={courseNumber} onChange={(e) => setCourseNumber(e.target.value.replace(/\D/g, "").slice(0,4))} placeholder="Number (4331)" className="rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#5A5A40]" />
              </div>
              <input type="text" required value={professorLastName} onChange={(e) => setProfessorLastName(e.target.value)} placeholder="Professor Last Name" className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#5A5A40]" />
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#5A5A40]" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" required value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="rounded-xl border p-3 text-sm outline-none" />
                <input type="time" required value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} className="rounded-xl border p-3 text-sm outline-none" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#5A5A40] py-3 text-white font-bold hover:bg-[#4a4a34] transition-colors">{isSubmitting ? "Creating..." : "Host Session"}</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
