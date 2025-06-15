import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minLength: [4, "Password must be at least 4 characters long"],
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      required: true,
    },
  },
  { strict: "throw" }
);

const User = model("User", userSchema);

export default User;
