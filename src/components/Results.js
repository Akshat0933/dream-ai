"use client";

import { useState } from "react";
import styles from "./Results.module.css";

const LISTINGS = {
  modern: [
    { id: 1, title: "Modern Loft in Downtown LA",       price: "$1,250,000", beds: 2, baths: 2, sqft: "1,800", tag: "Smart Home" },
    { id: 2, title: "Sleek Penthouse with Skyline Views",price: "$2,100,000", beds: 3, baths: 3, sqft: "2,400", tag: "City Living" },
    { id: 3, title: "Contemporary Condo in Silver Lake", price: "$890,000",   beds: 2, baths: 1, sqft: "1,200", tag: "Walkable" },
  ],
  cozy: [
    { id: 4, title: "Charming Craftsman in Pasadena",    price: "$980,000",   beds: 3, baths: 2, sqft: "2,100", tag: "Character Home" },
    { id: 5, title: "Restored Victorian in Eagle Rock",  price: "$1,150,000", beds: 4, baths: 2, sqft: "2,600", tag: "Historic" },
    { id: 6, title: "Cozy Bungalow in Altadena",         price: "$750,000",   beds: 2, baths: 1, sqft: "1,400", tag: "Garden" },
  ],
  luxe: [
    { id: 7, title: "Luxury Estate in Beverly Hills",   price: "$8,500,000", beds: 6, baths: 8, sqft: "9,200", tag: "Estate" },
    { id: 8, title: "Malibu Oceanfront Villa",           price: "$5,200,000", beds: 4, baths: 5, sqft: "4,800", tag: "Ocean View" },
    { id: 9, title: "Bel Air Modern Masterpiece",        price: "$12,000,000",beds: 7, baths: 9, sqft: "12,000",tag: "Luxury" },
  ],
  nature: [
    { id: 10, title: "Eco Home in Topanga Canyon",       price: "$1,450,000", beds: 3, baths: 2, sqft: "2,200", tag: "Sustainable" },
    { id: 11, title: "Hillside Retreat in Laurel Canyon", price: "$1,800,000", beds: 3, baths: 3, sqft: "2,800", tag: "Nature" },
    { id: 12, title: "Garden Oasis in South Pasadena",    price: "$1,100,000", beds: 4, baths: 2, sqft: "2,400", tag: "Garden" },
  ],
  creative: [
    { id: 13, title: "Artist Loft in Arts District",     price: "$920,000",   beds: 2, baths: 2, sqft: "1,600", tag: "Studio" },
    { id: 14, title: "Converted Warehouse in DTLA",      price: "$1,350,000", beds: 2, baths: 2, sqft: "2,100", tag: "Industrial" },
    { id: 15, title: "Colorful Cottage in Venice",       price: "$1,650,000", beds: 3, baths: 2, sqft: "1,800", tag: "Eclectic" },
  ],
};

const NAME_TO_KEY = {
  "The Urban Modernist": "modern",
  "The Cozy Curator":    "cozy",
  "The Luxury Visionary": "luxe",
  "The Nature Dweller":  "nature",
  "The Creative Maverick":"creative",
};

const ROOM_LABELS = {
  bedroom:    "Dream Master Bedroom",
  livingroom: "Dream Living Room",
  kitchen:    "Dream Chef Kitchen",
  bathroom:   "Dream Spa Bathroom",
  diningroom: "Dream Dining Room",
  garden:     "Dream Outdoor Garden",
  exterior:   "Dream Architecture Exterior",
  scenic:     "Dream Scenic Window View",
};

const OPTION_LABELS = {
  "city-penthouse": "City Penthouse",
  "mountain-cabin": "Mountain Cabin",
  "beachfront-villa": "Beachfront Villa",
  "countryside-estate": "Countryside Estate",
  "desert-oasis": "Desert Oasis",
  "minimalist-chef": "Stainless Steel Chef Kitchen",
  "rustic-hearth": "Warm Wooden Farmhouse Hearth",
  "marble-waterfall": "Imperial Marble Waterfall Kitchen",
  "indoor-greenery": "Biophilic Greenhouse Kitchen",
  "industrial-loft": "Concrete & Exposed Brick Loft Kitchen",
  "steel-glass": "Polished Steel & Glass",
  "timber-stone": "Reclaimed Timber & Heavy Stone",
  "marble-velvet": "Imperial White Marble & Velvet",
  "cork-bamboo": "Sustainable Cork & Bamboo",
  "brass-terrazzo": "Aged Brass & Speckled Terrazzo",
  "smart-tech": "Fully Automated Smart Core",
  "vintage-charm": "Vintage Library with Crown Moldings",
  "spa-resort": "Heated Spa Sanctuary",
  "garden-greenhouse": "Botanical Glass Atrium",
  "art-studio": "Creative Workshop",
  "meditation": "Sunrise Yoga & Meditation",
  "hosting-parties": "Intimate Dinner Party",
  "reading-nook": "Reading by the Hearth",
  "gaming-setup": "Immersive Movie/Gaming Setup",
  "cooking-kitchen": "Baking Artisanal Sourdough",
  "sunrise": "Golden Sunrise morning rays",
  "golden-hour": "Amber Sunset Golden Hour glow",
  "moody-evening": "Moody Twilight shadows and warm lamps",
  "starlit-night": "Clear Moonlit Starlit Sky view",
  "rainy-afternoon": "Overcast Atmospheric Rainy Afternoon vibes",
  "architect": "The Architect (precision and structure)",
  "botanist": "The Botanist (nurturing and ecology)",
  "art-collector": "The Art Collector (curated expression)",
  "chef": "The Chef (warm gathering)",
  "astronaut": "The Astronaut (futuristic boundary-pushing)"
};

