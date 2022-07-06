const express = require("express")
const cors = require("cors")
const router = require("./routes/index")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api", router)

app.listen(process.env.PORT, "0.0.0.0", () =>
  console.log(`Server listening on port ${process.env.PORT}`)
)
