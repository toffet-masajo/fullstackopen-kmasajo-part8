const DataLoader = require("dataloader");
const { GraphQLError } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const jwt = require("jsonwebtoken");
const { groupBy, map } = require("ramda");

const pubsub = new PubSub();

const Author = require("./models/Author");
const Book = require("./models/Book");
const User = require("./models/User");

const booksDataLoader = () => {
  return new DataLoader(async (authorIds) => {
    const books = await Book.find({
      author: { $in: authorIds },
    });
    const groupByAuthor = groupBy((book) => book.author, books);
    return map((bookId) => groupByAuthor[bookId], authorIds);
  });
};

const resolvers = {
  Author: {
    bookCount: async (root, args, ctx) => {
      const books = await ctx.loaders.booksLoader.load(root._id.toString());
      return books.length;
    },
  },

  Book: {
    author: async (root) => await Author.findOne({ _id: root.author }),
  },

  Query: {
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author });
        if (!author) return [];
        const books = await Book.find({ author: author._id });
        return books.filter((book) => book.genres.includes(args.genre));
      }
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

    me: (root, args, context) => context.currentUser,
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const { currentUser } = context;
      if (!currentUser)
        throw new GraphQLError("Unauthorized access", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      const { author } = args;
      try {
        const findAuthor = await Author.findOne({ name: author });
        if (!findAuthor) await Author({ name: author }).save();
      } catch (error) {
        throw new GraphQLError("Adding a new author failed!", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.author,
            error,
          },
        });
      }
      const newAuthor = await Author.findOne({ name: author });
      const newBook = new Book({ ...args, author: newAuthor });
      try {
        await newBook.save();
      } catch (error) {
        throw new GraphQLError("Adding a new book failed!", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
            error,
          },
        });
      }

      pubsub.publish("BOOK_ADDED", { bookAdded: newBook });

      return newBook;
    },

    editAuthor: async (root, args, context) => {
      const { currentUser } = context;
      if (!currentUser)
        throw new GraphQLError("Unauthorized access", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
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

    createUser: async (root, args) => {
      const user = new User({ ...args });
      return await user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(userForToken, process.env.SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = { resolvers, booksDataLoader };
