import { model, Schema } from "mongoose";

const directorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      required: true,
      default: null,
    },
  },
  { strict: "throw" }
);

const Directory = model("Directory", directorySchema);

export default Directory;
