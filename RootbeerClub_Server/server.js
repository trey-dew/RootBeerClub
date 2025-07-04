const express = require("express")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())

app.get("/adduser", (req, res) => {
    console.log(req.body)
    res.send("Response Received: " + req.body)
})

app.listen(5173, () => console.log("server on localhost:5434"))