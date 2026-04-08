import React, { useEffect, useState } from "react";
import { createSession, getDashboardData } from "../services/authService";
import type { AuthUser, DashboardData } from "../types/auth";

interface DashboardPageProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");

  const loadDashboard = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError("");

    try {
      const data = await getDashboardData(user.id);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeDashboard = async () => {
      setIsLoading(true);

      try {
        const data = await getDashboardData(user.id);
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Could not load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage("");
    setFormError("");

    try {
      await createSession({
        subject,
        location,
        time,
        hostName: `${user.firstName} ${user.lastName}`,
        userId: user.id,
      });

      setSubject("");
      setLocation("");
      setTime("");
      setFormMessage("Session created successfully.");
      await loadDashboard(false);
    } catch (err: any) {
      setFormError(err.message || "Could not create session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    {
      label: "Sessions Joined",
      value: String(dashboardData?.stats.sessionsJoined ?? 0),
    },
    {
      label: "Sessions Hosted",
      value: String(dashboardData?.stats.sessionsHosted ?? 0),
    },
    {
      label: "Study Streak",
      value: `${dashboardData?.stats.studyStreak ?? 0} days`,
    },
  ];

  const sessions = dashboardData?.sessions ?? [];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#d9d5c7] bg-[linear-gradient(135deg,#f6f1e7_0%,#ece6d7_45%,#e4dbc6_100%)] shadow-[0_20px_60px_rgba(62,52,32,0.12)]">
          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6d654f]">
                Study Buddy Dashboard
              </p>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-[#201c15] sm:text-5xl">
                Welcome back, {user.firstName}.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#4c4638] sm:text-lg">
                Track the sessions you host, keep an eye on your study rhythm,
                and pick up right where you left off.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full bg-[#3d5a40] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#314934]"
                >
                  Join a Session
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[#8a826b] bg-white/70 px-5 py-3 text-sm font-semibold text-[#2e2a22] transition hover:bg-white"
                >
                  Host a Session
                </button>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-white/60 bg-white/70 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7a735c]">
                Profile
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5a5a40] font-serif text-2xl font-semibold text-white">
                  {user.firstName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#201c15]">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-[#5f584a]">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="mt-6 w-full rounded-full border border-[#8a826b] px-4 py-3 text-sm font-semibold text-[#2f2a21] transition hover:bg-[#f7f2e8]"
              >
                Log out
              </button>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-[0_16px_40px_rgba(43,34,19,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7d765f]">
                  Progress
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-[#201c15]">
                  Your snapshot
                </h2>
              </div>
              <div className="rounded-full bg-[#f5efe2] px-3 py-1 text-xs font-semibold text-[#5a513f]">
                This week
              </div>
            </div>

              <div className="mt-6 space-y-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#efe8da] bg-[#fcfaf4] p-4"
                >
                  <p className="text-sm text-[#6d654f]">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[#201c15]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#efe8da] bg-[#fcfaf4] p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7d765f]">
                  Host
                </p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-[#201c15]">
                  Create a study session
                </h3>
              </div>

              <form className="mt-5 space-y-4" onSubmit={handleCreateSession}>
                <div>
                  <label
                    htmlFor="session-subject"
                    className="block text-sm font-medium text-[#3d372d]"
                  >
                    Subject
                  </label>
                  <input
                    id="session-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-[#ddd4c3] bg-white px-3 py-2 text-sm text-[#201c15] focus:border-[#5A5A40] focus:outline-none"
                    placeholder="Calculus I"
                  />
                </div>

                <div>
                  <label
                    htmlFor="session-location"
                    className="block text-sm font-medium text-[#3d372d]"
                  >
                    Location
                  </label>
                  <input
                    id="session-location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-[#ddd4c3] bg-white px-3 py-2 text-sm text-[#201c15] focus:border-[#5A5A40] focus:outline-none"
                    placeholder="Library Room 204"
                  />
                </div>

                <div>
                  <label
                    htmlFor="session-time"
                    className="block text-sm font-medium text-[#3d372d]"
                  >
                    Time
                  </label>
                  <input
                    id="session-time"
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-[#ddd4c3] bg-white px-3 py-2 text-sm text-[#201c15] focus:border-[#5A5A40] focus:outline-none"
                    placeholder="Thursday, 6:00 PM"
                  />
                </div>

                {formMessage ? (
                  <div className="rounded-xl border border-[#d7e7d5] bg-[#eff8ee] px-3 py-2 text-sm text-[#315436]">
                    {formMessage}
                  </div>
                ) : null}

                {formError ? (
                  <div className="rounded-xl border border-[#ebd2cc] bg-[#fff5f2] px-3 py-2 text-sm text-[#8a3d2f]">
                    {formError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#5A5A40] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4a4a34] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating session..." : "Host this session"}
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-[0_16px_40px_rgba(43,34,19,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7d765f]">
                  Upcoming
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-[#201c15]">
                  Your next sessions
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-[#d6cfbf] px-4 py-2 text-sm font-semibold text-[#3c372d] transition hover:bg-[#faf6ee]"
              >
                View all
              </button>
            </div>

            {isLoading ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#d8cfbc] bg-[#fcfaf4] p-6 text-sm text-[#5f584a]">
                Loading your dashboard...
              </div>
            ) : error ? (
              <div className="mt-6 rounded-[1.5rem] border border-[#ebd2cc] bg-[#fff5f2] p-6 text-sm text-[#8a3d2f]">
                {error}
              </div>
            ) : sessions.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#d8cfbc] bg-[#fcfaf4] p-6">
                <h3 className="text-xl font-semibold text-[#201c15]">
                  No sessions yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5f584a]">
                  New accounts start with a clean dashboard. Once you host a study
                  session, it will show up here automatically.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {sessions.map((session) => (
                  <article
                    key={session._id}
                    className="rounded-[1.5rem] border border-[#efe8da] bg-[linear-gradient(180deg,#fffdf8_0%,#f8f2e7_100%)] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-[#201c15]">
                          {session.subject}
                        </h3>
                        <p className="mt-2 text-sm text-[#5e584b]">
                          {session.time}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#5a5a40]">
                        Hosted by {session.hostName}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-[#4c4638]">
                      Meet at {session.location}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
