## Table of contents
* [Mutation Add recipe](#Add-Recipe)
* [Mutation Add author](#Add-Author)
* [Mutation Add ingredient](#Add-Ingredient)
* [Mutation Remove recipe](#Remove-Recipe)
* [Mutation Remove author](#Remove-Author)
* [Mutation Remove ingredient](#Remove-Ingredient)
* [Mutation Update recipe](#Update-Recipe)
* [Mutation Update author](#Update-Author)
* [Mutation Update ingredient](#Update-Ingredient)
* [Query Recipe](#Recipe)
* [Query Author](#Author)
* [Query Ingredient](#Ingredient)
* [Query Show recipes](#Show-Recipes)
* [Query Show authors](#Show-Authors)
* [Query Show ingredients](#Show-ingredients)

## Mutations
### Add Author
Authors are added introducing the name and email. The ID is generated by Mongo.
#### Example
```js
mutation{
  addAuthor(name: "Laura Rodríguez", email: "laura@yo.com"){
    name,
    email
  }
}
```

### Add Ingredient
You can add an ingredient by entering its name.
#### Example
```js
mutation{
  addIngredient(name: "Harina"){
    name
  }
}
```

### Add Recipe
To add a new recipe, you need to provide a title, description, author and the ingredients.
#### Example
```js
mutation{
  addRecipe(title: "Receta 1",
    				description: "Descripción Receta 1",
  					author: "5dd7e1901a79783094d978fe",
  					ingredients: ["5dd7e1cf1a79783094d97902"]){
    title,
    description,
    date,
    author{id, name, email, recipes{title}},
    ingredients{id, name, recipes{title}}
  }
}
```

### Remove Recipe
#### Example
```js
mutation{
  removeRecipe(id: "5dd7e3431a79783094d97909")
}
```

### Remove Author
#### Example
```js
mutation{
  removeAuthor(id: "5dd7e1901a79783094d978fe")
}
```

### Remove Ingredient
#### Example
```js
mutation{
  removeIngredient(id: "5dd7e1cf1a79783094d97902")
}
```

### Update Recipe
To update a recipe, you need to enter its ID and the new parameters(title, description or/and ingredients).
#### Example
```js
mutation{
  updateRecipe (id: "5dd7e3431a79783094d97909" ,
    						title: "Bread",
    						description: "Nueva descripción", 
    						ingredients: ["5dd7e1dc1a79783094d97904"]){
    title,
    description,
    date,
    author{id, name, email, recipes{title}},
    ingredients{id, name, recipes{title}}
  }
}
```

### Update Author
When you update an author's information, you need to provide its ID and the new parameters(name and email).
#### Example
```js
mutation{
  updateAuthor(id: "5dd7e1901a79783094d978fe", name: "Eustaquio"){
    id,
    name,
    email
  }
}
```

### Update Ingredient
To update a ingredient you need to enter the ID and the new name.
#### Example
```js
mutation{
  updateIngredient(id: "5dd7e1dc1a79783094d97904", name: "Tomate"){
    name,
    id
  }
}
```

## Queries
### Recipe
#### Example
```js
query{
  recipe(id: "5dd7e3431a79783094d97909"){
    id
    title
    description
    date
    author{name}
    ingredients{name}
  }
}
```

### Author
#### Example
```js
query{
  author(id: "5dd7e1901a79783094d978fe"){
  	id
    name
    email
  }
}
```

### Ingredient
#### Example
```js
query{
  ingredient(id: "5dd7e1dc1a79783094d97904"){
  	id
    name
  }
}
```

### Show Recipes
#### Example
```js
query{
  showRecipes{
    title
    id
    date
    description
    ingredients{name}
    author{name}
  }
}
```

### Show Authors
#### Example
```js
query{
  showAuthors{
    id
    name
    email
  }
}
```

### Show Ingredients

#### Example
```js
query{
  showIngredients{
  	id
    name
  }
}
```