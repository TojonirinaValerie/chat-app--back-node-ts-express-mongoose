import { Router } from "express";
import {
  getCurrentUserInfo,
  getUserById,
  uploadProfilPicture,
} from "../controllers/user";
import {
  getConversations,
  getDiscussions,
  markAsSeen,
  sendMessage,
} from "../controllers/message";
import {
  checkBodyData,
  checkQueryParamsData,
} from "../middlewares/auth.middleware";
import { foundUser } from "../middlewares/message.middleware";
import UploadWithMulter, {
  createFolderMiddleware,
  verifyFile,
} from "../middlewares/upload.middleware";
import {
  deleteRequest,
  getFriendRequest,
  getListFriend,
  getMyFriendRequest,
  getSuggestions,
  replyFriendRequest,
  resendRequest,
  sendFriendRequest,
} from "../controllers/relation";
import { getNotificationNumber } from "../controllers/notification";
import { findRelation } from "../middlewares/relation.middleware";

const privateRoute = Router();

privateRoute.get("/user", getCurrentUserInfo);
privateRoute.get("/user/:id", getUserById);
privateRoute.put(
  "/upload-profil-picture",
  [createFolderMiddleware, UploadWithMulter.single("file"), verifyFile],
  uploadProfilPicture
);

privateRoute.post(
  "/send-message",
  [checkBodyData(["content", "receiver"]), foundUser("receiver")],
  sendMessage
);
privateRoute.get("/discussions", getDiscussions);
privateRoute.get(
  "/conversations/:otherUserId",
  [checkQueryParamsData(["skip", "limit"])],
  getConversations
);
privateRoute.post("/mark-as-seen", [checkBodyData(["otherUser"])], markAsSeen);

privateRoute.get("/suggestions", getSuggestions);
privateRoute.get("/friend-request", getFriendRequest);
privateRoute.get("/my-friend-request", getMyFriendRequest);
privateRoute.delete("/delete-request/:idRelation", deleteRequest);
privateRoute.get("/friend", getListFriend);
privateRoute.post(
  "/send-friend-request",
  [checkBodyData(["receiver"])],
  sendFriendRequest
);
privateRoute.post("/resend-friend-request", [findRelation], resendRequest);
privateRoute.post(
  "/reply-friend-request",
  [checkBodyData(["idRelation", "status"]), findRelation],
  replyFriendRequest
);

privateRoute.get("/notification-count", getNotificationNumber);

export default privateRoute;
