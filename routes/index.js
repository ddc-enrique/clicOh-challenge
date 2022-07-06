const express = require("express")
const router = express.Router()
const controllers = require("../controllers/index")

router.route("/timezones").get(controllers.getTimeZones)

router
  .route("/timezones/:area/:location?/:region?")
  .put(controllers.searchOneTimeZone)
  .get(controllers.searchOneTimeZone)
  .delete(controllers.removeTimeZone)

module.exports = router
