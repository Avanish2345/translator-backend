/*const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/translate", async (req, res) => {
  const { sentence, use_pretrained } = req.body;

  try {
    const response = await axios.post("http://localhost:8000/translate", {
      sentence,
      use_pretrained,
    });

    res.json({ translated_text: response.data.translated_text });
  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`);
});
*/

/*const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors'); // Import the CORS package

const app = express();
const port = 5000; // Port for your Node.js backend

// Middleware to enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from the frontend (React) running on localhost:5173
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Middleware to parse JSON request body
app.use(express.json());

// Configure multer for file storage (you can change the destination and filename as needed)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Store files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);  // Unique file name
  }
});


// Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

// Route to handle translation requests (text-based)
app.post('/translate', async (req, res) => {
  const { text, use_pretrained } = req.body;

  try {
    // Make a POST request to your FastAPI backend (Python)
    const response = await axios.post('http://127.0.0.1:8000/translate/', {
      text: text,
      use_pretrained: use_pretrained
    });

    // Send the response from FastAPI to the client
    res.json({
      original_text: text,
      translated_text: response.data.translated_text || response.data.translated_text
    });
  } catch (error) {
    console.error('Error calling FastAPI:', error.message);
    console.error('Error response:', error.response ? error.response.data : 'No response data');
    res.status(500).json({ error: 'Failed to get translation' });
  }
});

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('File uploaded:', req.file);

  // Process the file as needed, or send back the file information
  res.json({
    message: 'File uploaded successfully!',
    file: req.file
  });
});


// Route to handle translation requests
app.post('/translate', async (req, res) => {
  const { text, use_pretrained } = req.body;

  try {
    // Make a POST request to your FastAPI backend (Python)
    const response = await axios.post('http://127.0.0.1:8000/translate/', {
      text: text,
      use_pretrained: use_pretrained
    });

    // Send the response from FastAPI to the client
    res.json({
      original_text: text,
      translated_text: response.data.translated_text || response.data.translated_text
    });
  } catch (error) {
    // Log the error message for debugging
    console.error('Error calling FastAPI:', error.message);
    console.error('Error response:', error.response ? error.response.data : 'No response data');

    // Return an error response to the client
    res.status(500).json({ error: 'Failed to get translation' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Node.js backend running on http://localhost:${port}`);
});*/



/*const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const pdfParse = require('pdf-parse'); // Ensure that you have this installed

const app = express();
const port = 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage: storage });

// Route to handle text translation
app.post('/translate', async (req, res) => {
    const { text, use_pretrained } = req.body;

    try {
        const response = await axios.post('http://127.0.0.1:8000/translate/', { text, use_pretrained });
        res.json({ original_text: text, translated_text: response.data.translated_text });
    } catch (error) {
        console.error('Translation failed:', error.message);
        res.status(500).json({ error: 'Failed to get translation' });
    }
});

// Route to handle PDF translation
app.post('/translate-pdf', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfText = await pdfParse(dataBuffer);

        // Split the text into sentences if needed, otherwise send the entire text
        const response = await axios.post('http://127.0.0.1:8000/translate/', {
            text: pdfText.text,
            use_pretrained: true
        });
        
        res.json({
            original_text: pdfText.text,
            translated_text: response.data.translated_text
        });
    } catch (error) {
        console.error('PDF Translation failed:', error.message);
        res.status(500).json({ error: 'Failed to process PDF translation' });
    }
});

app.listen(port, () => console.log(`Node.js backend running on http://localhost:${port}`));*/

const natural = require('natural');
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const pdfParse = require('pdf-parse'); // Ensure that you have this installed
const mongoose = require('mongoose');

/* mongoose.connect('mongodb://localhost:27017/translatorDB').then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err)); */

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

  const translationSchema = new mongoose.Schema({
    sourceText: String,
    translatedText: String,
    method: String, // 'text' or 'file'
    createdAt: { type: Date, default: Date.now }
  });
  
  const Translation = mongoose.model('Translation', translationSchema);
  

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'https://translator-frontend-o1rw.onrender.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
    }));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage: storage });

