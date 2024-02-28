import { useQuery } from "@apollo/client";
import { useState } from "react";

import { ALL_BOOKS, ALL_BOOKS_BY_GENRE } from "../graphql/queries";

const Books = (props) => {
  const [filter, setFilter] = useState(null);
  const allBooksQuery = useQuery(ALL_BOOKS);
  const filteredBooksQuery = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre: filter },
  });

  if (!props.show) {
    return null;
  }

  if (allBooksQuery.loading || filteredBooksQuery.loading) {
    return <div>loading...</div>;
  }

  const allBooks = allBooksQuery.data.allBooks;
  const filteredBooks = filteredBooksQuery.data.allBooks;
  const genresList = [];

  allBooks.map((book) => {
    book.genres.forEach((genre) => {
      if (!genresList.includes(genre)) genresList.push(genre);
    });
    return book;
  });
  genresList.push("all genres");

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((book) => {
            return (
              <tr key={book.title}>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>{book.published}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        {genresList.map((genre, idx) => (
          <button
            key={idx}
            onClick={() => setFilter(genre === "all genres" ? null : genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Books;
