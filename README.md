#  :notebook: Recetario-mongoDB  

##  :memo: Table of contents

- [Introduction](#Introduction)
- [Setup](#Setup)
- [Features](#features)
- [Built with](#Built-with)
- [License](#License)

## :fork_and_knife: Introduction

Recetario-mongoDB is a Node-JS app developed to manage recipes. It is possible to create authors, ingredients and recipes, as well as edit and delete them.

## :gear: Setup

1. Install NPM packages

```
npm install
```

2. Start the app

```
npm start
```

You can access the app at  ```127.0.0.1:4000```

##   :sparkles: Features

### Mutations

- addRecipe
- addAuthor
- addIngredient
- removeRecipe
- removeAuthor
- removeIngredient
- updateAuthor
- updateIngredient
- updateRecipe

### Queries

- getAuthor
- getAuthors
- getRecipe
- getRecipes
- getIngredient
- getIngredients

The usage tempates can be found [here](./queriesTemplates.md) .

## :wrench: Built with

- [graphql-yoga](https://www.npmjs.com/package/graphql-yoga)
- [Mongo DB](https://www.mongodb.com/cloud/atlas)

## :page_facing_up: License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/LauraRgz/Recetario/blob/master/LICENSE.md) file for details

**[Back to top](#Table-of-contents)**
