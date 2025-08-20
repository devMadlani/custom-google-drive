import { model, Schema } from "mongoose";
import { number } from "zod";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      required: true,
    },
  },
  { strict: "throw", timestamps: true }
);

const File = model("File", fileSchema);

export default File;
