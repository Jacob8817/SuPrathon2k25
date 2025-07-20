const express = require("express");
const router = express.Router();
const applicationController =  require("../../Controller/application/applicationController");


router.post("/apply", applicationController.applyForCompany);

router.get("/my-applications/:register_no", applicationController.getMyApplications);
router.get('/stats/app-status', applicationController.getApplicationStatusStats)
router.get("/applications/:register_no", applicationController.getApplicationsByRegisterNo);
router.get ("/applied/:register_no", applicationController.appliedjobs);
router.get("/top-recruiters", applicationController.getTopRecruiters);

module.exports = router;
