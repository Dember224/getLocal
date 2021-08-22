const express = require('express');
const app = express()
const port = process.env.PORT || 4000;
const dataRouter = require('./router.js');

app.use('/shortFall', dataRouter);

app.get('/shortfall', (req, res, next)=>{
  res.send()
})

app.listen(port, () =>{
  console.log(`API is live, port: ${port}`);
})
