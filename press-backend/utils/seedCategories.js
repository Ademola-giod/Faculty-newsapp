import Category from "../models/Category.js";
import { DEFAULT_CATEGORIES } from "../utils/defaultCategory.js";

const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();

    if (count > 0) {
      console.log(" Categories already exist");
      return;
    }

    const categories = DEFAULT_CATEGORIES.map((name) => ({
      name,
    }));

    await Category.insertMany(categories);

    console.log(" Default categories seeded ");
  } catch (err) {
    console.error("Category seed failed:", err);
  }
};

export default seedCategories;