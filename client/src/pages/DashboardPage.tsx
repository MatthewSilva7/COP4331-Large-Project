import React, { useEffect, useState } from "react";
import {
  createSession,
  deleteSession,
  getAvailableSessions,
  getDashboardData,
  joinSession,
  leaveSession,
  searchSessions,
  updateSession,
} from "../services/authService";
import type { AuthUser, DashboardData, SessionSummary } from "../types/auth";

interface DashboardPageProps {
  user: AuthUser;
  onOpenProfile: () => void;
  onLogout: () => void;
}

// Helper to convert DB time string back to HTML input format
const parseSessionTime = (timeString: string) => {
  try {
    const [monthDay, timeStr] = timeString.split(", ");
    const currentYear = new Date().getFullYear(); 
    const d = new Date(`${monthDay}, ${currentYear}`);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return { dateVal: `${yyyy}-${mm}-${dd}`, timeVal: timeStr };
  } catch {
    return { dateVal: "", timeVal: "" };
  }
};

export default function DashboardPage({ user, onOpenProfile, onLogout }: DashboardPageProps) {
  const [hostedSessions, setHostedSessions] = useState<SessionSummary[]>([]);
  const [availableSessions, setAvailableSessions] = useState<SessionSummary[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<SessionSummary[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal States
  const [isHostSessionOpen, setIsHostSessionOpen] = useState(false);
  const [viewingParticipants, setViewingParticipants] = useState<SessionSummary | null>(null);
  const [editingSession, setEditingSession] = useState<SessionSummary | null>(null);
  const [isJoiningSessionId, setIsJoiningSessionId] = useState("");
  
  // Form State
  const [courseSubject, setCourseSubject] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [courseFullTitle, setCourseFullTitle] = useState(""); // NEW FIELD
  const [professorLastName, setProfessorLastName] = useState("");
  const [location, setLocation] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SessionSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const getTimeValue = (session: SessionSummary) => {
    const date = new Date(session.time.replace(' at ', ' '));
    return isNaN(date.getTime()) ? Date.now() : date.getTime();
  };

  const loadDashboard = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [data, available] = await Promise.all([
        getDashboardData(user.id),
        getAvailableSessions(user.id),
      ]);
      
      const allMySessions = data.sessions || [];
      setHostedSessions(allMySessions.filter(s => !s.isJoined));
      setJoinedSessions(allMySessions.filter(s => s.isJoined));

      const filteredAvailable = (available || [])
        .filter(s => s.userId !== user.id)
        .sort((a, b) => getTimeValue(a) - getTimeValue(b));
        
      setAvailableSessions(filteredAvailable);
    } catch (err: any) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, [user.id]);

  useEffect(() => {
    const trimmedSearch = sessionSearch.trim();
    if (!trimmedSearch) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchSessions(trimmedSearch, user.id);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [sessionSearch, user.id]);

  const mySchedule = [...hostedSessions, ...joinedSessions].sort((a, b) => 
    getTimeValue(a) - getTimeValue(b)
  );

  const handleJoinSession = async (session: SessionSummary) => {
    setIsJoiningSessionId(session._id);
    try {
      await joinSession({ sessionId: session._id, userId: user.id });
      const joinedWithMe = { 
        ...session, isJoined: true,
        participants: [...(session.participants || []), { firstName: user.firstName, lastName: user.lastName, _id: user.id }]
      };
      setAvailableSessions(prev => prev.filter(s => s._id !== session._id));
      setJoinedSessions(prev => [...prev, joinedWithMe]);
    } catch (err: any) {
      alert("Could not join.");
    } finally {
      setIsJoiningSessionId("");
    }
  };

  const handleLeaveSession = async (session: SessionSummary) => {
    try {
      await leaveSession({ sessionId: session._id, userId: user.id });
      setJoinedSessions(prev => prev.filter(s => s._id !== session._id));
      const updatedParticipants = session.participants?.filter((p: any) => p._id !== user.id) || [];
      const sessionToReturn = { ...session, isJoined: false, participants: updatedParticipants };
      setAvailableSessions(prev => {
        const newList = [...prev, sessionToReturn];
        return newList.sort((a, b) => getTimeValue(a) - getTimeValue(b));
      });
      if (viewingParticipants?._id === session._id) setViewingParticipants(null);
    } catch (err: any) {
      alert("Could not leave group.");
    }
  };

  const handleDeleteSession = async (session: SessionSummary) => {
    if (!window.confirm("Delete this study session?")) return;
    try {
      await deleteSession(session._id, user.id);
      setHostedSessions(prev => prev.filter(s => s._id !== session._id));
    } catch {
      alert("Could not delete session.");
    }
  };

  const openCreateModal = () => {
    setEditingSession(null);
    setCourseSubject(""); setCourseNumber(""); setCourseFullTitle(""); setProfessorLastName(""); 
    setLocation(""); setSessionDate(""); setSessionTime("");
    setFormError("");
    setIsHostSessionOpen(true);
  };

  const openEditModal = (session: SessionSummary) => {
    setEditingSession(session);
    setFormError("");
    
    const match = session.subject.match(/^([a-zA-Z]+)\s+(\d+)\s+-\s+Prof\.\s+(.*)$/i);
    if (match) {
      setCourseSubject(match[1]);
      setCourseNumber(match[2]);
      setProfessorLastName(match[3]);
    }
    
    setCourseFullTitle(session.courseName || "");
    setLocation(session.location || "");
    const { dateVal, timeVal } = parseSessionTime(session.time);
    setSessionDate(dateVal);
    setSessionTime(timeVal);
    setIsHostSessionOpen(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const formattedSubject = `${courseSubject.toUpperCase()} ${courseNumber} - Prof. ${professorLastName}`;
      const displayTime = `${new Date(sessionDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${sessionTime}`;

      const payload = {
        subject: formattedSubject,
        courseName: courseFullTitle, // ADDED
        location,
        time: displayTime,
        userId: user.id
      };

      if (editingSession) {
        await updateSession(editingSession._id, payload);
      } else {
        await createSession({
          ...payload,
          hostName: `${user.firstName} ${user.lastName}`
        });
      }

      setIsHostSessionOpen(false);
      setEditingSession(null);
      await loadDashboard(false);
    } catch (err: any) {
      setFormError(err.message || "Could not save session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedAvailable = sessionSearch.trim() ? searchResults : availableSessions;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-[#f9f7f2]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        
        {/* Header Section */}
        <section className="overflow-hidden rounded-[2rem] border border-[#d9d5c7] bg-[linear-gradient(135deg,#f6f1e7_0%,#ece6d7_45%,#e4dbc6_100%)] shadow-lg p-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6d654f]">Study Buddy Dashboard</p>
              <h1 className="mt-3 font-serif text-5xl font-semibold text-[#201c15]">Welcome back, {user.firstName}.</h1>
              <button onClick={openCreateModal} className="mt-8 rounded-full bg-[#3d5a40] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#314934] transition-all transform active:scale-95">Host a Session</button>
            </div>
            <aside className="bg-white/70 p-6 rounded-3xl border border-white/60 backdrop-blur w-64 shadow-sm text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7a735c] mb-4">Account</p>
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#5a5a40] flex items-center justify-center text-white font-bold text-xl">{user.firstName[0]}</div>
                <h2 className="font-bold text-[#201c15]">{user.firstName} {user.lastName}</h2>
              </div>
              <button onClick={onOpenProfile} className="w-full rounded-full border border-[#8a826b] px-4 py-2.5 text-xs font-bold transition hover:bg-[#f7f2e8] mb-3">Open profile page</button>
              <button onClick={onLogout} className="w-full rounded-full bg-red-50 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors">Log Out</button>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.45fr]">
          
          {/* YOUR SCHEDULE */}
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-semibold text-[#201c15] mb-6">Your Schedule</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {mySchedule.map(s => (
                <div key={s._id} className="p-4 rounded-2xl bg-[#f8f2e7] border border-[#efe8da] group">
                  <div className="flex justify-between items-start">
                    <div onClick={() => setViewingParticipants(s)} className="cursor-pointer">
                      <h3 className="font-bold text-[#201c15] hover:underline">{s.subject}</h3>
                      {s.courseName && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{s.courseName}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {!s.isJoined && (
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(s); }} className="text-[#a49d8c] hover:text-[#5a5a40] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                      )}
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.isJoined ? "bg-blue-100 text-blue-700" : "bg-white/50 text-[#7d765f]"}`}>{s.isJoined ? "Joined" : "Host"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{s.time}</p>
                  <p className="text-[10px] text-[#7d765f] mt-1 italic font-medium">📍 {s.location}</p>
                  <button onClick={() => s.isJoined ? handleLeaveSession(s) : handleDeleteSession(s)} className={`mt-3 w-full py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-colors ${s.isJoined ? "border-red-200 text-red-500 hover:bg-red-50" : "border-red-300 text-red-600 hover:bg-red-50"}`}>{s.isJoined ? "Leave Group" : "Delete Session"}</button>
                </div>
              ))}
              {mySchedule.length === 0 && <p className="text-sm text-gray-400 italic">Nothing scheduled yet.</p>}
            </div>
          </div>

          {/* JOIN A SESSION */}
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="font-serif text-3xl font-semibold text-[#201c15]">Join a Session</h2>
              <input type="search" value={sessionSearch} onChange={(e) => setSessionSearch(e.target.value)} placeholder="Search subjects..." className="w-full max-w-xs rounded-full border border-[#d6cfbf] bg-[#fcfaf4] px-4 py-2.5 text-sm outline-none focus:border-[#5a5a40]" />
            </div>
            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
              {displayedAvailable.map((session) => (
                <article key={session._id} className="rounded-[1.5rem] border border-[#efe8da] p-5 bg-white flex justify-between items-center hover:shadow-md transition-shadow">
                  <div className="cursor-pointer" onClick={() => setViewingParticipants(session)}>
                    <h3 className="text-xl font-bold text-[#201c15] hover:text-[#3d5a40]">{session.subject}</h3>
                    {session.courseName && <p className="text-xs text-gray-400 font-bold uppercase mb-1">{session.courseName}</p>}
                    <p className="text-sm text-[#5e584b]">{session.time}</p>
                    <p className="text-sm text-[#4c4638] mt-1 font-medium">📍 {session.location}</p>
                    <p className="text-xs text-[#7d765f] mt-1 font-semibold uppercase tracking-wider">Hosted by {session.hostName}</p>
                  </div>
                  <button onClick={() => handleJoinSession(session)} disabled={isJoiningSessionId === session._id} className="rounded-full bg-[#3d5a40] px-6 py-2 text-sm text-white font-bold hover:bg-[#314934] disabled:opacity-50">Join</button>
                </article>
              ))}
              {isSearching && <p className="text-sm text-gray-400 italic">Searching...</p>}
            </div>
          </div>
        </section>
      </div>

      {/* HOST/EDIT MODAL */}
      {isHostSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a12]/55 px-4 backdrop-blur-sm" onClick={() => setIsHostSessionOpen(false)}>
          <div className="w-full max-w-lg rounded-[2.5rem] border border-[#e6dfd0] bg-[#fffdf8] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-3xl font-semibold text-[#201c15] mb-6">{editingSession ? "Edit Session" : "Host a Session"}</h2>
            <form className="space-y-4" onSubmit={handleSaveSession}>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required value={courseSubject} onChange={(e) => setCourseSubject(e.target.value.toUpperCase().slice(0,3))} placeholder="Subject (COP)" className="rounded-xl border p-3 text-sm outline-none" />
                <input type="text" required value={courseNumber} onChange={(e) => setCourseNumber(e.target.value.replace(/\D/g, "").slice(0,4))} placeholder="Number (4331)" className="rounded-xl border p-3 text-sm outline-none" />
              </div>
              
              {/* NEW OPTIONAL INPUT */}
              <input type="text" value={courseFullTitle} onChange={(e) => setCourseFullTitle(e.target.value)} placeholder="Full Course Name (e.g. Biology 1) - Optional" className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#5A5A40]" />
              
              <input type="text" required value={professorLastName} onChange={(e) => setProfessorLastName(e.target.value)} placeholder="Professor Last Name" className="w-full rounded-xl border p-3 text-sm outline-none" />
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full rounded-xl border p-3 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" required value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="rounded-xl border p-3 text-sm outline-none" />
                <input type="time" required value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} className="rounded-xl border p-3 text-sm outline-none" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#5A5A40] py-3 text-white font-bold hover:bg-[#4a4a34]">{isSubmitting ? "Saving..." : "Save Session"}</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}