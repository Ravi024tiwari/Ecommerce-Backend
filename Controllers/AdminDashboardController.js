import User from "../Models/UserModel.js";
import Product from "../Models/ProductModel.js";
import Order from "../Models/OrderModel.js";

export const getDashboardSummary = async (req, res) => {
  try {
    // Correct date variable
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    /* ---------------------------------------------------------
       1️⃣ TOTAL COUNTS
    --------------------------------------------------------- */
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    /* ---------------------------------------------------------
       2️⃣ REVENUE LAST 30 DAYS  (Paid + delivered)
    --------------------------------------------------------- */
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days },
          orderStatus: { $in: ["paid", "delivered"] }
        }
      },
      {
        $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } }
      }
    ]);

    const revenueLast30Days = revenueAgg[0]?.totalRevenue || 0;

    /* ---------------------------------------------------------
       3️⃣ STATUS COUNTS
    --------------------------------------------------------- */
    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
    const deliveredOrders = await Order.countDocuments({ orderStatus: "delivered" });
    const cancelledOrders = await Order.countDocuments({ orderStatus: "cancelled" });

    /* ---------------------------------------------------------
       4️⃣ LOW STOCK COUNT
    --------------------------------------------------------- */
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 10 } });

    /* ---------------------------------------------------------
       5️⃣ SALES GRAPH → Last 30 days (Daily Users, Daily Orders, Daily Revenue)
    --------------------------------------------------------- */
    const graphDates = [];
    const newUsersCount = [];
    const dailyOrders = [];
    const dailyRevenue = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      const formatted = start.toISOString().split("T")[0];
      graphDates.unshift(formatted);

      // New users per day
      const users = await User.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      newUsersCount.unshift(users);

      // Orders per day
      const orders = await Order.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      dailyOrders.unshift(orders);

      // Daily revenue
      const revenueAgg = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            orderStatus: { $in: ["paid", "delivered"] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ]);

      dailyRevenue.unshift(revenueAgg[0]?.total || 0);
    }

    /* ---------------------------------------------------------
       SEND FINAL RESPONSE
    --------------------------------------------------------- */
    return res.status(200).json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          revenueLast30Days,
          pendingOrders,
          deliveredOrders,
          cancelledOrders,
          lowStockCount,
        },
        salesGraph: {
          dates: graphDates,
          newUsers: newUsersCount,
          orders: dailyOrders,
          revenue: dailyRevenue,
        }
      }
    });

  } catch (error) {
    console.log("Dashboard Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
    });
  }
};
