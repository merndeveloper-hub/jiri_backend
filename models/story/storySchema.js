import mongoose from "mongoose";
import SchemaType from "../../types/index.js";


// Story Schema
const storySchema = new mongoose.Schema(
  {
    storyId: {
      type: SchemaType.TypeString,
      required: true,
      //unique: true,
     // index: true,
    },
    title: {
      type: SchemaType.TypeString,
      required: true,
    },
    description: {
      type: SchemaType.TypeString,
    },
    category: {
      type: SchemaType.TypeString,
      enum: [
        "Calm",
        "Bedtime & Sleep",
        "Adventure & Exploration",
        "Friendship & Family",
        "Magic & Fantasy",
        "Animals & Nature",
      ],
    },
    ageGroup: {
      type: SchemaType.TypeString,
    //  enum: ["2-3 years", "4-5 years", "6-8 years"],
    },
    duration: {
      type: SchemaType.TypeString,
      //enum: ["short", "medium", "long"],
    },
    durationMin: {
      type: SchemaType.TypeNumber,
    },
    mood: {
      type: SchemaType.TypeString,
     // enum: ["Calm/Soothing", "Happy/Playful", "Curious/Imaginative", "Comforting"],
    },
    textContent: {
      type: SchemaType.TypeString,
    },
    audioLinks: {
      male: {
        type: SchemaType.TypeString,
      },
      female: {
        type: SchemaType.TypeString,
      },
    },
    languages: [
      {
        type: SchemaType.TypeString,
        default: ["cs"],
      },
    ],
    isPro: {
      type: SchemaType.TypeBoolean,
      default: false,
    },
    thumbnailUrl: {
      type: SchemaType.TypeString,
    },
  },
  { timestamps: true }
);


export default storySchema;