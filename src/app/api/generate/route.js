import { NextResponse } from "next/server";
import { dbConnect, hasMongoConnectionString } from "@/lib/mongodb";
import { parseSessionToken } from "@/lib/auth";
import ImageCache from "@/models/ImageCache";
import QuizResult from "@/models/QuizResult";
import crypto from "crypto";

/*
  Personality engine + AI image generation via Hugging Face.
  Uses FLUX.1-schnell (Black Forest Labs) -- fast, high quality, free on HF Inference API.
  With database-level image caching & persistence.
*/

// ---- answer-to-vibe mapping ----
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

// ---- personalities ----
const PERSONALITIES = {
  modern: {
    name: "The Urban Modernist",
    tagline: "Clean lines, bold choices, city energy.",
    description:
      "You gravitate toward sleek, minimal spaces with floor-to-ceiling glass and smart-home tech. Your ideal home is a modern loft or penthouse where every surface is intentional.",
    color: "#6C5CE7",
    traits: ["Minimalist", "Tech-Forward", "Urban"],
    style: "ultra-modern minimalist design, clean geometric lines, polished concrete surfaces, high structural glass panels",
  },
  cozy: {
    name: "The Cozy Curator",
    tagline: "Warmth, texture, and a story in every corner.",
    description:
      "You crave comfort and character -- warm wood tones, layered textiles, vintage finds, and a fireplace that actually gets used. Craftsman cottage meets hygge paradise.",
    color: "#E17055",
    traits: ["Warm", "Layered", "Character-Rich"],
    style: "warm cozy rustic design, exposed timber beams, brick fireplace hearth, layered knit blankets and cushions",
  },
  luxe: {
    name: "The Luxury Visionary",
    tagline: "Nothing but the finest.",
    description:
      "You appreciate marble counters, designer lighting, wine cellars, and infinity pools. Your dream home is an architectural statement blending opulence with timeless elegance.",
    color: "#FDCB6E",
    traits: ["Opulent", "Refined", "Statement"],
    style: "ultra-luxury high-end design, Calacatta marble surfaces, brushed gold accents, elegant velvet fabrics",
  },
  nature: {
    name: "The Nature Dweller",
    tagline: "Rooted in earth, open to sky.",
    description:
      "You want birdsong and morning mist. Your dream home dissolves the boundary between inside and out -- living walls, natural stone, skylights, and a garden you actually tend.",
    color: "#00B894",
    traits: ["Organic", "Sustainable", "Serene"],
    style: "biophilic design, lush living green foliage, raw natural stone, massive skylights, light oak details",
  },
  creative: {
    name: "The Creative Maverick",
    tagline: "Rules are for other people's houses.",
    description:
      "You see your home as a canvas. Bold colors, unexpected art, mixed materials, and spaces that spark inspiration. Not a single beige surface in sight.",
    color: "#FD79A8",
    traits: ["Bold", "Artistic", "Eclectic"],
    style: "eclectic maximalist artistic design, bold vibrant colors, Terrazzo floors, sculptural furniture pieces",
  },
};

// ---- prompt fragment builders from quiz answers ----

const KITCHEN_DESC = {
  "minimalist-chef": "commercial-grade stainless steel range, zero clutter, ultra-sleek matte surfaces, professional chef setup",
  "rustic-hearth": "reclaimed timber open shelves, massive exposed brick pizza hearth, deep white porcelain apron sink, cozy copper pots",
  "marble-waterfall": "dramatic Calacatta marble waterfall island, brushed gold fixtures, double undermount sink, integrated task lighting",
  "indoor-greenery": "built-in organic herb planters, cascading ivy foliage, large kitchen skylights, light oak cabinets",
  "industrial-loft": "polished concrete countertops, exposed piping, steel frames, blackboard walls, mismatched bar stools"
};

const MATERIAL_DESC = {
  "steel-glass": "polished steel framing, structured clear glass, and clean lines",
  "timber-stone": "heavy hand-cut fieldstone, solid reclaimed oak columns, and textured plaster",
  "marble-velvet": "veined imperial white marble, jewel-toned velvet upholstery, and gold trim",
  "cork-bamboo": "natural cork panels, structural bamboo, and clay plasters",
  "brass-terrazzo": "custom speckled terrazzo floors, aged brass fixtures, and geometric shapes"
};

