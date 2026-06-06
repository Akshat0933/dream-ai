import mongoose from "mongoose";

const ImageCacheSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // e.g., "modern_bedroom"
    index: true,
  },
  base64: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ImageCache || mongoose.model("ImageCache", ImageCacheSchema);
