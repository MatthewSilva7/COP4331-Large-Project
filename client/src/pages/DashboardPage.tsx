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
  onLogout: () => void; // Added logout prop
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

  useEffect(() => {
    if (!isHostSessionOpen && !isJoinSessionOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHostSessionOpen(false);
        setIsJoinSessionOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isHostSessionOpen, isJoinSessionOpen]);

  const formatSessionDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(dateTime);
  };

  const getCourseKey = (subject: string, number: string) =>
    `${subject.trim().toUpperCase()} ${number.trim()}`;

  const getSessionCourseKey = (sessionSubject: string) => {
    const match = sessionSubject.match(/\b([A-Za-z]{3})\s+(\d{4})\b/);
    return match ? getCourseKey(match[1], match[2]) : "";
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage("");
    setFormError("");

    const trimmedCourseSubject = courseSubject.trim().toUpperCase();
    const trimmedCourseNumber = courseNumber.trim();
    const trimmedProfessorLastName = professorLastName.trim();
    const trimmedLocation = location.trim();

    if (!trimmedCourseSubject || !trimmedCourseNumber || !trimmedProfessorLastName || !trimmedLocation || !sessionDate || !sessionTime) {
      setFormError("Please complete every field before hosting a session.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formattedSubject = `${trimmedCourseSubject} ${trimmedCourseNumber} - Prof. ${trimmedProfessorLastName}`;
      await createSession({
        subject: formattedSubject,
        location: trimmedLocation,
        time: formatSessionDateTime(sessionDate, sessionTime),
        hostName: `${user.firstName} ${user.lastName}`,
        userId: user.id,
      });

      setCourseSubject("");
      setCourseNumber("");
      setProfessorLastName("");
      setLocation("");
      setSessionDate("");
      setSessionTime("");
      setFormMessage("Session created successfully.");
      setIsHostSessionOpen(false);
      await loadDashboard(false);
    } catch (err: any) {
      setFormError(err.message || "Could not create session.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const sessions = dashboardData?.sessions ?? [];
  const nextSession = sessions[0] ?? null;
  const profileCourseKeys = new Set((user.courses ?? []).map((course) => getCourseKey(course.subject, course.number)));
  const matchedProfileSessions = sessions.filter((session) => profileCourseKeys.has(getSessionCourseKey(session.subject)));
  const filteredSessions = sessions.filter((session) => {
    const searchTokens = sessionSearch.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const sessionCourseKey = getSessionCourseKey(session.subject);
    const matchesProfile = !showProfileMatchesOnly || profileCourseKeys.has(sessionCourseKey);
    if (!matchesProfile) return false;
    if (searchTokens.length === 0) return true;
    const haystack = [session.subject, session.location, session.hostName, session.time, sessionCourseKey].join(" ").toLowerCase();
    return searchTokens.every((token) => haystack.includes(token));
  });

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#d9d5c7] bg-[linear-gradient(135deg,#f6f1e7_0%,#ece6d7_45%,#e4dbc6_100%)] shadow-[0_20px_60px_rgba(62,52,32,0.12)]">
          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6d654f]">Study Buddy Dashboard</p>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-[#201c15] sm:text-5xl">Welcome back, {user.firstName}.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#4c4638] sm:text-lg">Track the sessions you host and pick up right where you left off.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => { setJoinError(""); setJoinMessage(""); setIsJoinSessionOpen(true); }} className="rounded-full bg-[#3d5a40] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#314934]">Join a Session</button>
                <button type="button" onClick={() => { setFormMessage(""); setFormError(""); setIsHostSessionOpen(true); }} className="rounded-full border border-[#8a826b] bg-white/70 px-5 py-3 text-sm font-semibold text-[#2e2a22] transition hover:bg-white">Host a Session</button>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-white/60 bg-white/70 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7a735c]">Account</p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5a5a40] font-serif text-2xl font-semibold text-white">{user.firstName.charAt(0)}</div>
                <div>
                  <h2 className="text-xl font-semibold text-[#201c15]">{user.firstName} {user.lastName}</h2>
                  <p className="text-sm text-[#5f584a]">{user.email}</p>
                </div>
              </div>
              <button type="button" onClick={onOpenProfile} className="mt-6 w-full rounded-full border border-[#8a826b] px-4 py-3 text-sm font-semibold text-[#2f2a21] transition hover:bg-[#f7f2e8]">Open profile page</button>
              
              {/* Added Logout Button */}
              <button type="button" onClick={onLogout} className="mt-3 w-full rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100">Log Out</button>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.72fr_1.58fr]">
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-[0_16px_40px_rgba(43,34,19,0.08)]">
            <h2 className="font-serif text-3xl font-semibold text-[#201c15]">Next up</h2>
            {isLoading ? <p className="mt-6 text-sm text-[#5f584a]">Loading...</p> : nextSession ? (
              <div className="mt-6 rounded-[1.5rem] border border-[#efe8da] bg-[linear-gradient(180deg,#fffdf8_0%,#f8f2e7_100%)] p-5">
                <h3 className="text-2xl font-semibold text-[#201c15]">{nextSession.subject}</h3>
                <p className="mt-3 text-sm text-[#5e584b]">{nextSession.time}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d765f]">{nextSession.isJoined ? `Hosted by ${nextSession.hostName}` : "You're hosting this"}</p>
              </div>
            ) : <p className="mt-6 text-sm text-[#5f584a]">Nothing scheduled yet.</p>}
          </div>

          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-[0_16px_40px_rgba(43,34,19,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-3xl font-semibold text-[#201c15]">View all sessions</h2>
              <input type="search" value={sessionSearch} onChange={(e) => setSessionSearch(e.target.value)} placeholder="Search..." className="w-full max-w-xs rounded-full border border-[#d6cfbf] bg-[#fcfaf4] px-4 py-2.5 text-sm text-[#3c372d] outline-none transition focus:border-[#5a5a40]" />
            </div>
            <div className="mt-6 grid gap-4">
              {filteredSessions.map((session) => (
                <article key={session._id} className="rounded-[1.5rem] border border-[#efe8da] bg-[linear-gradient(180deg,#fffdf8_0%,#f8f2e7_100%)] p-5">
                  <h3 className="text-xl font-semibold text-[#201c15]">{session.subject}</h3>
                  <p className="mt-2 text-sm text-[#5e584b]">{session.time}</p>
                  <p className="mt-3 text-sm text-[#4c4638]">Meet at {session.location}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {isJoinSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a12]/55 px-4 py-8 backdrop-blur-sm" onClick={() => setIsJoinSessionOpen(false)}>
          <div className="w-full max-w-3xl rounded-[2rem] border border-[#e6dfd0] bg-[#fffdf8] p-6 shadow-[0_24px_80px_rgba(31,26,18,0.28)] sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h2 className="font-serif text-3xl font-semibold text-[#201c15]">Join a Session</h2>
              <button onClick={() => setIsJoinSessionOpen(false)} className="rounded-full border px-3 py-1 text-sm font-semibold">Close</button>
            </div>
            <div className="mt-6 grid gap-4 max-h-[60vh] overflow-y-auto">
              {availableSessions.map((session) => (
                <article key={session._id} className="rounded-[1.5rem] border border-[#efe8da] p-5 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">{session.subject}</h3>
                      <p className="text-sm text-[#5e584b]">{session.time}</p>
                      <p className="text-sm text-[#4c4638] mt-1">Hosted by {session.hostName}</p>
                    </div>
                    <button onClick={() => handleJoinSession(session._id)} className="rounded-full bg-[#3d5a40] px-4 py-2 text-sm text-white font-semibold">Join</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {isHostSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a12]/55 px-4 py-8 backdrop-blur-sm" onClick={() => setIsHostSessionOpen(false)}>
          <div className="w-full max-w-lg rounded-[2rem] border border-[#e6dfd0] bg-[#fffdf8] p-6 shadow-[0_24px_80px_rgba(31,26,18,0.28)] sm:p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-3xl font-semibold text-[#201c15]">Host a Session</h2>
            <form className="mt-6 space-y-4" onSubmit={handleCreateSession}>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required value={courseSubject} onChange={(e) => setCourseSubject(e.target.value.toUpperCase().slice(0,3))} placeholder="Subject (COP)" className="rounded-xl border p-2 text-sm" />
                <input type="text" required value={courseNumber} onChange={(e) => setCourseNumber(e.target.value.replace(/\D/g, "").slice(0,4))} placeholder="Number (4331)" className="rounded-xl border p-2 text-sm" />
              </div>
              <input type="text" required value={professorLastName} onChange={(e) => setProfessorLastName(e.target.value)} placeholder="Professor Last Name" className="w-full rounded-xl border p-2 text-sm" />
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full rounded-xl border p-2 text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" required value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="rounded-xl border p-2 text-sm" />
                <input type="time" required value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} className="rounded-xl border p-2 text-sm" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#5A5A40] py-3 text-white font-bold">{isSubmitting ? "Creating..." : "Create Session"}</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
