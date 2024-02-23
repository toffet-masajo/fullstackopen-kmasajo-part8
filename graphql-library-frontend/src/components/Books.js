import { useQuery } from "@apollo/client";
import { useState } from "react";

import { ALL_BOOKS } from "../graphql/queries";

const Books = (props) => {
  const [filter, setFilter] = useState("all genres");
  const result = useQuery(ALL_BOOKS);

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const books = result.data.allBooks;
  const genres = books.reduce(
    (accumulator, { genres }) => {
      genres.forEach((genre) => {
        if (!accumulator.includes(genre)) accumulator.push(genre);
      });
      return accumulator;
    },
    ["all genres"]
  );

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
            if (filter === "all genres" || book.genres.includes(filter))
              return (
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                </tr>
              );
            return null;
          })}
        </tbody>
        <div>
          {genres.map((genre, idx) => (
            <button key={idx} onClick={() => setFilter(genre)}>
              {genre}
            </button>
          ))}
        </div>
      </table>
    </div>
  );
};

export default Books;
