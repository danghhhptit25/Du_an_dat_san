import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true },
    courtId: { type: String, required: true },
    date: { type: String, required: true },      
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true },   
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Confirmed',
    },
  },
  { timestamps: true }
);

export default mongoose.model('booking', bookingSchema);