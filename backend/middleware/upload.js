const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Root uploads directory
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// =========================
// MULTER STORAGE
// =========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Default subdir
    let subdir = 'general';

    // Profile and company assets
    if (file.fieldname === 'profile-pic' || file.fieldname === 'profilePicture') {
      subdir = 'profiles';
    } else if (file.fieldname === 'company-logo' || file.fieldname === 'companyLogo') {
      subdir = 'companies';
    } else {
      // Route post media into posts/images, posts/videos, or posts/audio based on mimetype
      if (file.mimetype && file.mimetype.startsWith('image/')) {
        subdir = 'posts/images';
      } else if (file.mimetype && file.mimetype.startsWith('video/')) {
        subdir = 'posts/videos';
      } else if (file.mimetype && file.mimetype.startsWith('audio/')) {
        subdir = 'posts/audio';
      } else {
        subdir = 'posts/general';
      }
    }

    const fullPath = path.join(uploadsDir, subdir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname.replace(/-/g, '_');
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

// =========================
// FILE FILTER
// =========================
const fileFilter = (req, file, cb) => {
  if (
    file.fieldname === 'profile-pic' ||
    file.fieldname === 'profilePicture' ||
    file.fieldname === 'company-logo' ||
    file.fieldname === 'companyLogo'
  ) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(
        new Error('Only image files are allowed for profile pictures and company logos'),
        false
      );
    }
  }
  cb(null, true);
};

// =========================
// MULTER INSTANCE
// =========================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 2, // ✅ IMPORTANT: allow up to 2 files
  },
});

// =========================
// FLEXIBLE UPLOAD (USED IN AUTH)
// =========================
const uploadFlexible = (req, res, next) => {
  upload.fields([
    // Accept both dash-separated and camelCase field names from frontend
    { name: 'profile-pic', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
    { name: 'company-logo', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
  ])(req, res, next);
};

// =========================
// ERROR HANDLER
// =========================
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'File too large. Max size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ msg: 'Too many files uploaded.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ msg: 'Unexpected file field.' });
    }
  }

  if (err?.message?.includes('Only image files')) {
    return res.status(400).json({ msg: err.message });
  }

  next(err);
};

module.exports = {
  upload,
  uploadFlexible,
  handleUploadError,
};
