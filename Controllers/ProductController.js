import Product from "../Models/ProductModel.js"
import Order from "../Models/OrderModel.js";
import User from "../Models/UserModel.js";//here its use for recently viewed product
//create Product by Admin

 const createProduct = async (req, res) => {
  try {
    console.log("TOKEN RECEIVED BY SERVER:", req.user);


    const { title, description, price, category, brand, stock } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // 🔥 Cloudinary image URLs
    const imageUrls = req.files.map((file) => file.path);// here we take multiple photos of the same product 

    const product = await Product.create({
      title,
      description,
      price,
      category,
      brand,
      stock,
      productImages: imageUrls,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.log("Create Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

//get all products with query {PRICE,TITLE,CATEGORY}

const getAllProducts = async (req, res) => {
  try {
    const {
      search,      // Frontend 'search' bhej raha hai
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // 🔍 1. SEARCH LOGIC
    // Title, Description ya Category mein search karo
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },       // Case insensitive
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 2. FILTERS (Case Insensitive banaya hai taaki "mobile" aur "Mobile" same maane jayein)
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    // 💰 3. PRICE RANGE
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // ↕ 4. SORTING
    let sortOption = {};
    switch (sort) {
      case "price_asc":
        sortOption.price = 1; // Low to High
        break;
      case "price_desc":
        sortOption.price = -1; // High to Low
        break;
      case "newest":
        sortOption.createdAt = -1; // Latest first
        break;
      case "oldest":
        sortOption.createdAt = 1; // Oldest first
        break;
      case "rating":
        sortOption.averageRating = -1; // Best rated first
        break;
      default:
        sortOption.createdAt = -1; // Default: Newest first
    }

    // 📄 5. PAGINATION
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // 🔥 FETCH DATA
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Total Count (Pagination UI ke liye zaroori hai)
    const totalProducts = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: products.length, // Current page count
      totalProducts,          // Total DB count for this query
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      products,
    });

  } catch (error) {
    console.log("Get All Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

//GET SINGLE PRODUCT BY ID 
 const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log("Get Single Product Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

//UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    // 1. ID se Product dhoondo
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2. Text Fields Update Karo (Agar user ne bheje hain)
    const { title, description, price, category, brand, stock, deleteImages } = req.body;
    
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (stock) product.stock = stock;

    // -------------------------------------------------------
    // 🖼️ IMAGE HANDLING LOGIC (Delete Old + Add New)
    // -------------------------------------------------------
    
    // Step A: Handle Deletion (Agar frontend se 'deleteImages' aaya hai)
    if (deleteImages && deleteImages.length > 0) {
      // deleteImages kabhi string (1 image) ho sakta hai, kabhi array. Dono handle karein.
      const imagesToDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages];

      // Filter logic: Jo image delete list mein nahi hai, wahi bachegi
      product.productImages = product.productImages.filter(
        (img) => !imagesToDelete.includes(img)
      );

      // TODO: Yahan aap Cloudinary se bhi delete karne ka function call kar sakte hain
      // await deleteFromCloudinary(imagesToDelete); 
    }

    // Step B: Handle New Uploads (Add to existing array)
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => file.path); // Cloudinary URL
      product.productImages.push(...newImageUrls); // Purani list mein nayi jod do
    }

    // -------------------------------------------------------

    // 3. Final Save
    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    console.log("Update Product Error:", error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

//DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

//UPDATE THE STATUS OF THE PRODUCT
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const productId =req.params.id;

    if (!["active", "in-active", "out-of-stock"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      product,
    });
  } catch (error) {
    console.log("Update Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

//Trending product on home route
const getHomeData = async (req, res) => {
  try {
    // Limits (can adjust anytime)
    const TRENDING_LIMIT = 10;
    const TOP_RATED_LIMIT = 10;
    const NEW_ARRIVALS_LIMIT = 12;
    const BEST_DEALS_LIMIT = 12;
    const PER_CATEGORY_LIMIT = 8;

    const categories = ["electronics", "fashion", "mobiles", "laptops", "home", "sports"];

    /* ----------------------------------------------
       1) TRENDING — sorted by soldCount (FAST)
    ------------------------------------------------*/
    const trending = await Product.find({
      status: "active",
      stock: { $gt: 0 }
    })
      .sort({ soldCount: -1 })
      .limit(TRENDING_LIMIT)
      .select(
        "title price productImages category brand averageRating reviewCount soldCount"
      );

    /* ----------------------------------------------
       2) TOP RATED
    ------------------------------------------------*/
    const topRated = await Product.find({
      averageRating: { $gte: 4 },
      status: "active",
      stock: { $gt: 0 }
    })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(TOP_RATED_LIMIT)
      .select(
        "title price productImages category brand averageRating reviewCount"
      );

    /* ----------------------------------------------
       3) NEW ARRIVALS
    ------------------------------------------------*/
    const newArrivals = await Product.find({
      status: "active",
      stock: { $gt: 0 }
    })
      .sort({ createdAt: -1 })
      .limit(NEW_ARRIVALS_LIMIT)
      .select("title price productImages category brand createdAt");

    /* ----------------------------------------------
       4) BEST DEALS — lowest price + in stock
    ------------------------------------------------*/
    const bestDeals = await Product.find({
      status: "active",
      stock: { $gt: 0 }
    })
      .sort({ price: 1 })
      .limit(BEST_DEALS_LIMIT)
      .select("title price productImages category brand");

    /* ----------------------------------------------
       5) CATEGORY WISE BLOCK
    ------------------------------------------------*/
    const categoryWise = {};

    await Promise.all(
      categories.map(async (cat) => {
        const list = await Product.find({
          category: cat,
          status: "active",
          stock: { $gt: 0 }
        })
          .sort({ createdAt: -1 }) // or sort by rating
          .limit(PER_CATEGORY_LIMIT)
          .select(
            "title price productImages brand averageRating reviewCount"
          );

        categoryWise[cat] = list;
      })
    );

    /* ----------------------------------------------
       SEND RESPONSE
    ------------------------------------------------*/
    return res.status(200).json({
      success: true,
      data: {
        trending,
        topRated,
        newArrivals,
        bestDeals,
        categoryWise,
      },
    });
  } catch (error) {
    console.log("Home Page Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch homepage data",
    });
  }
};

//now for the searching or rendering of products on the pages
export const searchProducts = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 12 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    const skip = (page - 1) * limit;

    // Predefined main categories
    const mainCategories = [//these are the differnet categoris on my website
      "mobiles",
      "laptops",
      "electronics",
      "fashion",
      "home",
      "sports",
      "beauty",
      "appliances"
    ];

    let query = {};

    // 1️⃣ Category Match
    const keywordLower = keyword.toLowerCase();
    const matchedCategory = mainCategories.find((cat) =>
      keywordLower.includes(cat)
    );

    if (matchedCategory) {
      query.category = matchedCategory;
    } else {
      // 2️⃣ Full text search on title + description
      query.$text = { $search: keyword };
    }

    const products = await Product.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      products,
    });
  } catch (error) {
    console.log("Search Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search products",
    });
  }
};

