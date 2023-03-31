export interface Message {
    id?: string;
    senderId?: string;
    recipientId?: string;
    senderName?: string;
    recipientName?: string;
    content: string;
    timestamp?: Date;
    status?: string;
}