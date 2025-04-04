import { tagMap, statusMap } from "./constants";

interface AIPerformance {
  id: string | number;
  aiName: string;
  aiSolution: string;
  aiAnswer: string;
  isCorrect: boolean;
  comment?: string | null;
  tag: "SUBMITTED" | "EVALUATION";
  aiScore?: number | null;
  unlistedAiName?: string | null;
  createdAt: Date;
}

interface ProblemVariable {
  id: number;
  name: string;
  lowerBound: number;
  upperBound: number;
}

interface ProblemData {
  id: number;
  userId: string;
  title: string;
  tag: keyof typeof tagMap;
  description: string;
  note: string;
  source?: string | null;
  content: string;
  translatedContent?: string;
  variables: ProblemVariable[];
  solution: string;
  translatedSolution?: string;
  answer: string;
  aiPerformances: AIPerformance[];
  status: keyof typeof statusMap;
  score?: number | null;
  remark?: string | null;
  nominated?: string | null;
  offererEmail?: string | null;
  createdAt: Date;
  updatedAt: Date;
  translators: {
    id: number;
    name: string;
    username: string;
    realname: string;
    email: string;
  };
  user: {
    name?: string | null;
    username?: string | null;
    realname?: string | null;
    email: string;
  };
  offer?: {
    email: string;
  } | null;
  scoreEvents: {
    tag: string;
    userId: string;
    problemScore: number;
    problemRemark: string;
    problemStatus: string;
    problemNominated: string;
  }[];
}

export interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  realname: string;
  username: string;
}

interface ExaminerInfo {
  examinerNo: number;
  examinerAssignedStatus: string | null;
  examinerAssignedScore: number | null;
  examinerRemark: string | null;
  examinerNominated: string | null;
}

export type { AIPerformance, ProblemVariable, ProblemData, ExaminerInfo };
