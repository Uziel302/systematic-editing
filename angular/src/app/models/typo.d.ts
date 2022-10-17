export interface ITypo {
  id: number,
  suspect: string;
  correction: string;
  title: string;
  contextBefore: string;
  contextAfter: string;
  fullContext: string;
  origFullContext: string;
  project: string;
  response: string;
  responseLink: string;
}
