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
    childName: {
      type: SchemaType.TypeString,
     // required: true,
      //unique: true,
      // index: true,
    },
    userType: {
      type: SchemaType.TypeString,
     // required: true,
      //unique: true,
      // index: true,
    },
    favouriteAnimal: {
      type: SchemaType.TypeString,
     // required: true,
      //unique: true,
      // index: true,
    },
    storyTheme: {
      type: SchemaType.TypeString,
     // required: true,
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
    status: {
      type: SchemaType.TypeString,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
    is_mock: {
      type: SchemaType.TypeBoolean,
      default: false,
    },
    categories: {
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
    age_min: {
      type: SchemaType.TypeNumber,
    },
    age_max: {
      type: SchemaType.TypeNumber,
    },
    duration: {
      type: SchemaType.TypeString,
      //enum: ["short", "medium", "long"],
    },
    duration_s: {
      type: SchemaType.TypeNumber,
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
    assets: {
      final_m4a_url: {
        type: SchemaType.TypeString,
      },
      text: {
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
    tonightPic: {
      type: SchemaType.TypeBoolean,
      default: false,
    },
    image_url: {
      type: SchemaType.TypeString,
    },
    audio_url: {
      type: SchemaType.TypeString,
    },
  },
  { timestamps: true }
);

export default storySchema;