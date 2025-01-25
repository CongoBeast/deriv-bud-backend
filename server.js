const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = 3005;
app.use(express.json());

const JWT_SECRET = 'your_jwt_secret'; // Use a strong, secret key in production


// Configure Cloudinary
cloudinary.config({
  cloud_name: "dxxlrzouc", // Replace with your Cloudinary cloud name
  api_key: "191187614991536", // Replace with your Cloudinary API key
  api_secret: "9b75q3SXcar-yJFsWQsfXWFhnM8", // Replace with your Cloudinary API secret
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const generateToken = (userId) => {
    const secretKey = 'your-secret-key'; // Replace with your own secret key
    const expiresIn = '1h'; // Token expiration time, e.g., 1 hour
    const payload = { sub: userId,  iat: Math.floor(Date.now() / 1000), // Issued at time (current time in seconds)
    };
    return jwt.sign(payload, secretKey, { expiresIn });;
  };


async function encryptPassword(password) {
    try {
      // Define the number of salt rounds
      const saltRounds = 10;
  
      // Generate the salt
      const salt = await bcrypt.genSalt(saltRounds);
  
      // Hash the password with the salt
      const hashedPassword = await bcrypt.hash(password, salt);
  
      console.log('Encrypted Password:', hashedPassword);
      return hashedPassword;
    } catch (error) {
      console.error('Error encrypting password:', error);
    }
  }

const generateId = () => {
    return crypto.randomBytes(12).toString('hex'); // Generates a 24-character hexadecimal string
  };

const apiConfig = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': '4graSqucDumhuePX7lpf75s6TrTFkwYXU1KN2h6vN3j72edWz6oue9BBFYOHvfUC',
    },
    urlBase: 'https://ap-south-1.aws.data.mongodb-api.com/app/data-nmutxbv/endpoint/data/v1/action/'
  };

const axiosInstance = axios.create({
    baseURL: apiConfig.urlBase,
    headers: apiConfig.headers,
  });


app.post('/submit-trade', (req, res) => {
    const packageData = req.body;
    if (!packageData._id) {
      packageData._id = generateId();
    }
  
    const data = JSON.stringify({
      "collection": "trades",
      "database": "deriv-bud",
      "dataSource": "Cluster0",
      "document": packageData
    });
  
    axios({ ...apiConfig, url: `${apiConfig.urlBase}insertOne`, data })
      .then(response => {
        res.json(response.data);
      })
      .catch(error => {
        console.error('Error:', error);
        res.status(500).send(error);
      });
  });


// app.get('/trades', (req, res) => {
//   const filter = req.query.filter; // Get the filter from the request
//   const pipeline = [];

//   // Determine the date range based on the filter
//   if (filter === 'today') {
//     const startOfDay = moment().startOf('day').toISOString();
//     const endOfDay = moment().endOf('day').toISOString();
//     pipeline.push({
//       $match: {
//         date: {
//           $gte: new Date(startOfDay),
//           $lt: new Date(endOfDay),
//         },
//       },
//     });
//   } else if (filter === 'yesterday') {
//     const startOfYesterday = moment().subtract(1, 'days').startOf('day').toISOString();
//     const endOfYesterday = moment().subtract(1, 'days').endOf('day').toISOString();
//     pipeline.push({
//       $match: {
//         date: {
//           $gte: new Date(startOfYesterday),
//           $lt: new Date(endOfYesterday),
//         },
//       },
//     });
//   } else if (filter === 'dayBefore') {
//     const startOfDayBefore = moment().subtract(2, 'days').startOf('day').toISOString();
//     const endOfDayBefore = moment().subtract(2, 'days').endOf('day').toISOString();
//     pipeline.push({
//       $match: {
//         date: {
//           $gte: new Date(startOfDayBefore),
//           $lt: new Date(endOfDayBefore),
//         },
//       },
//     });
//   }

//   const data = JSON.stringify({
//     "collection": "trades",
//     "database": "deriv-bud",
//     "dataSource": "Cluster0",
//     // "filter": {}
//     "pipeline": pipeline
//   });

//   // axios({ ...apiConfig, url: `${apiConfig.urlBase}find`, data })
//   axios({ ...apiConfig, url: `${apiConfig.urlBase}aggregate`, data })
//     .then(response => {
//       res.json(response.data.documents);
//     })
//     .catch(error => {
//       console.error('Error:', error);
//       res.status(500).send(error);
//     });

// });
app.get('/trades', (req, res) => {
  const filter = req.query.filter; // Get the filter from the request
  const pipeline = [];

  // Determine the date range based on the filter
  if (filter === 'today') {
    const startOfDay = moment().startOf('day').toISOString();
    const endOfDay = moment().endOf('day').toISOString();
    pipeline.push({
      $match: {
        date: {
          $gte: new Date(startOfDay),
          $lt: new Date(endOfDay),
        },
      },
    });
  } else if (filter === 'yesterday') {
    const startOfYesterday = moment().subtract(1, 'days').startOf('day').toISOString();
    const endOfYesterday = moment().subtract(1, 'days').endOf('day').toISOString();
    pipeline.push({
      $match: {
        date: {
          $gte: new Date(startOfYesterday),
          $lt: new Date(endOfYesterday),
        },
      },
    });
  } else if (filter === 'dayBefore') {
    const startOfDayBefore = moment().subtract(2, 'days').startOf('day').toISOString();
    const endOfDayBefore = moment().subtract(2, 'days').endOf('day').toISOString();
    pipeline.push({
      $match: {
        date: {
          $gte: new Date(startOfDayBefore),
          $lt: new Date(endOfDayBefore),
        },
      },
    });
  }

  // Add a $sort stage to sort by date in descending order (latest first)
  pipeline.push({
    $sort: {
      date: -1, // -1 for descending order (latest first)
    },
  });

  const data = JSON.stringify({
    "collection": "trades",
    "database": "deriv-bud",
    "dataSource": "Cluster0",
    "pipeline": pipeline
  });

  axios({ ...apiConfig, url: `${apiConfig.urlBase}aggregate`, data })
    .then(response => {
      res.json(response.data.documents);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).send(error);
    });
});

