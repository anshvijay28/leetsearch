import { Question } from "../../types";

export type ListProblem = {
  id: string;
  list_id: string;
  problem_qid: number;
  position: number;
  added_at: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  is_premium: boolean;
};

export type ListDetailViewProps = {
  listId: string;
  listName: string;
  listDescription?: string;
  onDeleteList: () => void;
};

export type ProblemPillProps = {
  qid: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isPremium: boolean;
  isInList?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  onFindSimilar?: () => void;
};

