export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongodb";
import { parseSessionToken } from "@/lib/auth";
import QuizResult from "@/models/QuizResult";
import Link from "next/link";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    redirect("/");
  }

  const payload = parseSessionToken(sessionCookie);
  if (!payload || !payload.userId) {
    redirect("/");
  }

  await dbConnect();

  const results = await QuizResult.find({ userId: payload.userId })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Dream Homes</h1>
          <p className={styles.subtitle}>
            Manage and share all the custom properties designed by our AI for you.
          </p>
        </div>

        {results.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3>No Dream Homes Saved Yet</h3>
            <p>Take the 60-second lifestyle quiz to design your first custom property!</p>
            <Link href="/" className="btn" style={{ textDecoration: "none", marginTop: "16px" }}>
              Start the Quiz
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {results.map((r) => {
              const previewImg = r.images?.bedroom || r.images?.livingroom || r.images?.exterior || "";
              const formattedDate = new Date(r.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={r._id.toString()} className={styles.card}>
                  <div className={styles.cardImageContainer}>
                    {previewImg ? (
                      <img src={previewImg} alt={r.personality?.name} className={styles.cardImage} />
                    ) : (
                      <div className={styles.imagePlaceholder}>Generating...</div>
                    )}
                    <span className={styles.badge} style={{ backgroundColor: r.personality?.color || "var(--primary)" }}>
                      {r.personality?.name}
                    </span>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{r.personality?.name}</h3>
                    <p className={styles.cardTagline}>{r.personality?.tagline}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.date}>{formattedDate}</span>
                      <div className={styles.actions}>
                        <Link href={`/results/${r._id.toString()}`} className={styles.viewBtn}>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
