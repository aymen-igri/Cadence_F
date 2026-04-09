export interface GroupMessageResponse {
  id: string;
  groupId: string;
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  content: string;
  sentAt: string;
}

export interface SendGroupMessageRequest {
  content: string;
}
