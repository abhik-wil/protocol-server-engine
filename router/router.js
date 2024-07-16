const router = require("express").Router();
const {
  becknToBusiness,
  businessToBecknWrapper,
  updateSession,getsession
} = require("../controller/index");
const fs = require("fs")

// buss > beckn
router.post("/createPayload", businessToBecknWrapper);

// bkn > buss
router.post("/:method", becknToBusiness);

router.post("/updateSession", updateSession);

router.get("/health", (req, res) => {
  res.send({ status: "working" });
});

router.get("/restart",(req,res)=>{
  res.send('Server restarted successfully');

  fs.appendFile("test.js", "contentToAppend", (err) => {
    if (err) throw err;
    console.log('Content appended to file!');
  });
// });
})

router.get("/session", getsession);
module.exports = router;
