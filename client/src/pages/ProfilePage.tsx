import { useEffect, useState } from "react";
import type { AuthUser, CourseEntry } from "../types/auth";

interface EditableCourseEntry extends CourseEntry {
  id: string;
}

interface ProfilePageProps {
  user: AuthUser;
  onBack: () => void;
  onLogout: () => void;
  onSaveProfile: (user: AuthUser) => void;
}

export default function ProfilePage({
  user,
  onBack,
  onLogout,
  onSaveProfile,
}: ProfilePageProps) {
  const createEmptyCourse = (): EditableCourseEntry => ({
    id: crypto.randomUUID(),
    subject: "",
    number: "",
  });

  const normalizeCourses = (
    courses: CourseEntry[] | undefined,
  ): EditableCourseEntry[] =>
    courses && courses.length > 0
      ? courses.map((course) => ({
          id: crypto.randomUUID(),
          subject: course.subject ?? "",
          number: course.number ?? "",
        }))
      : [createEmptyCourse()];

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [major, setMajor] = useState(user.major ?? "");
  const [courses, setCourses] = useState<EditableCourseEntry[]>(normalizeCourses(user.courses));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setMajor(user.major ?? "");
    setCourses(normalizeCourses(user.courses));
  }, [user]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedMajor = major.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail) {
      setError("First name, last name, and email are required.");
      return;
    }

    const normalizedCourses = courses
      .map((course) => ({
        subject: course.subject.trim().toUpperCase(),
        number: course.number.trim(),
      }))
      .filter((course) => course.subject || course.number);

    const hasInvalidCourse = normalizedCourses.some(
      (course) =>
        !/^[A-Z]{3}$/.test(course.subject) || !/^\d{4}$/.test(course.number),
    );

    if (hasInvalidCourse) {
      setError("Each course must use a 3-letter subject and a 4-digit number.");
      return;
    }

    onSaveProfile({
      ...user,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      major: trimmedMajor,
      courses: normalizedCourses,
    });

    setMessage("Profile updated successfully.");
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#d9d5c7] bg-[linear-gradient(135deg,#f6f1e7_0%,#ece6d7_45%,#e4dbc6_100%)] shadow-[0_20px_60px_rgba(62,52,32,0.12)]">
          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6d654f]">
                Profile
              </p>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-[#201c15] sm:text-5xl">
                {user.firstName} {user.lastName}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#4c4638] sm:text-lg">
                Keep your account details in one place and head back to the dashboard whenever you're ready.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-full bg-[#3d5a40] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#314934]"
                >
                  Back to Dashboard
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full border border-[#8a826b] bg-white/70 px-5 py-3 text-sm font-semibold text-[#2e2a22] transition hover:bg-white"
                >
                  Log out
                </button>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-white/60 bg-white/70 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7a735c]">
                Initials
              </p>
              <div className="mt-5 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#5a5a40] font-serif text-4xl font-semibold text-white">
                {firstName.charAt(0) || user.firstName.charAt(0)}
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5f584a]">
                Your Study Buddy profile is tied to the account you used to sign in.
              </p>
            </aside>
          </div>
        </section>

        <section>
          <div className="rounded-[1.75rem] border border-[#e6dfd0] bg-white p-6 shadow-[0_16px_40px_rgba(43,34,19,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7d765f]">
              Personal Details
            </p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#efe8da] bg-[#fcfaf4] p-5">
                  <label
                    htmlFor="profile-first-name"
                    className="text-sm font-medium text-[#6d654f]"
                  >
                    First name
                  </label>
                  <input
                    id="profile-first-name"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="mt-3 block w-full rounded-xl border border-[#ddd4c3] bg-white px-3 py-2 text-sm text-[#201c15] focus:border-[#5A5A40] focus:outline-none"
                  />
                </div>
                <div className="rounded-2xl border border-[#efe8da] bg-[#fcfaf4] p-5">
                  <label
                    htmlFor="profile-last-name"
                    className="text-sm font-medium text-[#6d654f]"
                  >
                    Last name
                  </label>
                  <input
                    id="profile-last-name"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="mt-3 block w-full rounded-xl border border-[#ddd4c3] bg-white px-3 py-2 text-sm text-[#201c15] focus:border-[#5A5A40] focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#efe8da] bg-[#fcfaf4] p-5">
                <label
                  htmlFor="profile-email"
                  className="text-sm font-medium text-[#6d654f]"
                >
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-3 block w-full rounded-xl border border-[#ddd4c3] bg-white px-3 py-2 text-sm text-[#201c15] focus:border-[#5A5A40] focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-[#efe8da] bg-[#fcfaf4] p-5">
                <label
                  htmlFor="profile-major"
                  className="text-sm font-medium text-[#6d654f]"
                >
                  Major
                </label>
                <input
                  id="profile-major"
                  type="text"
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                  placeholder="Computer Science"
                  className="mt-3 block w-full rounded-xl border border-[#ddd4c3] bg-white px-3 py-2 text-sm text-[#201c15] focus:border-[#5A5A40] focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-[#efe8da] bg-[#fcfaf4] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="text-sm font-medium text-[#6d654f]">
                    Courses
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCourses((currentCourses) => [
                        ...currentCourses,
                        createEmptyCourse(),
                      ])
                    }
                    className="rounded-full border border-[#d6cfbf] px-4 py-2 text-sm font-semibold text-[#3c372d] transition hover:bg-[#faf6ee]"
                  >
                    Add course
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {courses.map((course, index) => (
                    <div
                      key={course.id}
                      className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr_auto]"
                    >
                      <input
                        type="text"
                        value={course.subject}
                        onChange={(event) =>
                          setCourses((currentCourses) =>
                            currentCourses.map((currentCourse, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...currentCourse,
                                    subject: event.target.value
                                      .toUpperCase()
                                      .replace(/[^A-Z]/g, "")
                                      .slice(0, 3),
                                  }
                                : currentCourse,
                            ),
                          )
                        }
                        placeholder="COP"
                        className="block w-full rounded-xl border border-[#ddd4c3] bg-white px-3 py-2 text-sm uppercase text-[#201c15] focus:border-[#5A5A40] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={course.number}
                        onChange={(event) =>
                          setCourses((currentCourses) =>
                            currentCourses.map((currentCourse, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...currentCourse,
                                    number: event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 4),
                                  }
                                : currentCourse,
                            ),
                          )
                        }
                        placeholder="4331"
                        className="block w-full rounded-xl border border-[#ddd4c3] bg-white px-3 py-2 text-sm text-[#201c15] focus:border-[#5A5A40] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCourses((currentCourses) =>
                            currentCourses.length === 1
                              ? [createEmptyCourse()]
                              : currentCourses.filter(
                                  (_, currentIndex) => currentIndex !== index,
                                ),
                          )
                        }
                        className="rounded-full border border-[#d6cfbf] px-4 py-2 text-sm font-semibold text-[#3c372d] transition hover:bg-[#faf6ee]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#7d765f]">
                  Use a 3-letter subject and a 4-digit course number.
                </p>
              </div>

              {error ? (
                <div className="rounded-xl border border-[#ebd2cc] bg-[#fff5f2] px-3 py-2 text-sm text-[#8a3d2f]">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-xl border border-[#d7e7d5] bg-[#eff8ee] px-3 py-2 text-sm text-[#315436]">
                  {message}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-[#5A5A40] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4a4a34]"
                >
                  Save profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                    setEmail(user.email);
                    setMajor(user.major ?? "");
                    setCourses(normalizeCourses(user.courses));
                    setError("");
                    setMessage("");
                  }}
                  className="rounded-full border border-[#d6cfbf] px-5 py-3 text-sm font-semibold text-[#3c372d] transition hover:bg-[#faf6ee]"
                >
                  Reset changes
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
