export interface ICreateContactMessage {
  name: string;
  mobile: number;
  email: string;
  subject: string;
  message: string;
}

export interface IUpdateContactMessage {
  id: number;
  playerId: number;
}

export interface IContactMessageDetails {
  id: number;
  name: string;
  mobile: number;
  email: string;
  subject: string;
  message: string;
  playerId: number | null;
}