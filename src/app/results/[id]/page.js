export const dynamic = 'force-dynamic';

import { dbConnect, hasMongoConnectionString } from "@/lib/mongodb";
import QuizResult from "@/models/QuizResult";
import Results from "@/components/Results";
import { notFound } from "next/navigation";

export default async function ResultPage({ params }) {
  const { id } = await params;

  if (!hasMongoConnectionString()) {
    return notFound();
  }

  try {
    await dbConnect();
  } catch (err) {
    console.error("Failed to connect to database:", err);
    return notFound();
  }

  let resultDoc;
  try {
    resultDoc = await QuizResult.findById(id).lean();
  } catch (err) {
    return notFound();
  }

  if (!resultDoc) {
    return notFound();
  }

  const personality = {
    name: resultDoc.personality.name,
    tagline: resultDoc.personality.tagline,
    description: resultDoc.personality.description,
    traits: resultDoc.personality.traits,
    color: resultDoc.personality.color,
  };

  const images = {};
  if (resultDoc.images) {
    for (const [key, value] of Object.entries(resultDoc.images)) {
      images[key] = value;
    }
  }

  const answers = {};
  if (resultDoc.answers) {
    if (resultDoc.answers instanceof Map) {
      resultDoc.answers.forEach((v, k) => {
        answers[k] = v;
      });
    } else {
      Object.assign(answers, resultDoc.answers);
    }
  }

  return (
    <main style={{ minHeight: "100vh" }}>
      <Results 
        personality={personality} 
        images={images} 
        answers={answers}
        isShared={true} 
        resultId={id} 
      />
    </main>
  );
}
