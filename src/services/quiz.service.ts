import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../config/Firebase.ts";
import {
  CollectionQuizDescription,
  Quiz,
  QuizDescriptionProps,
} from "../dto/UserType.ts";

const COLLECTION = "quiz";

const converter = {
  toFirestore: (data: QuizDescriptionProps) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    snap.data() as CollectionQuizDescription,
};

export const getAllQuiz = () => {
  const q = query(collection(db, COLLECTION)).withConverter(converter);
  return getDocs(q);
};

export const getQuizById = (id: string) => {
  const docRef = doc(db, COLLECTION, id).withConverter(converter);
  return getDoc(docRef);
};

export const getQuizDataById = (id: string) => {
  const q = query(
    collection(db, COLLECTION + "/" + id + "/quiz"),
  ).withConverter({
    toFirestore: (data: Quiz) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as Quiz,
  });
  return getDocs(q);
};