app.put('/edit-trade/:id', (req, res) => {
    const { id } = req.params; // Trade ID from the URL
    const { amount, status } = req.body; // Updated fields from the request body
  
    // Prepare the update object
    const update = { status }; // Always update the status
    if (amount !== undefined) {
      update.outcome = amount; // Update amount only if it's provided
    }
  
    const data = JSON.stringify({
      collection: "trades", // Replace with your collection name
      database: "deriv-bud", // Replace with your database name
      dataSource: "Cluster0", // Replace with your data source
      filter: { _id: id }, // Filter by trade ID (convert string ID to ObjectId)
      update: { $set: update }, // Update the specified fields
    });

    console.log(update)

    // Send the request to the MongoDB Data API
    axios({ ...apiConfig, url: `${apiConfig.urlBase}updateOne`, data })
      .then(response => {
        res.json(response.data); // Return the response from the Data API
      })
      .catch(error => {
        console.error('Error updating trade:', error);
        res.status(500).send(error);
      });
  });

  // Add Signal Route
app.post("/submit-signal", async (req, res) => {
  const { symbol, entry, stoploss, target, image } = req.body;

  try {
    // Upload image to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(image, {
      folder: "trade-signals", // Optional: Organize images in a folder
    });

    // Prepare the trade data
    const tradeData = {
      symbol,
      entry,
      stoploss,
      target,
      imageUrl: cloudinaryResponse.secure_url, // Store the Cloudinary image URL
      _id: generateId(), // Generate a unique ID if not provided
    };

    // Insert the trade data into MongoDB
    const data = JSON.stringify({
      collection: "signals",
      database: "deriv-bud",
      dataSource: "Cluster0",
      document: tradeData,
    });

    const response = await axios({
      ...apiConfig,
      url: `${apiConfig.urlBase}insertOne`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiConfig.apiKey,
      },
      data,
    });

    res.status(201).json(response.data);
  } catch (error) {
    console.error("Error submitting trade:", error);
    res.status(500).json({ message: "Failed to submit trade", error: error.message });
  }
});




  const registerUser = async (userData) => {

    console.log(userData)

    try {
      // Check if the username exists
      let response = await axiosInstance.post('findOne', {
        dataSource: 'Cluster0', // Replace with your data source name
        database: 'deriv-bud', // Replace with your database name
        collection: 'users', // Replace with your collection name
        filter: { username: userData.username },
      });
  
      if (response.data.document) {
        return { status: 400, message: 'Username already exists' };
      }
  
      // Check if the email exists
      response = await axiosInstance.post('findOne', {
        dataSource: 'Cluster0',
        database: 'deriv-bud',
        collection: 'users',
        filter: { email: userData.email },
      });
  
      if (response.data.document) {
        return { status: 400, message: 'Email already registered' };
      }
  
      // Register the new user
      response = await axiosInstance.post('insertOne', {
        dataSource: 'Cluster0',
        database: 'deriv-bud',
        collection: 'users',
        document: { ...userData, signupTimestamp: new Date() },
      });
  
      const token = generateToken() // Assume you have a function to generate tokens
  
      return { status: 200, token };
    } catch (error) {
      console.error('Error registering user:', error);
      return { status: 500, message: 'Internal server error' };
    }
  };
  
  
  // Register User
  app.post('/register', async (req, res) => {
    const { username, password, email, userType } = req.body;

    const hashedPassword = await encryptPassword(password)

    console.log(hashedPassword)
  
    const response = await registerUser({ username, hashedPassword, email, userType });
  
    if (response.status === 200) {
      res.json({ token: response.token });
    } else {
      res.status(response.status).json({ message: response.message });
    }
  });
  
  // Login User
  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log(username)
  
    const data = JSON.stringify({
      "collection": "users",
      "database": "deriv-bud",
      "dataSource": "Cluster0",
      "filter": { username }
    });
  
    axios({ ...apiConfig, url: `${apiConfig.urlBase}findOne`, data })
      .then(response => {
        const user = response.data.document;

        console.log(user.hashedPassword)
        if (user && bcrypt.compareSync(password, user.hashedPassword)) {
          const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
  
          // Update user's loggedOn status and loginTimestamp
          const loginTimestamp = new Date().toISOString();
          const updateData = JSON.stringify({
            "collection": "users",
            "database": "deriv-bud",
            "dataSource": "Cluster0",
            "filter": { "_id": user._id },
            "update": { "$set": { isLoggedOn: true, loginTimestamp } }
          });
  
          axios({ ...apiConfig, url: `${apiConfig.urlBase}updateOne`, data: updateData })
            .then(() => res.json({ token }))
            .catch(error => res.status(500).send(error));
  
        } else {
          res.status(401).send('Invalid credentials');
        }
      })
      .catch(error => res.status(500).send(error));
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });