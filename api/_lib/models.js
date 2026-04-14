import mongoose from "mongoose";

const userSchema =
  mongoose.models.users?.schema ||
  new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
  });

const sessionSchema =
  mongoose.models.Session?.schema ||
  new mongoose.Schema(
    {
      subject: {
        type: String,
        required: true,
        trim: true,
      },
      location: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
      hostName: {
        type: String,
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      joinedUserIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
      ],
    },
    {
      timestamps: true,
    },
  );

export const User = mongoose.models.users || mongoose.model("users", userSchema);
export const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
