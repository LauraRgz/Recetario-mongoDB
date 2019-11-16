import { MongoClient } from "mongodb";
import { GraphQLServer } from "graphql-yoga";

import "babel-polyfill";

const usr = "Laura";
const pwd = "Pabl11";
const url = "cluster0-eqbhg.gcp.mongodb.net/test?retryWrites=true&w=majority";

/**
 * Connects to MongoDB Server and returns connected client
 * @param {string} usr MongoDB Server user
 * @param {string} pwd MongoDB Server pwd
 * @param {string} url MongoDB Server url
 */

const connectToDb = async function(usr, pwd, url) {
  const uri = `mongodb+srv://${usr}:${pwd}@${url}`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await client.connect();
  return client;
};

const runGraphQLServer = function(context) {
  const typeDefs = `
    type Recipe{
        id: ID!
        title: String!
        description: String!
        date: String!
        author: Author!
        
    }
    type Author{
        id: ID!
        name: String!
        email: String!
        recipes: [Recipe]
    }
    type Ingredient{
        id: ID!
        name: String!
        recipes: [Recipe]
    }
    type Query{
        recipe(id: ID!): Recipe
        author(id: ID!): Author
        ingredient(id: ID!): Ingredient
        showRecipes: [Recipe]
        showAuthors: [Author]
        showIngredients: [Ingredient]

    }
    type Mutation{
        addRecipe(title: String!, description: String!, author: ID!): Recipe!
        addAuthor(name: String!, email: String!): Author!
        addIngredient(name: String!): Ingredient!
        removeRecipe(id: ID!): String!
        removeAuthor(id: ID!): String!
        removeIngredient(id: ID!): String!
        updateAuthor(id: ID!, name: String, email: String): Author!
        updateIngredient(id: ID!, name: String!): Ingredient!
        updateRecipe(id: ID!, title: String, description: String, ingredients: [ID] ): Recipe!
    }
      `;

  const resolvers = {
    Query: {
        // author: async (parent, args, ctx, info) => {
        //     // const authorID = args;
        //     // const { client } = ctx;
        //     // const db = client.db("recipe-book");
        //     // const collection = db.collection("authors");
        //     // const result = await collection.findOne(author, {id: authorID});
        //     // console.log(result);
        //     // return result;
        // }
    },

    Recipe: {
        author: async (parent, args, ctx, info) => {
            const authorID = parent.author;
            const { client } = ctx;
            const db = client.db("recipe-book");
            let collection = db.collection("authors");
            let query = {_id: authorID};

            let result = await collection.findOne(query);
            console.log(result);
            return result;
        },
        // ingredients: async (parent, args, ctx, info) => {
        //     const authorID = parent.ingredients;
        //     const { client } = ctx;
        //     const db = client.db("recipe-book");
        //     let collection = db.collection("authors");
        //     let query = {id: authorID};

        //     let result = await collection.findOne(query);
        //     console.log(result);
        //     return result;
        // },
    },

    Mutation: {
      addAuthor: async (parent, args, ctx, info) => {
        const { name, email } = args;
        const { client } = ctx;

        const db = client.db("recipe-book");
        const collection = db.collection("authors");
        const result = await collection.insertOne({ name, email });

        return {
          name,
          email,
          id: result.ops[0]._id
        };
      },
      addIngredient: async (parent, args, ctx, info) => {
        const { name } = args;
        const { client } = ctx;
        
        const db = client.db("recipe-book");
        const collection = db.collection("ingredients");
        const result = await collection.insertOne({ name });

        return {
          name,
          id: result.ops[0]._id
        };
      },

      removeAuthor: async (parent, args, ctx, info) => {
        const {id } = args;
        const { client } = ctx;

        const db = client.db("recipe-book");
        const collection = db.collection("authors");
        const result = await collection.deleteOne({ _id: id });
        return "ok";
      },

      removeIngredient: async (parent, args, ctx, info) => {},
      removeRecipe: async (parent, args, ctx, info) => {},

      addRecipe: async (parent, args, ctx, info) => {
        const { title, description, author} = args;
        const date = new Date().getDate();
        const { client } = ctx;
        
        const db = client.db("recipe-book");
        const collection = db.collection("recipes");
        const result = await collection.insertOne({ title, description, author, date });
        

        return {
          id: result.ops[0]._id,
          title,
          description,
          author,
          
          date
        };

      }
    }
  };

  const server = new GraphQLServer({ typeDefs, resolvers, context });
  const options = {
    port: 4000
  };

  try {
    server.start(options, ({ port }) =>
      console.log(
        `Server started, listening on port ${port} for incoming requests.`
      )
    );
  } catch (e) {
    console.info(e);
  }
};

const runApp = async function() {
  const client = await connectToDb(usr, pwd, url);
  console.log("Connect to Mongo DB");

  runGraphQLServer({ client });
};

runApp();
