const multer = require('multer');

const storage = multer.diskStorage({
  destination(request, file, cb) { // Куда складывать файл
    cb(null, 'images');
  },
  filename(request, file, cb) { // Как его назвать
    cb(null, `${new Date().toISOString()}-${file.originalname}`);
  },
});

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (request, file, cb) => {
  const isAllowed = allowedTypes.includes(file.mimetype);

  cb(null, isAllowed);
};

module.exports = multer({
  storage,
  fileFilter,
});
