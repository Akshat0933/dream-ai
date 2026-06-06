import mongoose from "mongoose";

const QuizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    index: true,
  },
  answers: {
    type: Map,
    of: String,
    required: true,
  },
  personality: {
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    traits: [{ type: String }],
    color: { type: String, required: true },
  },
  images: {
    type: Map,
    of: String, // Map of room names to base64 data strings
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.QuizResult || mongoose.model("QuizResult", QuizResultSchema);
