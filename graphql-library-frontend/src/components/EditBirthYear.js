import { useState } from "react";
import { useMutation } from "@apollo/client";

import { ALL_AUTHORS, EDIT_BIRTH_YEAR } from "../graphql/queries";

const EditBirthYear = () => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const [editBirthYear] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    editBirthYear({
      variables: { name, year: parseInt(born) },
    });

    setName("");
    setBorn("");
  };

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
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
