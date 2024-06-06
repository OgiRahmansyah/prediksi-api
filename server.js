const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, 
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('File bukan gambar'), false);
        }
        cb(null, true);
    }
});

function predict(imageBuffer) {
    
    const random = Math.random();
    if (random > 0.5) {
        return 'Cancer';
    } else {
        return 'Non-Cancer';
    }
}

app.post('/predict', upload.single('image'), (req, res) => {
    if (req.file) {
        try {
            const imageBuffer = req.file.buffer;
            const result = predict(imageBuffer); 
            const suggestion = result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Tetap jaga kesehatan dan lakukan pemeriksaan rutin.';

            const response = {
                status: 'success',
                message: 'Model is predicted successfully',
                data: {
                    id: uuidv4(),
                    result: result,
                    suggestion: suggestion,
                    createdAt: new Date().toISOString()
                }
            };
            res.status(200).json(response);
        } catch (error) {
            res.status(400).json({
                status: 'fail',
                message: 'Terjadi kesalahan dalam melakukan prediksi'
            });
        }
    } else {
        res.status(400).json({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi'
        });
    }
});


app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 1000000'
        });
    }

    res.status(400).json({
        status: 'fail',
        message: 'Terjadi kesalahan dalam melakukan prediksi'
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
