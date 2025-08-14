import mongoose, { Schema } from "mongoose";
import { Playbook } from "../interfaces/playbooks-interfaces";

export const PlaybookSchema = new Schema<Playbook>({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: "",
  },
  rulesGroup: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      rules: [
        {
          type: String,
          required: true,
          trim: true,
        },
      ],
    },
  ],
  notes: {
    type: String,
    trim: true,
    default: "",
  },
});

export const PlaybookModel =
  mongoose.models.Playbook || mongoose.model("Playbook", PlaybookSchema);
