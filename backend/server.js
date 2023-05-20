const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Update the origin to restrict access to specific domains
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Define a route to serve data.json
app.get('/data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data.json'));
});

// Define a route to add new data to data.json
// Define a route to add new data to data.json
app.post('/addData', (req, res) => {
  // Retrieve the new data from the request body
  const newData = req.body;

  // Read the existing data from data.json
  const dataPath = path.join(__dirname, 'data.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read data file' });
      return;
    }

    // Parse the existing data as JSON
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error(parseErr);
      res.status(500).json({ error: 'Failed to parse data file' });
      return;
    }

    // Add the new data to the existing data array
    jsonData.push(newData);

    // Write the updated data back to data.json
    const updatedData = JSON.stringify(jsonData);
    fs.writeFile(dataPath, updatedData, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        res.status(500).json({ error: 'Failed to write data file' });
        return;
      }

      // Send a success response with the updated data
      res.json({ message: 'Data added successfully', data: jsonData });
    });
  });
});



const port = 3000;
const hostname = 'localhost';
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
