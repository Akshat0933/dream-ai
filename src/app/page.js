"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Hero from "@/components/Hero";
import Quiz from "@/components/Quiz";
import Loading from "@/components/Loading";
import Results from "@/components/Results";

export default function Home() {
  const [stage, setStage] = useState("hero");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  function startQuiz() {
    setStage("quiz");
  }

  async function finishQuiz(quizAnswers) {
    setAnswers(quizAnswers);
    setStage("loading");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: quizAnswers }),
      });

      const data = await res.json();

      if (data.error) {
        setResult({
          id: "",
          personality: buildFallback(quizAnswers),
          images: {},
        });
      } else {
        setResult(data);
        if (data.id) {
          window.history.pushState(null, "", `/results/${data.id}`);
        }
      }
    } catch (err) {
      console.error("Request failed:", err);
      setResult({
        id: "",
        personality: buildFallback(quizAnswers),
        images: {},
      });
    }

    setStage("results");
  }

  function restart() {
    setStage("hero");
    setAnswers({});
    setResult(null);
    window.history.pushState(null, "", "/");
  }

  return (
    <main className={styles.main}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      {stage === "hero" && <Hero onStart={startQuiz} />}
      {stage === "quiz" && <Quiz onComplete={finishQuiz} />}
      {stage === "loading" && <Loading />}
      {stage === "results" && result && (
        <Results
          personality={result.personality}
          images={result.images}
          answers={answers}
          resultId={result.id}
          onRestart={restart}
        />
      )}
    </main>
  );
}

// -- fallback personality when API fails --

const VIBE_MAP = {
  "city-penthouse": "modern",
  "mountain-cabin": "cozy",
  "beachfront-villa": "luxe",
  "countryside-estate": "nature",
  "desert-oasis": "creative",
  "usa-california": "modern",
  "japan-kyoto": "nature",
  "uk-cotswolds": "cozy",
  "italy-amalfi": "luxe",
  "switzerland-alps": "cozy",
  "minimalist-modern": "modern",
  "warm-rustic": "cozy",
  "luxury-glam": "luxe",
  "organic-natural": "nature",
  "bold-eclectic": "creative",
  "smart-tech": "modern",
  "vintage-charm": "cozy",
  "spa-resort": "luxe",
  "garden-greenhouse": "nature",
  "art-studio": "creative",
  meditation: "nature",
  "hosting-parties": "luxe",
  "reading-nook": "cozy",
  "gaming-setup": "modern",
  "cooking-kitchen": "creative",
  sunrise: "nature",
  "golden-hour": "luxe",
  "moody-evening": "cozy",
  "starlit-night": "modern",
  "rainy-afternoon": "creative",
  architect: "modern",
  botanist: "nature",
  "art-collector": "creative",
  chef: "cozy",
  astronaut: "luxe",
};

const PERSONALITIES = {
  modern: {
    name: "The Urban Modernist",
    tagline: "Clean lines, bold choices, city energy.",
    description:
      "You gravitate toward sleek, minimal spaces with floor-to-ceiling glass and smart-home tech. Your ideal home is a modern loft or penthouse where every surface is intentional.",
    color: "#6C5CE7",
    traits: ["Minimalist", "Tech-Forward", "Urban"],
  },
  cozy: {
    name: "The Cozy Curator",
    tagline: "Warmth, texture, and a story in every corner.",
    description:
      "You crave comfort and character -- warm wood tones, layered textiles, vintage finds, and a fireplace that actually gets used. Craftsman cottage meets hygge paradise.",
    color: "#E17055",
    traits: ["Warm", "Layered", "Character-Rich"],
  },
  luxe: {
    name: "The Luxury Visionary",
    tagline: "Nothing but the finest.",
    description:
      "You appreciate marble counters, designer lighting, wine cellars, and infinity pools. Your dream home is an architectural statement blending opulence with timeless elegance.",
    color: "#FDCB6E",
    traits: ["Opulent", "Refined", "Statement"],
  },
  nature: {
    name: "The Nature Dweller",
    tagline: "Rooted in earth, open to sky.",
    description:
      "You want birdsong and morning mist. Your dream home dissolves the boundary between inside and out -- living walls, natural stone, skylights, and a garden you actually tend.",
    color: "#00B894",
    traits: ["Organic", "Sustainable", "Serene"],
  },
  creative: {
    name: "The Creative Maverick",
    tagline: "Rules are for other people's houses.",
    description:
      "You see your home as a canvas. Bold colors, unexpected art, mixed materials, and spaces that spark inspiration. Not a single beige surface in sight.",
    color: "#FD79A8",
    traits: ["Bold", "Artistic", "Eclectic"],
  },
};

function buildFallback(answers) {
  const votes = {};
  Object.values(answers).forEach((a) => {
    const key = VIBE_MAP[a] || "modern";
    votes[key] = (votes[key] || 0) + 1;
  });

  const winner =
    Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || "modern";

  return PERSONALITIES[winner];
}
