"use client";

import { useState, useEffect } from "react";
import styles from "./Loading.module.css";

const STEPS = [
  "Analyzing your lifestyle preferences",
  "Mapping your aesthetic DNA",
  "Generating dream rooms with AI",
  "Finding matching Snaphomz listings",
  "Building your personality card",
];

export default function Loading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.wrap}>
      <div className={styles.content}>
        {/* spinner orb */}
        <div className={styles.orb}>
          <div className={styles.orbCore} />
          <div className={styles.ring1} />
          <div className={styles.ring2} />
        </div>

        <h2 className={styles.title}>Creating Your Dream Home</h2>

        <div className={styles.steps}>
          {STEPS.map((text, i) => (
            <div
              key={i}
              className={`${styles.step} ${
                i < step ? styles.done : i === step ? styles.active : styles.waiting
              }`}
            >
              <span className={styles.stepIcon}>
                {i < step ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : i === step ? (
                  <span className={styles.spinner} />
                ) : (
                  <span className={styles.stepDot} />
                )}
              </span>
              <span className={styles.stepLabel}>{text}</span>
            </div>
          ))}
        </div>

        <p className={styles.hint}>This may take a moment while our AI designs rooms for you...</p>
      </div>
    </section>
  );
}
