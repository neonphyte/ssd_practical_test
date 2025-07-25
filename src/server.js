import express from 'express';

const app = express();
const PORT = 80;

app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));

// Escape output to prevent reflected XSS
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Allowlist input validation: alphanumeric + space, 1–50 characters
function isValidInput(input) {
  const allowlistPattern = /^[a-zA-Z0-9\s]{1,50}$/;
  return allowlistPattern.test(input);
}

// Home page with optional warning
app.get('/', (req, res) => {
  const warning = req.query.warn
    ? `<p style="color:red;">Invalid input detected.</p>`
    : '';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Search</title></head>
    <body>
      <h2>Enter a search term</h2>
      ${warning}
      <form action="/search" method="POST">
        <input type="text" name="search" required />
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `);
});

// Handle form submission with validation
app.post('/search', (req, res) => {
  const search = req.body.search || '';

  // Reject input if it doesn't match allowlist pattern
  if (!isValidInput(search)) {
    return res.redirect('/?warn=1');
  }

  // Input is valid, redirect to result page
  return res.redirect(`/result?search=${encodeURIComponent(search)}`);
});

// Result page: show the valid search term
app.get('/result', (req, res) => {
  const term = req.query.search || '';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Search Result</title></head>
    <body>
      <h2>You searched for:</h2>
      <p>${escapeHtml(term)}</p>
      <form action="/" method="GET">
        <button type="submit">Return Home</button>
      </form>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
