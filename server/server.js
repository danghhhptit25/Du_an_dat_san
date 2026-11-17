import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bookingRoutes from './routes/API.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối thành công với MongoDB');
  } catch (error) {
    console.error('❌ Lỗi kết nối', error.message);
    process.exit(1);
  }
};

app.get('/', (req, res) => {
  res.send('Server Đặt Sân Thể Thao Đang Hoạt Động!');
});

app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});