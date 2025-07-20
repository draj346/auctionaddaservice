export interface FileData {
  image: string;
  userId: number;
  fileId?: number;
}

export interface AuctionFileData {
  image: string;
  auctionId: number;
  fileId?: number;
  type: 'logo' | 'qrcode';
}

export interface FileSchemaProps {
  name: string;
  path: string;
  url: string;
  fileId?: number;
}

export interface ExcelFileData {
  file: File;
}

export interface FilePathSchema {
  path: string;
  fileId: number;
}