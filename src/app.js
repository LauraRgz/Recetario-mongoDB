import { MongoClient, ObjectID } from "mongodb";
import { GraphQLServer } from "graphql-yoga";

import "babel-polyfill";
import { rejects } from "assert";
import { json } from "express";

const usr = "Laura";
const pwd = "Pabl11";
const url = "cluster0-eqbhg.gcp.mongodb.net/test?retryWrites=true&w=majority";

/**
 * Connects to MongoDB Server and returns connected client
 * @param {string} usr MongoDB Server user
 * @param {string} pwd MongoDB Server pwd
 * @param {string} url MongoDB Server url
 */

/*Me comecto a la base de datos y devuelve una promesa (por ser asíncrona). 
Cuando la romesa se resuelve, tiene el cliente*/
const connectToDb = async function(usr, pwd, url) {
  const uri = `mongodb+srv://${usr}:${pwd}@${url}`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await client.connect(); //Cuando se resuelva el connect, hago lo que viene después
  return client;
};

const runGraphQLServer = function(context) { //Ejecuta el servidor GraphQL
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
        getAuthor(id: ID!): Author 
        getAuthors: [Author] 
        getRecipe(id: ID!): Recipe
        getRecipes: [Recipe]
        getIngredient(id: ID!): Ingredient
        getIngredients: [Ingredient]
    }
    type Mutation{
        addRecipe(title: String!, description: String!, author: ID!, ingredients: [ID]!): Recipe!
        addAuthor(name: String!, email: String!): Author!
        addIngredient(name: String!): Ingredient!
        removeRecipe(id: ID!): String!
        removeAuthor(id: ID!): String!
        removeIngredient(id: ID!): String!
        updateAuthor(id: ID!, name: String, email: String): String!
        updateIngredient(id: ID!, name: String!): String!
        updateRecipe(id: ID!, title: String, description: String, ingredients: [ID!] ): String!
    }
      `;

  const resolvers = {
    Query: {
      //AUTHOR
      getAuthor: async (parent, args, ctx, info) => {
        const { id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("authors");
        const result = await collection.findOne({ _id: ObjectID(id) });
        return result;
      }, 

      getAuthors: async (parent, args, ctx, info) => {
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("authors");
        const result = await collection.find({}).toArray();
        return result;
      },

      //RECIPE
      getRecipe: async (parent, args, ctx, info) => {
        const { id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("recipes");
        const result = await collection.findOne({ _id: ObjectID(id) });
        return result;
      },
      getRecipes: async (parent, args, ctx, info) => {
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("recipes");
        const result = await collection.find({}).toArray();
        return result;
      },

      //INGREDIENT
      getIngredient: async (parent, args, ctx, info) => {
        const { id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("ingredients");
        const result = await collection.findOne({ _id: ObjectID(id) });
        return result;
      },
      getIngredients: async (parent, args, ctx, info) => {
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("ingredients");
        const result = await collection.find({}).toArray();
        return result;
      }
    },

    Recipe: {
      author: async (parent, args, ctx, info) => {
        const authorID = ObjectID(parent.author);
        const { client } = ctx;
        const db = client.db("recipe-book");
        let collection = db.collection("authors");
        let result = await collection.findOne({ _id: authorID });
        return result;
      },

      ingredients: async (parent, args, ctx, info) => {
        const { client } = ctx;
        const db = client.db("recipe-book");
        let collection = db.collection("ingredients");
        const ingredientsArray = parent.ingredients.map(obj => ObjectID(obj));

        const result = await collection
          .find({ _id: { $in: ingredientsArray } })
          .toArray();
        return result;
      },

      id: (parent, args, ctx, info) => {
        const result = parent._id;
        return result;
      }
    },

    Author: {
      recipes: async (parent, args, ctx, info) => {
        const authorID = ObjectID(parent._id);
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("recipes");
        const result = await collection.find({ author: authorID }).toArray();
        return result;
      },

      id: (parent, args, ctx, info) => {
        const result = parent._id;
        return result;
      }
    },

    Ingredient: {
      recipes: async (parent, args, ctx, info) => {
        const ingredientID = parent._id;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("recipes");
        const result = await collection
          .find({ ingredients: ingredientID })
          .toArray();
        return result;
      },

      id: (parent, args, ctx, info) => {
        const result = parent._id;
        return result;
      }
    },

    Mutation: {
      addAuthor: async (parent, args, ctx, info) => {
        const { name, email } = args;
        const { client } = ctx;

        const db = client.db("recipe-book");
        const collection = db.collection("authors");
        const result = await collection.insertOne({ name, email });
        const recipes = [];
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
        const recipes = [];
        return {
          name,
          recipes,
          id: result.ops[0]._id
        };
      },

      addRecipe: async (parent, args, ctx, info) => {
        const { title, description, author, ingredients } = args;
        const date = new Date().getDate();
        const { client } = ctx;

        const db = client.db("recipe-book");
        const collection = db.collection("recipes");
        const result = await collection.insertOne({
          title,
          description,
          author: ObjectID(author),
          ingredients: ingredients.map(obj => ObjectID(obj)),
          date
        });

        return {
          id: result.ops[0]._id,
          title,
          description,
          author,
          ingredients,
          date
        };
      },

      removeAuthor: async (parent, args, ctx, info) => {
        const { id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collectionAuthor = db.collection("authors");
        const collectionRecipe = db.collection("recipes");

        const deleteRecipe = () => {
          return new Promise((resolve, reject) => {
            const result = collectionRecipe.deleteMany({
              author: ObjectID(id)
            });
            resolve(result);
          });
        };

        const deleteAuthor = () => {
          return new Promise((resolve, reject) => {
            const result = collectionAuthor.deleteOne({ _id: ObjectID(id) });
            resolve(result);
          });
        };
        (async function() {
          const asyncFunctions = [deleteRecipe(), deleteAuthor()];
          const result = await Promise.all(asyncFunctions);
        })();
        return "Author deleted";
      },

      removeIngredient: async (parent, args, ctx, info) => {
        const { id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collectionIngredient = db.collection("ingredients");
        const collectionRecipe = db.collection("recipes");

        const deleteRecipe = () => {
          return new Promise((resolve, reject) => {
            const result = collectionRecipe.deleteMany({
              ingredients: ObjectID(id)
            });
            resolve(result);
          });
        };
        const deleteIngredient = () => {
          return new Promise((resolve, reject) => {
            const result = collectionIngredient.deleteOne({
              _id: ObjectID(id)
            });
            resolve(result);
          });
        };
        (async function() {
          const asyncFunctions = [deleteRecipe(), deleteIngredient()];
          const result = await Promise.all(asyncFunctions);
        })();

        return "Ingredient deleted";
      },
      removeRecipe: async (parent, args, ctx, info) => {
        const { id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("recipes");

        await collection.deleteOne({ _id: ObjectID(id) });
        return "Recipe deleted";
      },

      updateAuthor: async (parent, args, ctx, info) => {
        const { id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("authors");

        let jsonUpdate;

        if (args.name) {
          jsonUpdate = {
            name: args.name,
            ...jsonUpdate
          };
        }

        if (args.email) {
          jsonUpdate = {
            email: args.email,
            ...jsonUpdate
          };
        }
        const result = await collection.updateOne(
          { _id: ObjectID(id) },
          { $set: jsonUpdate }
        );
        if (result.modifiedCount > 0) return "Author updated";
        return "Failed to update author";
      },

      updateIngredient: async (parent, args, ctx, info) => {
        const { id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("ingredients");

        await collection.updateOne(
          { _id: ObjectID(id) },
          { $set: { name: args.name } }
        );
        return "Ingredient updated";
      },

      updateRecipe: async (parent, args, ctx, info) => {
        const { id } = args;
        const { client } = ctx;
        const db = client.db("recipe-book");
        const collection = db.collection("recipes");

        let jsonUpdate;

        if (args.title) {
          jsonUpdate = {
            title: args.title,
            ...jsonUpdate
          };
        }

        if (args.description) {
          jsonUpdate = {
            description: args.description,
            ...jsonUpdate
          };
        }

        if (args.ingredients) {
          jsonUpdate = {
            ingredients: args.ingredients.map(obj => ObjectID(obj)),
            ...jsonUpdate
          };
        }
        console.log(jsonUpdate);
        const result = await collection.updateOne(
          { _id: ObjectID(id) },
          { $set: jsonUpdate }
        );
        if (result.modifiedCount > 0) return "Recipe updated";
        return "Failed to update recipe";
      }
    }
  };

  const server = new GraphQLServer({ typeDefs, resolvers, context }); //Pasamos el contexto para que el servidor del graphql acceda al cliente
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
