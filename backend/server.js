const exp=require('express')
const app=exp()
const cors=require('cors')
app.use(cors({
    origin:['http://localhost:5173','http://localhost:5174'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))
require('dotenv').config()

const {MongoClient}=require('mongodb')
let mClient=new MongoClient(process.env.DB_URL)

mClient.connect()
.then((connectionObj)=>{
    const fsddb=connectionObj.db('bloodbridge')
    const managerCollection=fsddb.collection('bbregistrations')
    const bloodCollection=fsddb.collection('bloodstock')
    const donorCollection=fsddb.collection('donors')
    const campCollection=fsddb.collection('campaigns')
    const userCampCollection=fsddb.collection('campregisters')
    app.set('managerCollection',managerCollection)
    app.set('bloodCollection',bloodCollection)
    app.set('donorCollection',donorCollection)
    app.set('campCollection',campCollection)
    app.set('userCampCollection',userCampCollection)

    console.log('DB connection successful')
    app.listen(process.env.PORT,()=>console.log('http server started on port 4000'))
})
.catch(err=>console.log("Error in DB connection",err))

const managerApp=require('./APIs/managerApi')
const bloodApp=require('./APIs/bloodApi')
const donorApp=require('./APIs/donorApi')
const campApp=require('./APIs/campApi')
const userCampApp=require('./APIs/userCampApi')

app.use('/manager-api',managerApp)
app.use('/blood-api',bloodApp)
app.use('/donor-api',donorApp)
app.use('/camp-api',campApp)
app.use('/userCamp-api',userCampApp)

app.use('*',(req,res,next)=>{
    res.send({message:`Invalid path`})
})

app.use((err,req,res,next)=>{
    res.send({message:"error occurred",errorMessage:err.message})
})