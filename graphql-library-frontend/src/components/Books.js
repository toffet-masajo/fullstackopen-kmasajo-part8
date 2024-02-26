import { useQuery } from "@apollo/client";
import { useState, useEffect } from "react";

import { ALL_BOOKS } from "../graphql/queries";

const Books = (props) => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filter, setFilter] = useState(null);
  const result = useQuery(ALL_BOOKS, { variables: { genre: filter } });

  useEffect(() => {
    if (result.data) {
      const booksDb = result.data.allBooks;

      if (!filter) {
        const genresList = books.reduce((accumulator, book) => {
          book.genres.forEach((genre) => {
            if (!accumulator.includes(genre)) accumulator.push(genre);
          });
          return accumulator;
        }, []);
        genresList.push("all genres");
        setGenres(genresList);
      }

      setBooks(booksDb);
    }
  }, [result.data, books, filter]);

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

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
          {books.map((book) => {
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
        {genres.map((genre, idx) => (
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
