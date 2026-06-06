"use client";

import { useState, useEffect } from "react";
import styles from "./Quiz.module.css";

const QUESTIONS = [
  {
    id: "location",
    question: "Where does your dream home live?",
    subtitle: "Close your eyes. Where do you wake up?",
    options: [
      { id: "city-penthouse",     label: "City Penthouse",      desc: "Skyline views, rooftop access, urban energy" },
      { id: "mountain-cabin",     label: "Mountain Cabin",      desc: "Pine trees, fireplace, fresh crisp air" },
      { id: "beachfront-villa",   label: "Beachfront Villa",    desc: "Ocean breeze, infinity pool, sand at your doorstep" },
      { id: "countryside-estate", label: "Countryside Estate",  desc: "Rolling hills, organic garden, peace and quiet" },
      { id: "desert-oasis",       label: "Desert Oasis",        desc: "Dramatic skies, unique rock shapes, raw beauty" },
    ],
  },
  {
    id: "country",
    type: "text",
    question: "Specify your dream city and country",
    subtitle: "Our AI will custom-render your architecture to fit this specific global landscape.",
    placeholder: "e.g., Tokyo, Japan or Reykjavik, Iceland",
  },
  {
    id: "kitchen",
    question: "What is the heart of your dream kitchen?",
    subtitle: "A place for gathering, creating, and tasting.",
    options: [
      { id: "minimalist-chef",    label: "Stainless Steel Chef Zone",     desc: "Commercial-grade range, minimal clutter, ultra-precise" },
      { id: "rustic-hearth",      label: "Warm Farmhouse Hearth",         desc: "Reclaimed timber, brick oven, deep porcelain apron sink" },
      { id: "marble-waterfall",   label: "Imperial Marble Waterfall Island",desc: "Dramatic Calacatta marble slab, brushed gold details" },
      { id: "indoor-greenery",    label: "Biophilic Herb Oasis",          desc: "Built-in herb planters, hanging plants, massive skylights" },
      { id: "industrial-loft",    label: "Exposed Brick Loft Kitchen",    desc: "Polished concrete counters, matte black hardware, steel frames" },
    ],
  },
  {
    id: "materials",
    question: "Pick your core material palette",
    subtitle: "The tactile textures that will define your rooms.",
    options: [
      { id: "steel-glass",        label: "Polished Steel & Structured Glass",desc: "High transparency, architectural framing, structural lines" },
      { id: "timber-stone",       label: "Reclaimed Oak & Heavy Fieldstone", desc: "Solid timber beams, thermal mass, rugged hand-cut stones" },
      { id: "marble-velvet",      label: "Veined Marble & Jewel-toned Velvet",desc: "Opulent marble surfaces, velvet draperies, high-contrast gold" },
      { id: "cork-bamboo",        label: "Raw Earth, Cork, & Sustainable Bamboo",desc: "Tactile plaster, zero-VOC natural surfaces, biophilic feel" },
      { id: "brass-terrazzo",     label: "Polished Brass & Colorful Terrazzo",desc: "Speckled terrazzo floors, vintage brass fixtures, bold shapes" },
    ],
  },
  {
    id: "mustHave",
    question: "Your absolute non-negotiable feature?",
    subtitle: "The one thing your dream home must contain.",
    options: [
      { id: "smart-tech",        label: "Fully Automated Smart Core",   desc: "Integrated voice/app control, automated solar shades, smart glass" },
      { id: "vintage-charm",     label: "Vintage Crafted Library",      desc: "Stained wood bookcases, library ladder, crown moldings" },
      { id: "spa-resort",        label: "Heated Spa Bathroom Sanctuary",desc: "Danish sauna, standalone soaking tub, walk-in double rain shower" },
      { id: "garden-greenhouse", label: "Attached Botanical Greenhouse",desc: "Glass atrium, year-round tropical plants, indoor fruit trees" },
      { id: "art-studio",        label: "Creative Multi-media Workshop",desc: "Spacious studio, tall easel, ceramic wheel, industrial wash sink" },
    ],
  },
  {
    id: "activity",
    question: "How do you spend your ideal weekend?",
    subtitle: "A perfect Saturday, completely free.",
    options: [
      { id: "meditation",       label: "Sunrise Yoga & Tea Ceremony",    desc: "Quiet stretches, organic tea, light streaming in" },
      { id: "hosting-parties",  label: "Hosting an Intimate Dinner",     desc: "Plating fine dishes, pouring wine, ambient music, friends" },
      { id: "reading-nook",     label: "Reading Near the Hearth",        desc: "Blanket, crackling wood fire, rain outside, deep armchair" },
      { id: "gaming-setup",     label: "Immersive Gaming / Cinema Marathon",desc: "4K projector screen, custom acoustic panels, massive lounge couch" },
      { id: "cooking-kitchen",  label: "Baking Artisanal Bread",        desc: "Slow fermentation, kneading dough, aroma filling the home" },
    ],
  },
  {
    id: "lighting",
    question: "Your favorite natural light mood?",
    subtitle: "Lighting sets the absolute emotional tone.",
    options: [
      { id: "sunrise",          label: "Golden Sunrise Glow",        desc: "Crisp, bright, awakening morning rays" },
      { id: "golden-hour",      label: "Honey-colored Golden Hour",  desc: "Warm, long shadows, amber sunset hues" },
      { id: "moody-evening",    label: "Moody Twilight Shadows",     desc: "Warm lamps, candlelight, intimate low-key settings" },
      { id: "starlit-night",    label: "Clear Starlit Night Sky",    desc: "Massive skylight displaying stars or city skyline lights" },
      { id: "rainy-afternoon",  label: "Overcast Rainy Afternoon",   desc: "Moody grey clouds, soft ambient light, rain drops on glass" },
    ],
  },
  {
    id: "spirit",
    question: "Which archetype guides your design?",
    subtitle: "The guiding philosophy behind your architectural choices.",
    options: [
      { id: "architect",      label: "The Architect",       desc: "Focused on structural precision, geometry, and modern lines" },
      { id: "botanist",       label: "The Botanist",        desc: "Focused on organic growth, green foliage, and natural ecology" },
      { id: "art-collector",  label: "The Art Collector",   desc: "Focused on galleries, bold statements, color and pattern contrast" },
      { id: "chef",           label: "The Chef",            desc: "Focused on warmth, gathering spaces, the hearth and kitchen" },
      { id: "astronaut",      label: "The Astronaut",       desc: "Focused on futuristic layouts, metallic sheens, and exploration" },
    ],
  },
];

