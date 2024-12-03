import { model, Schema, Types, Document } from "mongoose";
import { IUser } from "./user.model";

export enum RelationStatus {
  Pending = "pending",
  Accepted = "accepted",
  Rejected = "rejected",
  Deleted = "deleted",
  Active = "active",
}
export interface IRelation extends Document {
  _id: Types.ObjectId;
  sender: IUser["_id"];
  receiver: IUser["_id"];
  status: RelationStatus;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const RelationSchema = new Schema<IRelation>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(RelationStatus),
    default: RelationStatus.Pending,
  },
  date: {
    type: Date,
    default: Date.now,
  },
},
{
  timestamps: true, // Active les champs createdAt et updatedAt
});

const RelationModel = model("Relations", RelationSchema);
export default RelationModel;
