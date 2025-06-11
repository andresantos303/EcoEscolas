const multer = require('multer')
let storage = multer.memoryStorage();
// acccepts a single file upload: specifies the form field name where multer looks for the file
const multerUploads = multer({ storage }).single('image');

module.exports = multerUploads;
