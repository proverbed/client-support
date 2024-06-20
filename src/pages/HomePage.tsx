import { UserAuth } from "../AuthContext";

function HomePage() {
  const { user } = UserAuth();

  return (
    <>
      <h1>Home page</h1>

      <p>{user?.displayName} </p>
    </>
  );
}

export default HomePage;
