export const notFound = (req, res) => {
  res.status(404).json({ message: `Không tìm thấy đường dẫn ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID không hợp lệ.' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.message || 'Lỗi server.' });
};