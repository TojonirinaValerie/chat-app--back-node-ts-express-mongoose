import { model, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IRelation } from "./relation.model";

export enum NotificationType {
  FriendRequest = "friend-request",
  FriendAccept = "friend-accept",
  FriendReject = "friend-reject",
}

interface INotification extends Document {
  _id: Types.ObjectId;
  type: NotificationType;
  receiver: IUser["_id"];
  relationId?: IRelation["_id"];
  date: Date;
  seen: boolean;
  opened: boolean;
}

const NotificationSchema = new Schema<INotification>({
  type: {
    type: String,
    required: true,
    enum: Object.values(NotificationType),
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  relationId: {
    type: Schema.Types.ObjectId,
    ref: "Relation",
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  seen: {
    type: Boolean,
    default: false,
    required: true,
  },
  opened: {
    type: Boolean,
    required: true,
    default: false,
  },
},
{
  timestamps: true, // Active les champs createdAt et updatedAt
});

const NotificationModel = model("Notifications", NotificationSchema);

export default NotificationModel;