const LIGHTING_DESC = {
  sunrise: "flooded with golden natural morning light and clean crisp reflections",
  "golden-hour": "bathed in warm honey-colored golden hour rays casting long dramatic shadows",
  "moody-evening": "lit with soft moody twilight, flickering candles, and dim warm incandescent table lamps",
  "starlit-night": "illuminated by soft moonlight and glowing starlight visible through large glass windows",
  "rainy-afternoon": "overcast atmospheric light, cozy shadows, and soft rain droplets visible on window panes"
};

const LOCATION_NAME = {
  "city-penthouse": "luxury high-rise penthouse",
  "mountain-cabin": "rustic a-frame mountain chalet",
  "beachfront-villa": "modern oceanfront beachfront villa",
  "countryside-estate": "spacious rolling hills countryside estate",
  "desert-oasis": "futuristic low-profile desert oasis villa"
};

// ---- local geographic lookup function for realism ----
function getGeographicDetails(countryText) {
  const text = countryText.toLowerCase();
  
  if (text.includes("india") || text.includes("ahmedabad") || text.includes("mumbai") || text.includes("delhi") || text.includes("bangalore")) {
    return {
      weather: "warm tropical sunshine with natural ambient dust rays",
      trees: "native gulmohar, neem, and bougainvillea foliage",
      materials: "terracotta tile trims, local sandstone accents, and traditional plaster finishes"
    };
  }
  if (text.includes("japan") || text.includes("tokyo") || text.includes("kyoto") || text.includes("osaka")) {
    return {
      weather: "soft natural afternoon daylight, clean clear sky",
      trees: "japanese maples and cherry blossoms",
      materials: "minimalist cedar wood paneling, light oak framing, and shoji screens"
    };
  }
  if (text.includes("uk") || text.includes("london") || text.includes("cotswolds") || text.includes("england")) {
    return {
      weather: "soft overcast silver lighting with mist",
      trees: "heritage oak trees and climbing ivy walls",
      materials: "weathered red brick masonry or cotswolds limestone walls, slate roofs"
    };
  }
  if (text.includes("iceland") || text.includes("reykjavik")) {
    return {
      weather: "dramatic volcanic Nordic overcast light, cool ambient glow",
      trees: "low-lying green moss and wild purple lupine patches",
      materials: "dark corrugated weatherproof metal plating, black basalt stone blocks"
    };
  }
  if (text.includes("italy") || text.includes("amalfi") || text.includes("rome") || text.includes("tuscany")) {
    return {
      weather: "bright Mediterranean sunshine, warm sunset vibes",
      trees: "ancient olive trees, tall cypress trees, and potted jasmine",
      materials: "terracotta flooring, warm hand-painted stucco plaster, and travertine marble slabs"
    };
  }
  if (text.includes("switzerland") || text.includes("alps") || text.includes("zurich")) {
    return {
      weather: "alpine sun reflecting off snow, crisp clear mountain atmosphere",
      trees: "dense pine and fir trees",
      materials: "heavy exposed pine log columns, massive structural timber joints, and grey granite rocks"
    };
  }

  // default fallback using variables that instruct FLUX to parse the input country details
  return {
    weather: "realistic local regional daylight and sky conditions",
    trees: "native trees and local garden flora",
    materials: "local regional building materials and authentic architectural textures"
  };
}

const MODELS = [
  "black-forest-labs/FLUX.1-schnell",
];

