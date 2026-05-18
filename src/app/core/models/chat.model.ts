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

export interface PagedMessageResponse {
  messages: GroupMessageResponse[];
  currentPage: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
}