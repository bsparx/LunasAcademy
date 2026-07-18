import learningData from "./learning-content.json";

export type McqOption = string;

export type McqQuestion = {
  id: string;
  kind: "mcq";
  prompt: string;
  options: McqOption[];
  correctIndex: number;
  explanation: string;
};

export type MatchQuestion = {
  id: string;
  kind: "match";
  prompt: string;
  left: string[];
  right: string[];
  correct: Record<string, string>;
};

export type PracticeQuestion = McqQuestion | MatchQuestion;

export type KnowledgeCheck = {
  triggerAt: number;
  triggerLabel: string;
  prompt: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hints: string[];
};

export type PracticeLesson = {
  title: string;
  subtitle: string;
  questions: PracticeQuestion[];
};

export type MasteryCheck = {
  title: string;
  passThreshold: number;
  questions: PracticeQuestion[];
};

export type Capstone = {
  badge: string;
  title: string;
  description: string;
  deliverables: string[];
  rubric: string[];
  reviewNote: string;
};

export type ReviewCard = {
  id: string;
  courseId: string;
  courseTitle: string;
  front: string;
  back: string;
};

const data = learningData as {
  knowledgeChecks: Record<string, KnowledgeCheck>;
  practice: Record<string, PracticeLesson>;
  mastery: Record<string, MasteryCheck>;
  capstones: Record<string, Capstone>;
  reviewCards: ReviewCard[];
};

export function getKnowledgeCheck(lessonId: string): KnowledgeCheck | undefined {
  return data.knowledgeChecks[lessonId];
}

export function getPracticeLesson(lessonId: string): PracticeLesson | undefined {
  return data.practice[lessonId];
}

export function getMasteryCheck(lessonId: string): MasteryCheck | undefined {
  return data.mastery[lessonId];
}

export function getCapstone(courseId: string): Capstone | undefined {
  return data.capstones[courseId];
}

export function getReviewCards(): ReviewCard[] {
  return data.reviewCards;
}
