// src/index.ts
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello izumi!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
