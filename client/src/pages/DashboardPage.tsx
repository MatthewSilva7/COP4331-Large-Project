import React from "react";

interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface DashboardPageProps {
  user: DashboardUser;
  onLogout: () => void;
}

const upcomingSessions = [
  {
    title: "Calculus Review",
    time: "Today, 4:30 PM",
    location: "Library Room B",
    members: 5,
  },
  {
    title: "Intro to Physics",
    time: "Tomorrow, 1:00 PM",
    location: "Engineering Hall",
    members: 3,
  },
  {
    title: "Database Systems",
    time: "Friday, 11:00 AM",
    location: "Online",
    members: 8,
  },
];

const quickStats = [
  { label: "Sessions Joined", value: "12" },
  { label: "Sessions Hosted", value: "4" },
  { label: "Study Streak", value: "6 days" },
];

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
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
                Your dashboard is ready with upcoming study sessions, progress
                snapshots, and a quick view of what to tackle next.
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
              {quickStats.map((stat) => (
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

            <div className="mt-6 grid gap-4">
              {upcomingSessions.map((session) => (
                <article
                  key={`${session.title}-${session.time}`}
                  className="rounded-[1.5rem] border border-[#efe8da] bg-[linear-gradient(180deg,#fffdf8_0%,#f8f2e7_100%)] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-[#201c15]">
                        {session.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#5e584b]">
                        {session.time}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#5a5a40]">
                      {session.members} members
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-[#4c4638]">
                    Meet at {session.location}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
