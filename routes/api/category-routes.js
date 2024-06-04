const router = require("express").Router();
const { Category, Product, ProductTag } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const allCategories = await Category.findAll({
      include: [{ model: Product }],
    }).catch((err) => {
      res.json(err);
    });
    res.send(allCategories);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryById = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!categoryById) {
      res.status(404).json({ message: "No category found with this id" });
      return;
    }
    res.status(200).json(categoryById);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  // create a new category
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:id", async (req, res) => {
  // update a category by its `id` value
  try {
    const updateCategory = await Category.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updateCategory[0]) {
      res.status(404).json({ message: "No category with this id" });
      return;
    }
    res.status(200).json(updateCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  // delete a category by its `id` value
  try {
    const id = req.params.id;
    // Find the products that are within the Category
    const productsToDelete = await Product.findAll({
      where: { category_id: id },
    });
    if (productsToDelete.length > 0) {
      // Store the ids of the products to delete
      const productsIds = productsToDelete.map(product => product.id);
      await ProductTag.destroy({ where: { product_id: productsIds } });
      await Product.destroy({ where: { category_id: id } });
    }

    const deleteCategory = await Category.destroy({
      where: { id },
    });
    if (!deleteCategory) {
      res.status(404).json({ message: "No Category with this id" });
      return;
    }
    res.status(200).json({ message: "Category deleted succesfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
