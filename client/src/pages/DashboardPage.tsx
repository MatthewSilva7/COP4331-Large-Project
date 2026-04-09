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
  
  // Modal States
  const [isHostSessionOpen, setIsHostSessionOpen] = useState(false);
  const [viewingParticipants, setViewingParticipants] = useState<SessionSummary | null>(null);
  const [isJoiningSessionId, setIsJoiningSessionId] = useState("");
  
  const [sessionSearch, setSessionSearch] = useState("");

  const loadDashboard = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [data, available] = await Promise.all([
        getDashboardData(user.id),
        getAvailableSessions(user.id),
      ]);
      setHostedSessions(data.sessions || []);
      setAvailableSessions(available || []);
    } catch (err: any) {
      console.error("Load error:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, [user.id]);

  const allSessions = [
    ...hostedSessions.map(s => ({ ...s, canJoin: false })),
    ...availableSessions.map(s => ({ ...s, canJoin: true }))
  ];

  const handleJoinSession = async (session: SessionSummary) => {
    setIsJoiningSessionId(session._id);
    try {
      await joinSession({ sessionId: session._id, userId: user.id });
      setAvailableSessions(prev => prev.filter(s => s._id !== session._id));
      setJoinedSessions(prev => [...prev, { ...session, isJoined: true }]);
    } catch (err: any) {
      alert("Could not join.");
    } finally {
      setIsJoiningSessionId("");
    }
  };

  const filteredSessions = allSessions.filter((s) =>
    s.subject.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-[#f9f7f2]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header Section */}
        <section className="overflow-hidden rounded-[2rem] border border-[#d9d5c7] bg-[linear-gradient(135deg,#f6f1e7_0%,#ece6d7_45%,#e4dbc6_100%)] shadow-lg p-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-serif text-5xl font-semibold text-[#201c15]">Welcome, {user.firstName}.</h1>
              <button 
                onClick={() => setIsHostSessionOpen(true)} 
                className="mt-6 rounded-full bg-[#3d5a40] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#314934]"
              >
                Host a Session
              </button>
            </div>
            <aside className="bg-white/70 p-6 rounded-3xl border border-white/60 backdrop-blur w-64">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7a735c] mb-4">Account</p>
              <h2 className="font-bold text-[#201c15]">{user.firstName} {user.lastName}</h2>
              <button onClick={onLogout} className="mt-4 w-full rounded-full bg-red-50 py-2 text-sm font-bold text-red-600 hover:bg-red-100">Log Out</button>
            </aside>
          </div>
        </section>

        {/* Main Grid */}
        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-semibold text-[#201c15] mb-6">Your Schedule</h2>
            <div className="space-y-4">
              {[...hostedSessions, ...joinedSessions].map(s => (
                <div key={s._id} className="p-4 rounded-2xl bg-[#f8f2e7] border border-[#efe8da]">
                  <h3 className="font-bold cursor-pointer hover:underline" onClick={() => setViewingParticipants(s)}>{s.subject}</h3>
                  <p className="text-xs text-gray-500">{s.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-semibold text-[#201c15] mb-6">All Sessions</h2>
            <div className="grid gap-4">
              {filteredSessions.map((session) => (
                <article key={session._id} className="rounded-[1.5rem] border border-[#efe8da] p-5 bg-white flex justify-between items-center">
                  <div>
                    {/* CLICKING NAME OPENS MODAL */}
                    <h3 
                      className="text-xl font-bold text-[#201c15] cursor-pointer hover:text-[#3d5a40] transition-colors"
                      onClick={() => setViewingParticipants(session)}
                    >
                      {session.subject}
                    </h3>
                    <p className="text-sm text-[#5e584b]">{session.time}</p>
                    <p className="text-xs text-[#7d765f] mt-1 font-semibold">Hosted by {session.hostName}</p>
                  </div>
                  {session.canJoin && (
                    <button 
                      onClick={() => handleJoinSession(session)}
                      className="rounded-full bg-[#3d5a40] px-6 py-2 text-sm text-white font-bold"
                    >
                      Join
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* PARTICIPANT LIST MODAL */}
      {viewingParticipants && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewingParticipants(null)}>
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-2xl font-bold mb-2">{viewingParticipants.subject}</h2>
            <p className="text-sm text-gray-500 mb-6">Attendees</p>
            
            <div className="space-y-3 mb-8">
              {/* Host is always shown */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#5a5a40] flex items-center justify-center text-white text-xs font-bold">H</div>
                <p className="text-sm font-medium">{viewingParticipants.hostName} (Host)</p>
              </div>
              
              {/* List other participants if they exist */}
              {viewingParticipants.participants?.map((p: any) => (
                <div key={p._id || p} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">P</div>
                  <p className="text-sm">
                    {p.firstName ? `${p.firstName} ${p.lastName}` : "Joined Student"}
                  </p>
                </div>
              ))}

              {(!viewingParticipants.participants || viewingParticipants.participants.length === 0) && (
                <p className="text-xs text-gray-400 italic">No other students have joined yet.</p>
              )}
            </div>

            <button 
              onClick={() => setViewingParticipants(null)}
              className="w-full py-3 rounded-full bg-gray-100 font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
