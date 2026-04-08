export interface StudyGroup {
  id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  hostName: string;
  time?: string; // Optional legacy field or for display convenience
}
