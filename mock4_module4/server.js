const express=require('express')
const dotenv=require('dotencv')
const path=require('path')

dotenv.config()

const app=express()
const PORT=process.env.PORT||3000

app.use(express.json())

const routes=require('./routes')
const { log } = require('console')
app.use('/','api',routes)

app.get('/',(req,res)=>{
    res.json({message:'customer=Order manaagement is running'})
})

app.listen(PORT,()=>{
    console.log(`server running on  http://localhost"${PORT}`);
    
})