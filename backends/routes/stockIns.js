import express from "express";
import {
  createStockIn,
  getAllStockIns,
  // getStockInById,
  getStockIn
} from "../controllers/stockController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(authMiddleware);

router.post("/", createStockIn );
router.get("/stock",  getStockIn);
router.get("/", getAllStockIns);

export default router;
