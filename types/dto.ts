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
