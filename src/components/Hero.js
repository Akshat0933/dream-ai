"use client";

import { useEffect, useState } from "react";
import styles from "./Hero.module.css";

export default function Hero({ onStart }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className={`${styles.hero} ${show ? styles.visible : ""}`}>
      <div className={styles.container}>
        {/* Left Column: Core pitch */}
        <div className={styles.leftCol}>
          <span className={styles.tag}>
            <span className={styles.dot} />
            Next-Gen Real Estate Discovery
          </span>

          <h1 className={styles.heading}>
            Discover Your <br className={styles.desktopBr} />
            <span className="gradient-text">Dream Home</span> <br />
            Personality
          </h1>

          <p className={styles.sub}>
            Take our 60-second lifestyle quiz. Our advanced AI engine maps your
            aesthetic tastes, generates **5 custom high-resolution room designs**,
            and matches you instantly with real properties on Snaphomz.
          </p>

          <div className={styles.actions}>
            <button id="start-quiz-btn" className="btn" onClick={onStart}>
              Start the Quiz
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
              </svg>
            </button>
            <p className={styles.note}>Free / 5 Rooms Designed / 60 Seconds</p>
          </div>

          <div className={styles.proof}>
            <div className={styles.proofItem}>
              <span className={styles.proofNum}>12K+</span>
              <span className={styles.proofLabel}>AI Quizzes Run</span>
            </div>
            <span className={styles.divider} />
            <div className={styles.proofItem}>
              <span className={styles.proofNum}>100%</span>
              <span className={styles.proofLabel}>Free Instant Demo</span>
            </div>
            <span className={styles.divider} />
            <div className={styles.proofItem}>
              <span className={styles.proofNum}>5</span>
              <span className={styles.proofLabel}>Room Renderings</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive visuals */}
        <div className={styles.rightCol}>
          <div className={styles.visualStack}>
            {/* Card 1: Modernist */}
            <div className={`${styles.visualCard} ${styles.card1}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardDot} style={{ backgroundColor: "#6C5CE7" }} />
                <h4>The Urban Modernist</h4>
              </div>
              <p>Glass penthouses, smart-home automation, and monochromatic clean geometries.</p>
              <div className={styles.cardMeta}>
                <span>Modern Loft</span>
                <span>Active Listings</span>
              </div>
            </div>

            {/* Card 2: Nature */}
            <div className={`${styles.visualCard} ${styles.card2}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardDot} style={{ backgroundColor: "#00B894" }} />
                <h4>The Nature Dweller</h4>
              </div>
              <p>Biophilic spaces, living plant walls, skylights, and organic stone materials.</p>
              <div className={styles.cardMeta}>
                <span>Eco Villa</span>
                <span>Active Listings</span>
              </div>
            </div>

            {/* Card 3: Luxe */}
            <div className={`${styles.visualCard} ${styles.card3}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardDot} style={{ backgroundColor: "#FDCB6E" }} />
                <h4>The Luxury Visionary</h4>
              </div>
              <p>Calacatta marble finishes, brushed gold fixtures, and design statements.</p>
              <div className={styles.cardMeta}>
                <span>Marble Mansion</span>
                <span>Active Listings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
