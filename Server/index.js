const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

// ... Your route and MongoDB configuration code




app.get('/', (req,res)=>{
    res.send('hello dagi')
})




// mongodb configuration

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://bazra:bazra@cluster0.wlz7mry.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
//create collaction of document 
const  carscollaction= client.db("bazra").collection("cars")



      const  bannercollaction= client.db("bazra").collection("banner")

 


    //get or show car data from database

    app.get("/allbanner", async(req,res)=>{
        const banner =bannercollaction.find();
        const result=await banner.toArray();
        res.send(result);
    })
    app.post("/addbanner", async(req,res)=>{
      const data =req.body;
      const result=await bannercollaction.insertOne(data);
      res.send(result);
  })

    //insert cars data to db :use post metod
    app.post("/addcars", async(req,res)=>{
        const data =req.body;
        const result=await carscollaction.insertOne(data);
        res.send(result);
    })


    //get or show car data from database

    // app.get("/allcars", async(req,res)=>{
    //     const cars =carscollaction.find();
    //     const result=await cars.toArray();
    //     res.send(result);
    // })


    //update car data use patch mehode

    app.patch("/updatecars/:id", async(req,res)=>{
        const id = req.params.id;
        const updatecardata= req.body;
        const filter = {_id: new ObjectId(id)};

        const updateDoc ={
            $set: {
                ...updatecardata
            },
        }
        const options= {upsert:true};

        const result= await carscollaction.updateOne(filter,updateDoc,options);
        res.send(result);
    })

    //card data went to delate use delete
    app.delete("/deletecar/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await carscollaction.deleteOne(filter);
        res.send(result);
    });



//find by category
app.get("/allcars", async (req, res) => {
let query={};
if(req.query?.category){ query = {category: req.query.category}}

const result = await carscollaction.find(query).toArray();
res.send(result);

  });


//to get single car data
app.get("/allcars/:id", async (req, res) => {
const id = req.params.id;
const filter = {_id:new ObjectId(id)};
const result=await carscollaction.findOne(filter);
res.send(result);
});
app.get("/updatecars/:id", async (req, res) => {
  const id = req.params.id;
  const filter = {_id:new ObjectId(id)};
  const result=await carscollaction.findOne(filter);
  res.send(result);
  });






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
