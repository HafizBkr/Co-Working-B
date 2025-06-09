import { Router } from "express";
import { getAuthCacheStats } from "../middleware/auth.middleware";

const router = Router();

router.get("/cache-stats", (req, res) => {
  const authStats = getAuthCacheStats();

  res.json({
    success: true,
    data: {
      authCache: authStats,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

router.post("/clear-cache", (req, res) => {
  try {
    const { clearAuthCache } = require("../middleware/auth.middleware");
    clearAuthCache();

    res.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cache",
    });
  }
});

export default router;
