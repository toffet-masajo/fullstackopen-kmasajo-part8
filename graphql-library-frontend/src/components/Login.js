import { useMutation } from "@apollo/client";
import { useEffect } from "react";

import { LOGIN } from "../graphql/queries";

const Login = (props) => {
  const { setError, setPage, setToken } = props;
  const [userLogin, result] = useMutation(LOGIN, {
    onError: (err) => setError(err.graphQLErrors[0].message),
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      setPage("authors");
      localStorage.setItem("phonenumbers-user-token", token);
    }
  }, [result.data]);

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    userLogin({ variables: { username, password } });
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username <input name="username" />
        </div>
        <div>
          password <input name="password" type="password" />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default Login;