export default function Quiz({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [transitioning, setTransitioning] = useState(false);
  const [picked, setPicked] = useState(null);
  const [textValue, setTextValue] = useState("");

  const q = QUESTIONS[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;

  // Sync text value state when changing questions
  useEffect(() => {
    if (q && q.type === "text") {
      setTextValue(answers[q.id] || "");
    }
  }, [current, q, answers]);

  function pick(optionId) {
    if (transitioning) return;
    setPicked(optionId);

    setTimeout(() => {
      const updated = { ...answers, [q.id]: optionId };
      setAnswers(updated);

      if (current < QUESTIONS.length - 1) {
        setTransitioning(true);
        setTimeout(() => {
          setCurrent(current + 1);
          setPicked(null);
          setTransitioning(false);
        }, 350);
      } else {
        onComplete(updated);
      }
    }, 250);
  }

  function handleTextSubmit(e) {
    if (e) e.preventDefault();
    if (transitioning || !textValue.trim()) return;

    const updated = { ...answers, [q.id]: textValue.trim() };
    setAnswers(updated);

    if (current < QUESTIONS.length - 1) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(current + 1);
        setPicked(null);
        setTransitioning(false);
      }, 350);
    } else {
      onComplete(updated);
    }
  }

  function goBack() {
    if (current === 0 || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(current - 1);
      setPicked(answers[QUESTIONS[current - 1].id] || null);
      setTransitioning(false);
    }, 350);
  }

  return (
    <section className={styles.quiz}>
      {/* Progress fill bar */}
      <div className={styles.bar}>
        <div className={styles.barFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={`${styles.body} ${transitioning ? styles.leaving : styles.entering}`}>
        {/* Left Column: Question metadata and title */}
        <div className={styles.qText}>
          <div className={styles.meta}>
            {current > 0 && (
              <button id="quiz-back" className={styles.back} onClick={goBack}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            )}
            <span className={styles.counter}>Question {current + 1} of {QUESTIONS.length}</span>
          </div>
          <h2 className={styles.qTitle}>{q.question}</h2>
          <p className={styles.qSub}>{q.subtitle}</p>
        </div>

        {/* Right Column: Custom Text Input OR Option Cards */}
        {q.type === "text" ? (
          <form className={styles.textForm} onSubmit={handleTextSubmit}>
            <input
              type="text"
              className={styles.textInput}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={q.placeholder}
              required
              autoFocus
            />
            <button 
              type="submit" 
              className="btn" 
              disabled={!textValue.trim()} 
              style={{ marginTop: "16px", width: "100%" }}
            >
              Continue
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>
        ) : (
          <div className={styles.options}>
            {q.options.map((opt, i) => (
              <button
                key={opt.id}
                id={`opt-${opt.id}`}
                className={`${styles.option} ${picked === opt.id ? styles.chosen : ""}`}
                onClick={() => pick(opt.id)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className={styles.optDot} />
                <div className={styles.optText}>
                  <span className={styles.optLabel}>{opt.label}</span>
                  <span className={styles.optDesc}>{opt.desc}</span>
                </div>
                <span className={styles.optCheck}>
                  {picked === opt.id && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
