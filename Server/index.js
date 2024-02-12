const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");
const multer = require("multer");
const path = require("path"); // Import the 'path' module

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/videos", express.static(path.join(__dirname, "public/videos")));

// ... Your route and MongoDB configuration code
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});


app.use("/videos", express.static(path.join(__dirname, "public/videos")));

const storageVideos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/videos");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
const uploadVideos = multer({ storage: storageVideos });

app.get("/", (req, res) => {
  res.send("hello dagi");
});

// mongodb configuration

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://bazra:bazra@cluster0.wlz7mry.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    //create collaction of document
    const carscollaction = client.db("bazra").collection("cars");

    const bannercollaction = client.db("bazra").collection("banner");
    const whoweareCollection = client.db("bazra").collection("whoweare");



    app.post("/addwhoweare", uploadVideos.single("videoFile"), async (req, res) => {
      try {
        const data = req.body;
        data.videoFile = req.file.filename;

        const result = await whoweareCollection.insertOne(data);

        res.json({
          success: true,
          message: "Video added successfully",
          result,
        });
      } catch (error) {
        console.error("Error adding video:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });

    app.get("/whoweare", async (req, res) => {
      try {
        const videos = await whoweareCollection.find().toArray();
        res.json(videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
      }
    });
    
    // Endpoint to get a specific "Who We Are" video by ID
    app.get("/whoweare/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
    
      try {
        const video = await whoweareCollection.findOne(filter);
        if (!video) {
          return res.status(404).json({ success: false, message: "Video not found" });
        }
    
        res.json(video);
      } catch (error) {
        console.error("Error fetching video:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
      }
    });

    // Update video data
    app.patch('/updatewhoweare/:id', uploadVideos.single('videoFile'), async (req, res) => {
      try {
        const id = req.params.id;
        const updatewhoweareData = req.body;
        if (req.file) {
          updatewhoweareData.videoFile = req.file.filename;
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updatewhoweareData,
          },
        };
        const options = { upsert: true };

        const result = await whoweareCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    });
    // Delete video data
app.delete('/deletewhoweare/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };

    const result = await whoweareCollection.deleteOne(filter);
    res.json(result);
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


    
    app.get("/allbanner/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bannercollaction.findOne(filter);
      res.send(result);
    });

    app.get("/allbanner", async (req, res) => {
      try {
        const banner = await bannercollaction.find().toArray(); // Convert cursor to array
        res.send(banner);
      } catch (error) {
        console.error("Error fetching banners:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });

    // Update banner
    app.patch( "/updatebanner/:id", upload.single("imageFile"),async (req, res) => {
        try {
          const id = req.params.id;
          const updatebannerdata = req.body;
          if (req.file) {
            // If a new image file is provided, update the imageFile property
            updatebannerdata.imageFile = req.file.filename;
          }

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updatebannerdata,
            },
          };
          const options = { upsert: true };

          const result = await bannercollaction.updateOne(
            filter,
            updateDoc,
            options
          );
          res.json(result);
        } catch (error) {
          console.error("Error updating banner:", error);
          res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
        }
      }
    );

    // Route for uploading banner with image
    app.post("/addbanner", upload.single("imageFile"), async (req, res) => {
      try {
        const data = req.body;
        data.imageFile = req.file.filename; // Save the filename in MongoDB

        // Assuming 'bannercollaction' is your MongoDB collection
        const result = await bannercollaction.insertOne(data);

        res.json({
          success: true,
          message: "Banner added successfully",
          result,
        });
      } catch (error) {
        console.error("Error adding banner:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });
    //delate banner
    app.delete("/deletebanner/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bannercollaction.deleteOne(filter);
      res.send(result);
    });
   


    
    //insert cars data to db :use post metod

    app.post("/addcars", async (req, res) => {
      const data = req.body;
      const result = await carscollaction.insertOne(data);
      res.send(result);
    });
    //update car data use patch mehode

    app.patch("/updatecars/:id", async (req, res) => {
      const id = req.params.id;
      const updatecardata = req.body;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          ...updatecardata,
        },
      };
      const options = { upsert: true };

      const result = await carscollaction.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //card data went to delate use delete
    app.delete("/deletecar/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await carscollaction.deleteOne(filter);
      res.send(result);
    });

    //find by category
    app.get("/allcars", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }

      const result = await carscollaction.find(query).toArray();
      res.send(result);
    });

    //to get single car data
    app.get("/allcars/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await carscollaction.findOne(filter);
      res.send(result);
    });
    app.get("/updatecars/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await carscollaction.findOne(filter);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
