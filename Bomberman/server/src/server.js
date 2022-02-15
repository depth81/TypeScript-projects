const express = require("express")
const app = express()
const port = process.env.PORT || 4000

app.use("/static",express.static("public"))

app.get("/", (req, res)=>{
    res.send("Welcome to the Bomberman game")
})

app.listen(port, ()=>{
    console.log(`running on port ${port}`)
})