async function generateImage(prompt, token) {
  for (const model of MODELS) {
    try {
      const body = {
        inputs: prompt,
        parameters: { num_inference_steps: 4 },
      };

      const res = await fetch(
        `https://router.huggingface.co/hf-inference/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (res.status === 503) {
        const info = await res.json().catch(() => ({}));
        const wait = Math.min((info.estimated_time || 15) * 1000, 30000);
        console.log(`Model ${model} loading, waiting ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));

        const retry = await fetch(
          `https://router.huggingface.co/hf-inference/models/${model}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (retry.ok) {
          const buf = await retry.arrayBuffer();
          return `data:image/jpeg;base64,${Buffer.from(buf).toString("base64")}`;
        }
        continue;
      }

      if (!res.ok) {
        console.warn(`Model ${model} returned ${res.status}, trying next...`);
        continue;
      }

      const buf = await res.arrayBuffer();
      return `data:image/jpeg;base64,${Buffer.from(buf).toString("base64")}`;
    } catch (err) {
      console.error(`Error with ${model}:`, err.message);
      continue;
    }
  }

  return null;
}

// ---- API handler ----
export async function POST(request) {
  try {
    const hasMongo = hasMongoConnectionString();
    if (hasMongo) {
      await dbConnect();
    }

    const { answers, email: inputEmail } = await request.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    let userId = null;
    const sessionCookie = request.cookies.get("session")?.value;
    if (sessionCookie) {
      const payload = parseSessionToken(sessionCookie);
      if (payload?.userId) {
        userId = payload.userId;
      }
    }

    const votes = {};
    Object.entries(answers).forEach(([key, val]) => {
      if (key === "country") return;
      const vibe = VIBE_MAP[val] || "modern";
      votes[vibe] = (votes[vibe] || 0) + 1;
    });

    const winner =
      Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || "modern";

    const personality = PERSONALITIES[winner];

    // Read answers and compile dynamic descriptors
    const targetLocation = answers.location || "city-penthouse";
    const userCountry = answers.country || "California, USA";
    const selectedKitchen = answers.kitchen || "minimalist-chef";
    const selectedMaterials = answers.materials || "steel-glass";
    const selectedLighting = answers.lighting || "golden-hour";

    const locName = LOCATION_NAME[targetLocation] || "luxury home";
    const kitDesc = KITCHEN_DESC[selectedKitchen] || "modern gourmet kitchen";
    const matDesc = MATERIAL_DESC[selectedMaterials] || "premium finishes";
    const litDesc = LIGHTING_DESC[selectedLighting] || "natural lighting";

    const geoDetails = getGeographicDetails(userCountry);

    // Build the unified styling DNA to align all generated images
    const designDNA = `${personality.style}, highlighting a materials palette of ${matDesc}, situated in the real city context of ${userCountry} using ${geoDetails.materials}, under ${geoDetails.weather}, shot on high-end camera, Fujifilm GFX 100S, highly realistic, real textures, authentic details, no CGI, no fantasy elements`;

    // Specialized prompt mappings all sharing the designDNA prefix
    const promptMap = {
      bedroom: `${designDNA}, photography of the master bedroom, showing a high-end bed with realistic cotton linens, natural lighting from windows, local bower plants near window`,
      livingroom: `${designDNA}, photography of a lived-in master living room with comfortable seating, realistic layouts, blick outside window shows the local street trees of ${geoDetails.trees}`,
      kitchen: `${designDNA}, photography of the kitchen featuring a ${kitDesc}, realistic utensils and details, banyan wood accents`,
      bathroom: `${designDNA}, photography of the master bathroom showcasing a standalone tub, double vanity, custom fittings`,
      diningroom: `${designDNA}, photography of the dining room with a large wooden or marble dining table, ambient light, glass details`,
      garden: `${designDNA}, wide-angle exterior photography of the outdoor garden, private courtyard, or terrace decorated with local ${geoDetails.trees}`,
      exterior: `${designDNA}, award-winning architectural photography of the home exterior, situated on a real residential neighborhood street in ${userCountry} with local ${geoDetails.trees} and regional sky`,
      scenic: `${designDNA}, realistic vista photograph looking out from the large floor-to-ceiling glass window showcasing the authentic local cityscape, regional buildings, local streets, and sky landscape of ${userCountry}`
    };

    const images = {};
    const rooms = Object.keys(promptMap);

    const promises = rooms.map(async (room) => {
      const fullPrompt = promptMap[room];
      const cacheKey = crypto.createHash("md5").update(fullPrompt).digest("hex");

      if (hasMongo) {
        try {
          const cached = await ImageCache.findOne({ key: cacheKey });
          if (cached?.base64) {
            images[room] = cached.base64;
            return;
          }
        } catch (cacheErr) {
          console.error("Cache read error:", cacheErr);
        }
      }

      if (token && token !== "your_token_here") {
        const img = await generateImage(fullPrompt, token);
        if (img) {
          images[room] = img;

          if (hasMongo) {
            try {
              await ImageCache.create({ key: cacheKey, base64: img });
            } catch (cacheSaveErr) {
              console.error("Cache save error:", cacheSaveErr);
            }
          }
        }
      }
    });

    await Promise.all(promises);

    let quizResult = null;
    if (hasMongo) {
      quizResult = await QuizResult.create({
        userId,
        answers,
        personality: {
          name: personality.name,
          tagline: personality.tagline,
          description: personality.description,
          traits: personality.traits,
          color: personality.color,
        },
        images,
        email: inputEmail || "",
      });
    }

    return NextResponse.json({
      id: quizResult?._id || "",
      personality: {
        name: personality.name,
        tagline: personality.tagline,
        description: personality.description,
        traits: personality.traits,
        color: personality.color,
      },
      images,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
