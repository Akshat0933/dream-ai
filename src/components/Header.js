"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setUser(data.user);
      setShowModal(false);
      setEmail("");
      setPassword("");
      
      // Dispatch custom event so other components (like dashboard/results) know user status updated
      window.dispatchEvent(new Event("auth-changed"));
      
      if (window.location.pathname === "/") {
        // Just reload states quietly or redirect
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.dispatchEvent(new Event("auth-changed"));
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>SNAP</span>
            <span className={styles.logoAccent}>HOMZ</span>
            <span className={styles.logoBadge}>AI</span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>
              Dream Quiz
            </Link>
            {user && (
              <Link href="/dashboard" className={styles.navLink}>
                My Dream Homes
              </Link>
            )}
          </nav>

          <div className={styles.actions}>
            {user ? (
              <div className={styles.userSection}>
                <span className={styles.userEmail}>{user.email}</span>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Log Out
                </button>
              </div>
            ) : (
              <button onClick={() => { setAuthMode("login"); setShowModal(true); }} className={styles.loginBtn}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className={styles.modalTitle}>
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className={styles.modalSubtitle}>
              {authMode === "login" 
                ? "Sign in to save and share your custom dream home results." 
                : "Register to keep a collection of your AI-designed properties."}
            </p>

            <form onSubmit={handleAuth} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input} 
                  placeholder="name@example.com" 
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input} 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? "Processing..." : authMode === "login" ? "Sign In" : "Register"}
              </button>
            </form>

            <div className={styles.toggleMode}>
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => { setAuthMode("register"); setError(""); }} className={styles.toggleBtn}>
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => { setAuthMode("login"); setError(""); }} className={styles.toggleBtn}>
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
