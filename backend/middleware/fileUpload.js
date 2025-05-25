const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    // Create different folders based on challenge type
    if (req.params.category === 'Contest') {
      uploadPath += 'contest/';
    } else if (req.params.category === 'Debugging') {
      uploadPath += 'debugging/';
    } else if (req.params.category === 'FlashCode') {
      uploadPath += 'flashcode/';
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = [
    'text/plain',
    'application/javascript',
    'application/json',
    'text/xml',
    'text/x-python',
    'text/x-java',
    'text/x-c++',
    'text/x-c',
    'text/x-csharp',
    'text/x-ruby',
    'text/x-php',
    'text/x-go',
    'text/x-rust',
    'text/x-swift',
    'text/x-kotlin',
    'text/x-scala',
    'text/x-r',
    'text/x-matlab',
    'text/x-sql',
    'text/x-shellscript'
  ];
  
  // List of allowed file extensions
  const allowedExtensions = [
    '.txt', '.js', '.json', '.xml', '.py', '.java', '.cpp', '.c', '.cs', 
    '.rb', '.php', '.go', '.rs', '.swift', '.kt', '.scala', '.r', '.m', 
    '.sql', '.sh'
  ];

  // If MIME type is application/octet-stream, check file extension
  if (file.mimetype === 'application/octet-stream') {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
      return;
    }
  }
  
  // Check MIME type
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only programming language files are allowed.`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Export the multer instance directly
module.exports = upload; 