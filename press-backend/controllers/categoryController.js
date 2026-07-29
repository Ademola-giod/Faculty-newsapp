import Category from "../models/category.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json(categories);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};