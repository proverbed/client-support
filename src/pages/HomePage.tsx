import { UserAuth } from '../store/AuthContext.tsx';

function HomePage() {
  const { googleSignIn, user } = UserAuth();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <h1>Trade Stats Tracker</h1>

      <p>
        This website, aims at tracking your trading activity. With the aim of
        making sure that you follow good and safe trading practices.
      </p>

      {user?.displayName ? null : (
        <button
          type="button"
          className="bg-blue-600 text-gray-200  p-2 rounded  hover:bg-blue-500 hover:text-gray-100"
          onClick={handleGoogleSignIn}
        >
          Sign in
        </button>
      )}
    </>
  );
}

export default HomePage;
