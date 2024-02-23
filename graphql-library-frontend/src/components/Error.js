const Error = ({ message }) => {
  return message ? <div style={{ color: "red" }}>{message}</div> : null;
};

export default Error;
