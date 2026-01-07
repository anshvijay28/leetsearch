export type Question = {
  id: number;
  qid: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  url: string;
  is_premium: boolean;
};

