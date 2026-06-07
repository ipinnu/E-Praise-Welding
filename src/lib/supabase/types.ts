export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "client" | "admin";
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  context_label: string | null;
  read_at: string | null;
  created_at: string;
  sender?: Profile;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  message_id: string;
  storage_url: string;
  file_name: string;
  created_at: string;
}
