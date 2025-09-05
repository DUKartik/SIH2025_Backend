import dotenv from 'dotenv';
import connectDB from "./db/DB.js"
import {app} from "./app.js"


dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on Port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed ",error);
})
