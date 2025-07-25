import express from 'express';

const app = express();
const PORT = 80;

app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
