import { Router, type IRouter } from "express";
import enquiriesRouter from "./enquiries";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(enquiriesRouter);

export default router;
