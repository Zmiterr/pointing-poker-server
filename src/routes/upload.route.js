const {Router} = require('express')
const fileMiddleware = require('../middleware/upload')
const router = Router();

router.post('/upload', fileMiddleware.single('avatar'),(req, res) => {
    try {
        if (req.file) {
            res.json(req.file)
            //save req.file.path
        }
    }
    catch (error) {
        console.log(error);
    }
})

module.exports = router;
