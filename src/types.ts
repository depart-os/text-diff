export type DiffPartType = "eq" | "add" | "del";

export interface DiffPart {
  type: DiffPartType;
  text: string;
}

export type Mark = "b" | "i" | "u";
export interface MarkedToken {
  text: string;
  marks: string;
}
export interface MarkedPart {
  type: DiffPartType;
  text: string;
  marks: string;
}