export default function Results({ personality, images, answers = {}, onRestart, isShared = false, resultId = "" }) {
  const [shareNote, setShareNote] = useState("");
  const [lightboxImg, setLightboxImg] = useState(null);

  if (!personality) return null;

  const key = NAME_TO_KEY[personality.name] || "modern";
  const listings = LISTINGS[key];
  const hasImages = images && Object.keys(images).length > 0;

  function share() {
    const text = `I am "${personality.name}" -- ${personality.tagline}\nExplore my AI-designed dream home on Snaphomz!`;
    const url = resultId 
      ? `${window.location.origin}/results/${resultId}` 
      : window.location.href;

    if (navigator.share) {
      navigator.share({ title: personality.name, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      setShareNote("Link copied to clipboard!");
      setTimeout(() => setShareNote(""), 3000);
    }
  }

  function handleBack() {
    if (isShared) {
      window.location.href = "/";
    } else if (onRestart) {
      onRestart();
    }
  }

  return (
    <section className={styles.results}>
      {/* Top action row */}
      <div className={styles.top}>
        <span className={styles.secLabel}>ANALYSIS COMPLETED</span>
        <button id="retake-btn" className="btn-ghost" onClick={handleBack}>
          {isShared ? "Take the Quiz" : "Retake Quiz"}
        </button>
      </div>

      <div className={styles.content}>
        {/* ---- Left Sidebar: Personality Profile ---- */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <div className={styles.cardGlow} style={{ background: `radial-gradient(ellipse at center, ${personality.color}15 0%, transparent 70%)` }} />
            <span className={styles.cardLabel}>YOUR PROFILE</span>

            <h1 className={styles.cardName}>{personality.name}</h1>
            <p className={styles.cardTagline}>{personality.tagline}</p>

            <div className={styles.traits}>
              {personality.traits?.map((t) => (
                <span key={t} className={styles.trait} style={{ borderColor: `${personality.color}30`, color: personality.color }}>
                  {t}
                </span>
              ))}
            </div>

            <p className={styles.cardDesc}>{personality.description}</p>
          </div>

          {/* ---- Quiz Alignment Summary ---- */}
          {answers && Object.keys(answers).length > 0 && (
            <div className={styles.emailBox}>
              <h3 className={styles.emailTitle}>Your Quiz Alignment</h3>
              <p className={styles.emailSub} style={{ marginBottom: "16px" }}>
                How our design system mapped your answers into your custom home:
              </p>
              <div className={styles.alignmentList}>
                <div className={styles.alignmentItem}>
                  <span className={styles.alignDot} />
                  <span>
                    <strong>Location setting:</strong> {OPTION_LABELS[answers.location] || answers.location || "Custom"} located in <strong>{answers.country || "California, USA"}</strong>
                  </span>
                </div>
                <div className={styles.alignmentItem}>
                  <span className={styles.alignDot} />
                  <span>
                    <strong>Kitchen design:</strong> Styled with a {OPTION_LABELS[answers.kitchen] || answers.kitchen || "gourmet setup"}
                  </span>
                </div>
                <div className={styles.alignmentItem}>
                  <span className={styles.alignDot} />
                  <span>
                    <strong>Material palette:</strong> Built with {OPTION_LABELS[answers.materials] || answers.materials} textures
                  </span>
                </div>
                <div className={styles.alignmentItem}>
                  <span className={styles.alignDot} />
                  <span>
                    <strong>Core feature:</strong> Integrated with a {OPTION_LABELS[answers.mustHave] || answers.mustHave}
                  </span>
                </div>
                <div className={styles.alignmentItem}>
                  <span className={styles.alignDot} />
                  <span>
                    <strong>Ambient Lighting:</strong> Staged with {OPTION_LABELS[answers.lighting] || answers.lighting}
                  </span>
                </div>
                <div className={styles.alignmentItem}>
                  <span className={styles.alignDot} />
                  <span>
                    <strong>Design Philosophy:</strong> Guided by {OPTION_LABELS[answers.spirit] || answers.spirit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ---- Email lead capture tied to DB ---- */}
          <EmailCapture personalityName={personality.name} resultId={resultId} />
        </div>

        {/* ---- Right Column: AI Visuals Gallery ---- */}
        <div className={styles.gallerySection}>
          {hasImages ? (
            <div className={styles.section}>
              <h2 className={styles.secTitle}>AI-Generated Dream Rooms</h2>
              <p className={styles.secSub}>Click any room to view full-screen high-resolution renderings.</p>

              <div className={styles.roomGrid}>
                {Object.entries(images).map(([room, src]) => (
                  <div key={room} className={styles.roomCard} onClick={() => setLightboxImg({ src, label: ROOM_LABELS[room] || room })}>
                    <div className={styles.roomImgWrap}>
                      <img src={src} alt={ROOM_LABELS[room] || room} className={styles.roomImg} />
                      <div className={styles.overlay}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <polyline points="9 21 3 21 3 15"></polyline>
                          <line x1="21" y1="3" x2="14" y2="10"></line>
                          <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                      </div>
                      <span className={styles.aiBadge}>AI Generated</span>
                    </div>
                    <div className={styles.roomName}>{ROOM_LABELS[room] || room}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.noImages}>
              <h3>Images Not Available</h3>
              <p>Hugging Face API token is required or loading took too long.</p>
            </div>
          )}

          {/* ---- Listings matched from Snaphomz ---- */}
          <div className={styles.section} style={{ marginTop: "48px" }}>
            <h2 className={styles.secTitle}>Matching Snaphomz Listings</h2>
            <p className={styles.secSub}>Real estate matches mirroring your architectural aesthetics.</p>

            <div className={styles.listGrid}>
              {listings.map((l, i) => (
                <div key={l.id} className={styles.listing} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className={styles.listingTop}>
                    <span className={styles.listingTag}>{l.tag}</span>
                  </div>
                  <div className={styles.listingBody}>
                    <h3 className={styles.listingTitle}>{l.title}</h3>
                    <p className={styles.listingPrice}>{l.price}</p>
                    <div className={styles.listingMeta}>
                      <span>{l.beds} bd</span>
                      <span className={styles.bullet}>•</span>
                      <span>{l.baths} ba</span>
                      <span className={styles.bullet}>•</span>
                      <span>{l.sqft} sqft</span>
                    </div>
                  </div>
                  <button
                    id={`listing-${l.id}`}
                    className={styles.listingBtn}
                    onClick={() => window.open("https://snaphomz.com/listings", "_blank")}
                  >
                    View Details
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Share CTA block ---- */}
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Love Your Dream Home?</h2>
            <p className={styles.ctaText}>Copy your shareable result link or explore other listings on Snaphomz.</p>
            <div className={styles.ctaBtns}>
              <button id="share-btn" className="btn" onClick={share}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Copy Share Link
              </button>
              <button
                id="explore-btn"
                className="btn-ghost"
                onClick={() => window.open("https://snaphomz.com/listings", "_blank")}
              >
                Explore More Homes
              </button>
            </div>
            {shareNote && <p className={styles.shareNote}>{shareNote}</p>}
          </div>
        </div>
      </div>

      {/* ---- Full-screen Image Lightbox Overlay ---- */}
      {lightboxImg && (
        <div className={styles.lightbox} onClick={() => setLightboxImg(null)}>
          <button className={styles.closeLightbox} onClick={() => setLightboxImg(null)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg.src} alt={lightboxImg.label} className={styles.lightboxImg} />
            <span className={styles.lightboxLabel}>{lightboxImg.label}</span>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---- Email Capture Sub-component ---- */
function EmailCapture({ personalityName, resultId }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);

    try {
      if (resultId) {
        await fetch("/api/results/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: resultId, email }),
        });
      }
      setDone(true);
    } catch (err) {
      console.error("Lead submission failed:", err);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className={styles.emailBox}>
        <div className={styles.emailDone}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <h3>Subscription Confirmed</h3>
          <p>We've linked your design profile. Look out for matching properties in your inbox weekly!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.emailBox}>
      <h3 className={styles.emailTitle}>Curated Weekly Homes</h3>
      <p className={styles.emailSub}>Get new listings matching the {personalityName} aesthetic. No spam.</p>
      <form className={styles.emailForm} onSubmit={submit}>
        <input
          id="email-input"
          type="email"
          placeholder="your.email@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.emailField}
          required
        />
        <button id="email-btn" type="submit" disabled={submitting} className="btn">
          {submitting ? "..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