//suggestion product searhc
export const getSearchSuggestions = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required",
      });
    }

    const q = keyword.toLowerCase();

    /* ---------------------------------------------------------
       1️⃣ CATEGORY SUGGESTIONS (Predefined main categories)
    --------------------------------------------------------- */
    const categories = [
      "mobiles",
      "laptops",
      "electronics",
      "fashion",
      "home",
      "sports",
      "beauty",
      "appliances",
      "grocery",
    ];

    const matchedCategories = categories.filter((cat) =>
      cat.toLowerCase().includes(q)
    );

    /* ---------------------------------------------------------
       2️⃣ PRODUCT SUGGESTIONS (Title-based)
    --------------------------------------------------------- */
    const productTitles = await Product.find(
      {
        title: { $regex: q, $options: "i" },
      },
      "title"
    )
      .limit(6)
      .lean();

    const titleSuggestions = productTitles.map((p) => p.title);

    /* ---------------------------------------------------------
       3️⃣ BRAND SUGGESTIONS (Optional but nice)
    --------------------------------------------------------- */
    const brands = await Product.find(
      {
        brand: { $regex: q, $options: "i" },
      },
      "brand"
    )
      .limit(4)
      .lean();

    const brandSuggestions = [...new Set(brands.map((b) => b.brand))];

    /* ---------------------------------------------------------
       MERGE ALL SUGGESTIONS (Remove duplicates)
    --------------------------------------------------------- */
    const suggestions = Array.from(
      new Set([...matchedCategories, ...titleSuggestions, ...brandSuggestions])
    ).slice(0, 10);

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.log("Search Suggestion Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch search suggestions",
    });
  }
};

//recently view product
export const addRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;

    // check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(userId);

    // Remove product if already exists (to avoid duplicate)
    user.recentlyViewed = user.recentlyViewed.filter(
      (id) => id.toString() !== productId.toString()
    );

    // Add product at the beginning
    user.recentlyViewed.unshift(productId);

    // Max 10 items limit
    if (user.recentlyViewed.length > 10) {
      user.recentlyViewed.pop();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Added to recently viewed",
    });
  } catch (error) {
    console.log("Recently Viewed Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update recently viewed",
    });
  }
};

//get that recently 10 viewd product
export const getRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("recentlyViewed", "title price productImages category")
      .lean();

    return res.status(200).json({
      success: true,
      recentlyViewed: user.recentlyViewed,
    });
  } catch (error) {
    console.log("Get Recently Viewed Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recently viewed products",
    });
  }
};






export {createProduct,getAllProducts,getSingleProduct,updateProduct,deleteProduct,updateProductStatus,getHomeData}