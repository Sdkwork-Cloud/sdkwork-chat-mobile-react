/** Create friend request */
export interface FriendRequestCreateForm {
  /** Target user id */
  toUserId: string;
  /** Optional request message */
  message?: string;
}
