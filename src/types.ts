export type DiffPartType = 'eq' | 'add' | 'del'

export interface DiffPart {
  type: DiffPartType
  text: string
}
