import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import apiRoutes from './routes/API.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server Đặt Sân Thể Thao Đang Hoạt Động!');
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối thành công với MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Lỗi kết nối', error.message);
    process.exit(1);
  }
};

startServer();