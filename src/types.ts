export type DiffPartType = "eq" | "add" | "del";

export interface DiffPart {
  type: DiffPartType;
  text: string;
  /** 임시저장(미제출) 변경 여부. tmp-ins/tmp-del 태그로 직렬화된다. */
  draft?: boolean;
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
  /** 임시저장(미제출) 변경 여부 */
  draft?: boolean;
}