function splitIntoChunks(text, maxChunkLength = 1000) {
    const tokenizer = new natural.SentenceTokenizer();
    const sentences = tokenizer.tokenize(text);

    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {

        if ((currentChunk + sentence).length > maxChunkLength) {
            chunks.push(currentChunk);
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
} 

// Route to handle text translation
app.post('/translate', express.json(), async (req, res) => {
    const { text, use_pretrained } = req.body;

    try {
        //const response = await axios.post('http://127.0.0.1:8000/translate/', { text, use_pretrained });
        const response = await axios.post('https://avanish3412-translator-model.hf.space/translate/', { text, use_pretrained });
        //res.json({ original_text: text, translated_text: response.data.translated_text });
        const translatedText = response.data.translated_text;

        // Save to MongoDB
        await Translation.create({
        sourceText: text,
        translatedText: translatedText,
        method: 'text'
        });

        res.json({ original_text: text, translated_text: translatedText });

    } catch (error) {
        console.error('Translation failed:', error.message);
        res.status(500).json({ error: 'Failed to get translation' });
    }
});

// Route to handle PDF translation
/* app.post('/translate-pdf', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfText = await pdfParse(dataBuffer);
        // Split the text into sentences if needed, otherwise send the entire text
        const response = await axios.post('http://127.0.0.1:8000/translate/', {
            text: pdfText.text,
            use_pretrained: true
        });

        await Translation.create({
          sourceText: pdfText.text,
          translatedText: response.data.translated_text,
          method: 'file'
        });
        
        res.json({
            original_text: pdfText.text,
            translated_text: response.data.translated_text
        });
    } catch (error) {
        console.error('PDF Translation failed:', error.message);
        res.status(500).json({ error: 'Failed to process PDF translation' });
    }
}); */

app.post('/translate-pdf', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        let extractedText = '';

        // Get file extension
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        // ===== TXT FILE =====
        if (fileExtension === 'txt') {
            extractedText = fs.readFileSync(req.file.path, 'utf8');
        }

        // ===== PDF FILE =====
        else if (fileExtension === 'pdf') {
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfText = await pdfParse(dataBuffer);
            extractedText = pdfText.text;
        }

        // ===== UNSUPPORTED =====
        else {
            return res.status(400).json({
                error: 'Only TXT and PDF files are supported'
            });
        }

        const shortText = extractedText.substring(0, 300);
        // Send text to FastAPI
        /*const response = await axios.post('http://127.0.0.1:8000/translate/', {
            text: extractedText,
            use_pretrained: true
        });*/
        /* const response = await axios.post('https://avanish3412-translator-model.hf.space/translate/', {
            text: extractedText,
            use_pretrained: true
        });

        // Save in MongoDB
        await Translation.create({
            sourceText: extractedText,
            translatedText: response.data.translated_text,
            method: 'file'
        });

        res.json({
            original_text: extractedText,
            translated_text: response.data.translated_text
        }); */

    // Split into chunks
const chunks = splitIntoChunks(extractedText);

let finalTranslation = '';

// Translate chunk-by-chunk
for (const chunk of chunks) {

    const response = await axios.post(
        'https://avanish3412-translator-model.hf.space/translate/',
        {
            text: chunk,
            use_pretrained: true
        }
    );

    finalTranslation += response.data.translated_text + '\n';
}

// Save in MongoDB
await Translation.create({
    sourceText: extractedText,
    translatedText: finalTranslation,
    method: 'file'
});

// Send response
res.json({
    original_text: extractedText,
    translated_text: finalTranslation
});

    } catch (error) {
        //console.error('Translation failed:', error.message);
        console.log("========== FULL ERROR ==========");
        console.log(error.response?.data);
        console.log(error.message);
        console.log("================================");

        res.status(500).json({
            error: 'Failed to process file translation'
        });
    }
});

app.listen(port, () => console.log(`Node.js backend running on http://localhost:${port}`));

app.get('/translations', async (req, res) => {
  const all = await Translation.find().sort({ createdAt: -1 }).limit(10);
  res.json(all);
});
