const multer = require('multer')

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'images/')
    },
    filename(req, file, cb) {
        cb(null, new Date().toISOString()+'-'+file.originalname)
    }
});

const types = ['image/png','image/jpeg','image/jpg'];

function fileFilter (req, file, cb) {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted

    if(types.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, true)
    }

    // To reject this file pass `false`, like so:
    //cb(null, false)

    // To accept the file pass `true`, like so:
    //cb(null, true)

    // You can always pass an error if something goes wrong:
    //cb(new Error('I don\'t have a clue!'))

}

module.exports = multer(storage)
