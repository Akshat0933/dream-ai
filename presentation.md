# Snaphomz Dream Home AI — Presentation & AI Build Guide

This document explains the architecture of the **Dream Home AI** platform, details the AI technologies powering it, and provides a step-by-step prompt roadmap so you can recreate this entire application in **under 2 hours** using AI coding assistants.

---

## 1. Executive Summary & Product Pitch

### The Problem
Most real estate portals suffer from low conversion because **80%+ of visitors are not ready to buy**. They are high-funnel dreamers browsing listings for lifestyle inspiration. Standard search filters (beds, baths, zip code) completely ignore their emotional aspirations.

### The Solution: Dream Home AI
An interactive, 8-question lifestyle and aesthetic personality quiz that:
1. Maps user aspirations to distinct home profiles (Modernist, Nature Dweller, Cozy Curator, Luxe Visionary, Creative Maverick).
2. Generates **8 custom high-resolution room designs & views** tailored to their profile in real-time.
3. Incorporates **user-typed cities & countries** directly into the architectural rendering engine for hyper-customized styling.
4. Uses a **Geographic Regional Lookup** to match building materials, weather/skies, and tree foliage to the entered city (e.g. brick/sandstone and tropical sun for Ahmedabad, India; cedar/shoji and maples for Tokyo, Japan).
5. Applies a **Unified Design DNA Prefix** across all 8 rooms, ensuring they look like actual photos taken inside the same physical house (consistent color temperature, materials, and architectural style).
6. Explains exactly **how their design matches their quiz choices** via an alignment summary card.
7. Connects them to matching local Snaphomz property listings.
8. Capitalizes on high-funnel interest through email leads capture and profile dashboard creation.

---

## 2. AI Technologies: What, Where, and How

We leverage two types of Artificial Intelligence in this project:

### A. Latent Diffusion Image Models: FLUX.1-schnell
*   **What it is**: Developed by Black Forest Labs, FLUX.1-schnell is a state-of-the-art 12-billion parameter latent flow matching model. It is optimized to generate high-fidelity, photorealistic images in just **4 inference steps**.
*   **Where it is used**: Inside our backend API (`src/app/api/generate/route.js`). It generates visual representations of the **Master Bedroom**, **Living Room**, **Chef Kitchen**, **Spa Bathroom**, **Dining Room**, **Outdoor Garden**, **Architecture Exterior**, and **Scenic Vista** for the user's personality.
*   **How it is used**: We query it serverless using the Hugging Face Inference Providers Router.
    - **Endpoint**: `https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell`
    - **Speed**: Thanks to flow-matching distilling, it takes under 1.5 seconds per image (run in parallel) compared to 15+ seconds for older Stable Diffusion models.

### B. LLMs (Large Language Models)
*   **What they are**: Generative pre-trained transformers (like Claude, Gemini, GPT-4) used for advanced code generation and layout design.
*   **Where they are used**: Used as code writing assistants during the build to structure Next.js App Router endpoints, write clean CSS animations, configure MongoDB Mongoose schemas, and construct secure native cookie-based session logic.
*   **How they are used**: Driven by contextual instructions, prompting them to generate isolated components and route logic without introducing package dependency conflicts.

---

## 3. Core System Design & Architecture

```
[ Client Browser ]
  ├── 1. Takes Quiz (8 questions, including custom text City & Country)
  ├── 2. Auth Modal (Registers/Logins via native session cookie)
  ├── 3. Results Dashboard
  │      ├── Quiz Alignment Summary (How answers mapped to designs)
  │      ├── Clipboard share link (/results/[id])
  │      ├── Email subscription (linked to MongoDB)
  │      └── Full-screen Lightbox Image viewer (8 rooms/views)
  └── 4. User Profile Dashboard (/dashboard)
          
[ Next.js API / Backend Router ]
  ├── /api/auth/*     --> Native PBKDF2 Password Hashing & Cookie sessions
  ├── /api/generate   --> Dynamic Prompts + MD5 Hash Caching + FLUX Generator
  └── /api/results    --> Links capturing email to DB records

[ Caching Layer (System Design) ]
  Database: MongoDB
  When user completes quiz:
    1. System compiles final prompt strings.
    2. Generates MD5 hash of prompts (e.g. hash("Modern penthouse in Tokyo, Japan...")).
    3. Queries ImageCache collection using the MD5 hash.
    4. Cache Hit  --> Returns stored base64 image immediately (< 10ms).
    5. Cache Miss --> Calls Hugging Face FLUX.1 API (1.5s), saves base64 to DB, returns image.
```

---

## 4. Rebuild Guide: Recreate This App in 2 Hours Using AI

You can build this entire application in **6 simple steps** using any LLM (e.g., Claude, Cursor, ChatGPT). Follow this sequence:

### Step 1: Project Init & Design Tokens (15 Mins)
Initialize a clean Next.js App Router project and set up CSS custom variables designed around the **twilight-navy and warm gold** colors of the luxury background image.

*   **Prompt to AI**:
    > "Create a Next.js (App Router) CSS file `src/app/globals.css`. Set up CSS root custom variables. Use a twilight-navy background (`#090915`), a translucent glassmorphic card background (`rgba(15, 15, 30, 0.5)`), a primary soft lavender color (`#9C88FF`), and a warm interior accent gold (`#F1C40F`). Add global animations for fading up elements, scaling up cards, and spinning loader rings."

