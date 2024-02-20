const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");
const { mongoose } = require("mongoose");

const Author = require("./models/Author");
const Book = require("./models/Book");

require("dotenv").config();
mongoose.set("strictQuery", false);

const MONGODB_URL = process.env.MONGODB_URL;

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
 */

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

console.log("connecting to", MONGODB_URL);

mongoose
  .connect(MONGODB_URL)
  .then(async () => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Query {
    allBooks(
      author: String
      genre: String
    ): [Book!]!
    bookCount: Int!

    allAuthors: [Author!]!
    authorCount: Int!
  }

  type Mutation {
    addBook (
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book

    editAuthor (
      name: String!
      setBornTo: Int!
    ): Author
  }
`;

const resolvers = {
  Author: {
    bookCount: async (root) => (await Book.find({ author: root._id })).length,
  },

  Book: {
    author: async (root) => await Author.findOne({ _id: root.author }),
  },

  Query: {
    allBooks: async (root, args) => {
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        return await Book.find({ author: author._id });
      }
      if (args.genre) {
        return await Book.find({ genres: args.genre });
      }
      return await Book.find({});
    },
    bookCount: async () => await Book.collection.countDocuments(),

    allAuthors: async () => await Author.find({}),
    authorCount: async () => await Author.collection.countDocuments(),
  },

  Mutation: {
    addBook: async (root, args) => {
      const { author } = args;
      const findAuthor = await Author.findOne({ name: author });
      if (!findAuthor) await Author({ name: author }).save();

      const newAuthor = await Author.findOne({ name: author });
      const newBook = await Book({ ...args, author: newAuthor._id }).save();
      return newBook;
    },

    editAuthor: async (root, args) => {
      const filter = { name: args.name };
      const update = { born: args.setBornTo };
      const options = { new: true };
      const modifiedAuthor = await Author.findOneAndUpdate(
        filter,
        update,
        options
      );
      return modifiedAuthor;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
