var express = require('express');
var router = express.Router();
let { categories, data } = require('../utils/data')
let slugify = require('slugify')
let { IncrementalId } = require('../utils/IncrementalIdHandler')

// GET all categories with name query filter
router.get('/', function (req, res, next) {
  let nameQ = req.query.name ? req.query.name : '';
  let result = categories.filter(function (e) {
    return e.name.toLowerCase().includes(nameQ.toLowerCase())
  })
  res.send(result);
});

// GET category by slug
router.get('/slug/:slug', function (req, res, next) {
  let slug = req.params.slug;
  let result = categories.find(
    function (e) {
      return e.slug == slug;
    }
  )
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "SLUG NOT FOUND"
    })
  }
});

// GET category by ID
router.get('/:id', function (req, res, next) {
  let result = categories.find(
    function (e) {
      return e.id == req.params.id
    }
  );
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
});

// GET all products by category ID
router.get('/:id/products', function (req, res, next) {
  let categoryId = parseInt(req.params.id);
  let result = data.filter(function (e) {
    return (!e.isDeleted) && e.category.id == categoryId
  })
  if (result.length > 0) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "NO PRODUCTS FOUND FOR THIS CATEGORY"
    })
  }
});

// POST create new category
router.post('/', function (req, res, next) {
  const { name, image } = req.body;
  
  if (!name || !image) {
    return res.status(400).send({
      message: "Name and image are required"
    })
  }

  const newId = IncrementalId(categories);
  const newCategory = {
    id: newId,
    name: name,
    slug: slugify(name, { lower: true }),
    image: image,
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  categories.push(newCategory);
  res.status(201).send(newCategory);
});

// PUT update category
router.put('/:id', function (req, res, next) {
  let categoryId = parseInt(req.params.id);
  let categoryIndex = categories.findIndex(function (e) {
    return e.id == categoryId
  });

  if (categoryIndex === -1) {
    return res.status(404).send({
      message: "CATEGORY NOT FOUND"
    })
  }

  const { name, image } = req.body;
  
  if (name) {
    categories[categoryIndex].name = name;
    categories[categoryIndex].slug = slugify(name, { lower: true });
  }
  
  if (image) {
    categories[categoryIndex].image = image;
  }
  
  categories[categoryIndex].updatedAt = new Date().toISOString();

  res.status(200).send(categories[categoryIndex]);
});

// DELETE category
router.delete('/:id', function (req, res, next) {
  let categoryId = parseInt(req.params.id);
  let categoryIndex = categories.findIndex(function (e) {
    return e.id == categoryId
  });

  if (categoryIndex === -1) {
    return res.status(404).send({
      message: "CATEGORY NOT FOUND"
    })
  }

  const deletedCategory = categories.splice(categoryIndex, 1);
  
  res.status(200).send({
    message: "CATEGORY DELETED SUCCESSFULLY",
    category: deletedCategory[0]
  });
});

module.exports = router;