---

### Step 2: Set Up MongoDB and Schema Models (20 Mins)
Set up database connection caching (vital for Next.js hot-reloads) and write the Mongoose schemas.

*   **Prompt to AI**:
    > "Write a MongoDB connection helper in `src/lib/mongodb.js` caching the Mongoose connection globally. Then, create three Mongoose schemas:
    > 1. `User.js` with email (unique, lowercase) and password fields.
    > 2. `QuizResult.js` storing userId (optional), answers map, personality details (name, tagline, description, traits, color), email capture, and images map.
    > 3. `ImageCache.js` storing key (unique indexed string, MD5 hash of prompt) and base64 string."

---

### Step 3: Native Authentication System (25 Mins)
Write a password utility to hash passwords securely using Node's native `crypto` module, and configure API routes to register and login users with cookie sessions.

*   **Prompt to AI**:
    > "Create an auth helper `src/lib/auth.js` using Node's native `crypto` module. Include `hashPassword(password)` using pbkdf2Sync, `verifyPassword(password, storedHash)`, and `createSessionToken(payload)` / `parseSessionToken(token)` encrypting session data with AES-256-cbc.
    > Write Next.js App Router API handlers for:
    > - `/api/auth/register` (hashes password, registers user, sets session cookie)
    > - `/api/auth/login` (checks credentials, sets cookie)
    > - `/api/auth/logout` (deletes cookie)
    > - `/api/auth/me` (parses cookie, returns logged-in user profile)"

---

### Step 4: Caching & Dynamic Prompt Generation API (25 Mins)
Create the API handler that parses quiz answers (including custom text input locations and material choices), conducts tailored prompts, checks the MD5-based cache, and queries Hugging Face.

*   **Prompt to AI**:
    > "Create a Next.js API route `/api/generate/route.js`. The handler should:
    > 1. Connect to MongoDB.
    > 2. Tally answers to decide the personality winner (modern, cozy, luxe, nature, creative).
    > 3. Resolve user session from the cookie.
    > 4. Set up a geographic regional lookup helper mapping user-entered locations (like India, Japan, UK, Iceland, Italy, Switzerland) to specific weather, vegetation, and regional materials.
    > 5. Generate dynamic aligned prompts for 8 rooms ('bedroom', 'livingroom', 'kitchen', 'bathroom', 'diningroom', 'garden', 'exterior', 'scenic') incorporating their choices and sharing a unified Design DNA prefix so all rooms look like photos from the same house.
    > 6. Generate MD5 hashes of each final prompt to query `ImageCache`. If found, use cached image. If missed, fetch from Hugging Face FLUX.1-schnell, save to cache, and continue.
    > 7. Create a `QuizResult` document, link it to the user, and return the database ID along with images."

---

### Step 5: Responsive Split-Column Components (25 Mins)
Create the front-end pages and components (Hero page, Quiz screen with custom text input, Results screen, and Dashboard).

*   **Prompt to AI**:
    > "Write three React client components using modular CSS:
    > 1. `Hero.js` - A dual-column landing page. Left side has headings and CTAs; right side displays a floating visual stack of glassmorphic personality preview cards.
    > 2. `Quiz.js` - An 8-question lifestyle quiz. Put the progress bar and questions on the left; display option selection cards in a vertical stack on the right. Include a text input field for Question 2 ('Specify your dream city and country') that accepts manual typing.
    > 3. `Results.js` - A results screen. Left column displays the user profile card, a 'Quiz Alignment Summary' card detailing how their choices shaped the home, and the email newsletter form. Right column lists the 8 room cards and Snaphomz listing cards. Clicking a room card opens a full-screen image zoom Lightbox overlay."

---

### Step 6: Layout, Dashboard and Shared Router (10 Mins)
Configure the dynamic share page `/results/[id]/page.js`, user saved dashboard `/dashboard/page.js`, and import them in layout.

*   **Prompt to AI**:
    > "Write:
    > 1. `/results/[id]/page.js` - A Next.js server page that queries `QuizResult` by ID from MongoDB, maps its answers map and image fields to plain objects, and renders the `<Results>` client component.
    > 2. `/dashboard/page.js` - A dashboard page. It checks the session cookie, queries `QuizResult` documents where `userId` matches, and displays past designs in a responsive card grid.
    > 3. `layout.js` - Global layout that wraps pages and includes a sticky glassmorphic navigation header (`Header.js`) with logo, 'My Dashboard' link, and an inline Login/Register auth dialog modal."

---

## 5. Summary of Why this Architecture Wins Hackathons
1. **Unbelievably Fast Loading**: By caching FLUX.1 images, you don't keep judges waiting. The page loads in **milliseconds** instead of seconds.
2. **True Business Value**: The email capture links directly to the database, capturing leads. High-funnel dreamers are mapped directly to low-funnel transactional property listings.
3. **Impeccable Code Hygiene**: Bypassing external authentication dependencies (like Auth0 or NextAuth) in favor of lightweight native session cookies guarantees that the project compiles on any container without native-binary rebuild errors.
