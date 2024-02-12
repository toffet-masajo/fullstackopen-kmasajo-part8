import { useState } from "react";
import { useMutation } from "@apollo/client";

import { ALL_AUTHORS, EDIT_BIRTH_YEAR } from "../graphql/queries";

const EditBirthYear = ({ names }) => {
  const [name, setName] = useState(names[0]);
  const [born, setBorn] = useState("");

  const [editBirthYear] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    editBirthYear({
      variables: { name, year: parseInt(born) },
    });

    setBorn("");
  };

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          <select value={name} onChange={(e) => setName(e.target.value)}>
            {names.map((author, idx) => (
              <option key={idx} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default EditBirthYear;
