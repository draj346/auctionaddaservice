export interface FileData {
  image: string;
  userId: number;
  fileId?: number;
}

export interface FileSchemaProps {
  name: string;
  path: string;
  url: string;
  fileId?: number;
}

export interface ExcelFileData {
  file: string;
}