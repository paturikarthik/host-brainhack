const express = require('express');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://paturikarthik1:2Jrs1wGWTsscp2dH@cluster0.65c7byd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const {ObjectId} = require('mongodb');
const mongodb = new MongoClient(uri);
app.use(express.json());

// Define a route
app.post('/update', async (req, res) => {
    const {name, trackingOptions, applianceType, usage} = req.body
    const updateDB = await mongodb.db('brainhack').collection('devices').insertOne({
        name:name,
        trackingOptions:trackingOptions,
        applianceType:applianceType,
        usage:usage
    })
    if (updateDB) {
        res.status(200).json({message: "success",insertedId:updateDB.insertedId})
    } else {
        res.status(500).json({message: "error"})
    }
});

app.post('/listen', async (req, res) => {
    payload = req.body.payload
    console.log(payload[3])
    try{
    const device = await mongodb
            .db('brainhack')
            .collection('devices')
            .findOne({_id: new ObjectId(payload[3])});
            console.log(device)
          const usage = await mongodb
            .db('brainhack')
            .collection('usages')
            .findOne({deviceID: device?._id, state:"active"});
            console.log(usage)
          if (usage) {
            const stop = await mongodb
              .db('brainhack')
              .collection('usages')
              .updateOne(
                {_id: usage._id},
                {$set: {stop: Date.now(), usage: Number(device?.usage) * (Date.now()-usage.start)/(1000*60*60),state:"stopped"}},
              );
            console.log(stop)
          } else {
            const start = await mongodb
              .db('brainhack')
              .collection('usages')
              .insertOne({
                deviceID: device?._id,
                start: Date.now(),
                usageRate: device?.usage,
                state:"active"
              });
            console.log(start)
          }
          res.status(200).json({message: "success"})
        }catch(e){
            res.status(500).json({message: e})
        }
        
})
// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
