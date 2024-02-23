import { useState } from "react";
import { useApolloClient } from "@apollo/client";

import Authors from "./components/Authors";
import Books from "./components/Books";
import Error from "./components/Error";
import Login from "./components/Login";
import NewBook from "./components/NewBook";
import Recommendations from "./components/Recommendations";

const App = () => {
  const [error, setError] = useState(null);
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  const notify = (message) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 10000);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    setPage("authors");
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommend")}>recommend</button>
            <button onClick={handleLogout}>logout</button>
          </>
        )}
        {!token && <button onClick={() => setPage("login")}>login</button>}
      </div>

      <Error message={error} />
      <Authors show={page === "authors"} setError={notify} />
      <Books show={page === "books"} />
      <NewBook show={page === "add"} setError={notify} setPage={setPage} />
      <Recommendations show={page === "recommend"} />
      <Login
        show={page === "login"}
        setError={notify}
        setPage={setPage}
        setToken={setToken}
      />
    </div>
  );
};

export default App;
