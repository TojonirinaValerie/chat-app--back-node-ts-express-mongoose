import { model, Schema, Types, Document } from "mongoose";
enum UserRole {
  Regular = "regular_user",
  Admin = "admin",
}

enum Status {
  Pending = "pending",
  Rejected = "rejected",
  Deleted = "deleted",
  Active = "active",
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  pseudo: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  status: Status;
  nbrConnected: number;
  profilPicture: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    pseudo: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
      default: UserRole.Regular,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(Status),
      default: Status.Pending,
    },
    nbrConnected: {
      type: Number,
      required: true,
      default: 0,
    },
    profilPicture: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Active les champs createdAt et updatedAt
  }
);

UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;
