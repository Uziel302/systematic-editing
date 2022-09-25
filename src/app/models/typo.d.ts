export interface ITypo {
  id: number,
  suspect: string;
  correction: string;
  title: string;
  contextBefore: string;
  contextAfter: string;
  project: string;
}
