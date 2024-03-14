const { ApolloServer } = require("@apollo/server");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { expressMiddleware } = require("@apollo/server/express4");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");

const cors = require("cors");
const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("./models/User");
const typeDefs = require("./schema");
const { booksDataLoader, resolvers } = require("./resolvers");

require("dotenv").config();
mongoose.set("strictQuery", false);

const MONGODB_URL = process.env.MONGODB_URL;

console.log("connecting to", MONGODB_URL);

mongoose
  .connect(MONGODB_URL)
  .then(async () => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith("Bearer ")) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.SECRET
          );
          const currentUser = await User.findById(decodedToken.id);
          return { currentUser, loaders: { booksLoader: booksDataLoader() } };
        }
      },
    })
  );

  const PORT = 4000;
  httpServer.listen(PORT, () =>
    console.log(`Server ready at http://localhost:${PORT}`)
  );
};

start();
