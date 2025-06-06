export type TParcelStatusEnum = "empty" | "delivered" | "claimed";

export type TMailbox = {
  id: string;
  description: string;
  is_locked: boolean;
  parcel_status: TParcelStatusEnum;
  rfid: string;
  time: string;
  created_at: string;
  updated_at: string;
};

export type THistory = {
  id: string;
  mailbox_id: string;
  is_read: boolean;
  created_at: string;
};
