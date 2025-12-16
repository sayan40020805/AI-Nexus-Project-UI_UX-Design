const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories for different file types
    let subdir = 'general';
    console.log('File upload - fieldname:', file.fieldname, 'originalname:', file.originalname);
    
    if (file.fieldname === 'profile-pic' || file.fieldname === 'profilePicture') {
      subdir = 'profiles';
    } else if (file.fieldname === 'company-logo' || file.fieldname === 'companyLogo') {
      subdir = 'companies';
    }
    
    const fullPath = path.join(uploadsDir, subdir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const cleanFieldname = file.fieldname.replace(/-/g, '_');
    const filename = cleanFieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.fieldname === 'profile-pic' || file.fieldname === 'profilePicture' || 
      file.fieldname === 'company-logo' || file.fieldname === 'companyLogo') {
    // Allow only images for profile pics and logos
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures and company logos'), false);
    }
  } else {
    cb(null, true);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Maximum 1 file
  },
});


// Flexible upload middleware that handles optional file fields
// This middleware accepts both user and company files without role dependency
const uploadFlexible = (req, res, next) => {
  // Allow both optional file types without role checking
  upload.fields([
    { name: 'profile-pic', maxCount: 1 },
    { name: 'company-logo', maxCount: 1 }
  ])(req, res, next);
};

// Middleware functions for different upload scenarios
const uploadProfilePicture = upload.single('profile-pic');
const uploadCompanyLogo = upload.single('company-logo');
const uploadMultiple = upload.fields([
  { name: 'profile-pic', maxCount: 1 },
  { name: 'company-logo', maxCount: 1 }
]);

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ msg: 'Too many files. Maximum is 1 file.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ msg: 'Unexpected file field.' });
    }
  }
  
  if (err.message.includes('Only image files are allowed')) {
    return res.status(400).json({ msg: err.message });
  }
  
  next(err);
};

module.exports = {
  upload,
  uploadProfilePicture,
  uploadCompanyLogo,
  uploadMultiple,
  uploadFlexible, // Use this for flexible role-based uploads
  handleUploadError,
};
