import { Router } from "express";

const router = Router();

router.use('/user', require(__dirname + '/user/calls'));
router.use('/auth', require(__dirname + '/auth/calls'));
 
module.exports = router;
