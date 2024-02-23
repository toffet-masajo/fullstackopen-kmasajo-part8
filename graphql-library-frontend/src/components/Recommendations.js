import { useQuery } from "@apollo/client";

import { ALL_BOOKS, ME } from "../graphql/queries";

const Recommendations = (props) => {
  const userQuery = useQuery(ME);
  const booksQuery = useQuery(ALL_BOOKS);

  if (!props.show) {
    return null;
  }

  if (userQuery.loading || booksQuery.loading) {
    return <div>loading...</div>;
  }

  const user = userQuery.data.me;
  const books = booksQuery.data.allBooks;

  return (
    <div>
      <h2>recommendations</h2>
      books in your favorite genre <strong>{user.favoriteGenre}</strong>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books
            .filter((book) => book.genres.includes(user.favoriteGenre))
            .map((book) => (
              <tr key={book.title}>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>{book.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
