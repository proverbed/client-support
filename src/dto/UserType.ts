export type UserType = {
  displayName?: string;
  photoURL?: string;
  email?: string;
  uid?: string;
};

export type QuizDescriptionProps = {
  id: string;
  name: string;
  description: string;
};

export type CollectionQuizDescription = {
  name: string;
  description: string;
};

export type QuizModel = {
  question: string;
  answer: { answer: string; correct: boolean }[];
};

export interface Answer {
  answer: string;
  correct: boolean;
}

export interface Quiz {
  question: string;
  explanation?: {
    description: string;
    resourceLink?: string;
  };
  answer: Answer[];
}
