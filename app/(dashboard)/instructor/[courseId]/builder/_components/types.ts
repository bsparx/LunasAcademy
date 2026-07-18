export type ResourceDTO = {
  resourceID: number;
  kind: "VIDEO" | "LECTURE" | "FILE";
  title: string;
  url: string;
  publicID: string;
  format: string | null;
  bytes: number | null;
  duration: number | null;
};

export type CheckDTO = {
  checkID: number;
  timeSec: number;
  question: string;
  options: string[];
  correctIndices: number[];
  imageURL?: string | null;
  imagePublicID?: string | null;
};

export type QuestionDTO = {
  questionID: number;
  question: string;
  options: string[];
  correctIndices: number[];
  imageURL?: string | null;
  imagePublicID?: string | null;
};

export type ExamDTO = {
  examID: number;
  questions: QuestionDTO[];
};

export type ItemDTO = {
  itemID: number; // negative while an optimistic attach is in flight
  title: string | null; // override; falls back to resource.title / "Exam"
  resource: ResourceDTO | null; // null for exam items
  exam: ExamDTO | null;
};

export type ItemKind = ResourceDTO["kind"] | "EXAM";

export type ModuleDTO = {
  moduleID: number;
  topicID: number;
  title: string;
  items: ItemDTO[];
};

export type TopicDTO = {
  topicID: number;
  title: string;
  modules: ModuleDTO[];
};

export type CourseDTO = {
  courseID: number;
  title: string;
  status: "DRAFT" | "PUBLISHED";
};

export type CapstoneResourceDTO = {
  resourceID: number;
  name: string;
  url: string;
  publicID: string;
  resourceType: string;
  bytes: number | null;
};

export type CapstoneDTO = {
  capstoneID: number;
  title: string;
  brief: string;
  deliverables: string[];
  criteria: string[];
  submissionCount: number;
  resources: CapstoneResourceDTO[];
};

export function itemKind(item: ItemDTO): ItemKind {
  return item.resource ? item.resource.kind : "EXAM";
}

export function itemTitle(item: ItemDTO): string {
  return item.title?.trim() || item.resource?.title || "Exam";
}
