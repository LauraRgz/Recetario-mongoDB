import { MongoClient, ObjectID} from "mongodb";
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
        ingredients: [Ingredient]!
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
        getRecipe(id: ID!): Recipe
        getAuthor(id: ID!): Author
        ingredient(id: ID!): Ingredient
        showRecipes: [Recipe]
        getAuthors: [Author]
        showIngredients: [Ingredient]

    }
    type Mutation{
        addRecipe(title: String!, description: String!, author: ID!, ingredients: [ID]!): Recipe!
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
        getAuthor: async (parent, args, ctx, info) => {
            const { id } = args;
            const { client } = ctx;
            const db = client.db("recipe-book");
            const collection = db.collection("authors");
            const result = await collection.findOne({_id: ObjectID(id)});
            return result;
        },

        getAuthors: async (parent, args, ctx, info) => {
          const { client } = ctx;
          const db = client.db("recipe-book");
          const collection = db.collection("authors");
          const result = await collection.find({}).toArray();
          return result;
        },

        getRecipe: async (parent, args, ctx, info) => {
          const { id } = args;
          const { client } = ctx;
          const db = client.db("recipe-book");
          const collection = db.collection("recipes");
          const result = await collection.findOne({_id: ObjectID(id)});
          return result;
        },
    },

    Recipe: {
        author: async (parent, args, ctx, info) => {
            const authorID = ObjectID(parent.author);
            const { client } = ctx;
            const db = client.db("recipe-book");
            let collection = db.collection("authors");
            let result = await collection.findOne({_id: ObjectID(authorID)});

            return result;
        },
        ingredients: async (parent, args, ctx, info) => {
          const { client } = ctx;
          const db = client.db("recipe-book");
          let collection = db.collection("ingredients");

          const result = parent.ingredients.map(element => {
            const ingredientInfo = collection.findOne({_id: element});
            console.log(ingredientInfo);
            return ingredientInfo;
          });
          console.log(result);
          return result;

          // const result = parent.ingredients.map(async elem =>{
          //   const ingredientInfo = await collection.findOne({_id: ObjectID(elem.id)});
          //   console.log(ingredientInfo);
          //   return ingredientInfo;
          // });

          console.log(result);
          return result;        
        },
    },

    Author: {
      recipes:  async (parent, args, ctx, info) => {
        const recipeID = ObjectID(parent.id);
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("recipes");
        const result = await collection.find({_id: recipeID}).toArray();
        return result;
      },
    },

    Mutation: {
      addAuthor: async (parent, args, ctx, info) => {
        const { name, email } = args;
        const { client } = ctx;

        const db = client.db("recipe-book");
        const collection = db.collection("authors");
        const result = await collection.insertOne({ name, email });
        const recipes =  [];
        return {
          name,
          email,
          recipes,
          id: result.ops[0]._id
        };
      },

      addIngredient: async (parent, args, ctx, info) => {
        const { name } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("ingredients");
        const result = await collection.insertOne({ name });
        const recipes =  [];
        return {
          name,
          recipes,
          id: result.ops[0]._id
        };
      },

      removeAuthor: async (parent, args, ctx, info) => {
        const {id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("authors");
        const result = await collection.deleteOne({ _id: ObjectID(id)});
        return "ok";
      },

      removeIngredient: async (parent, args, ctx, info) => {
        const {id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("ingredients");
        const result = await collection.deleteOne({ _id: ObjectID(id)});
        return "ok";
      },
      removeRecipe: async (parent, args, ctx, info) => {},

      addRecipe: async (parent, args, ctx, info) => {
        const { title, description, author, ingredients } = args;
        const date = new Date().getDate();
        const { client } = ctx;
        
        const db = client.db("recipe-book");
        const collection = db.collection("recipes");
        const result = await collection.insertOne({ title, description, author, ingredients, date });
        
        return {
          id: result.ops[0]._id,
          title,
          description,
          author,
          ingredients,
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
