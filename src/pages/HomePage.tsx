import { useEffect, useState } from "react";
import { QuizDescriptionProps } from "../dto/UserType.ts";
import { getAllQuiz } from "../services/quiz.service.ts";
import { Link } from "react-router-dom";

function HomePage() {
  const [data, setData] = useState<QuizDescriptionProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getQuizData = async () => {
    try {
      const allQuizQuerySnapshot = await getAllQuiz();
      const quizDetails: QuizDescriptionProps[] = allQuizQuerySnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        }),
      );
      setData(quizDetails);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getQuizData();
  }, []);

  if (loading) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <>
      <h1>Home page</h1>

      <div className="container mx-auto">
        {data &&
          data.map((quizDetails) => (
            <ul key={quizDetails.id}>
              <div>
                <div className="flex items-center justify-center flex-col md:m-4 m-2">
                  <div className="rounded-md md:w-128 lg:w-144 w-full bg-gray-50 p-4 border">
                    <div>
                      <h1 className="md:text-3xl text-2xl pb-2">
                        {quizDetails.name}
                      </h1>
                      <p className="md:pb-4 pb-2">{quizDetails.description}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <h1 className="md:text-3xl text-2xl py-4">
                        Are you ready?
                      </h1>
                      <div className="font-light">
                        {'x'} questions to answer
                      </div>
                      <div>
                        <Link to={`/quiz/${quizDetails.id}`}>
                          <button
                            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 mt-4"
                            type="button"
                          >
                            <div>Start the quiz</div>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ul>
          ))}
      </div>

    </>
  );
}

export default HomePage;
