export type RumorItem = {
  id: string;
  title: string;
  content: string;
  source: string;
  location: string;
  truthfulness: "True" | "False" | "Partially True" | "Unknown";
  category: string;
};

export type QuestItem = {
  id: string;
  title: string;
  description: string;
  questGiver: string;
  location: string;
  objective: string;
  complication: string;
  reward: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
};