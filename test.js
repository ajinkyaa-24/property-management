const fs = require('fs');
let content = fs.readFileSync('static/index.html', 'utf8');
content = content.replace(
  "throw new Error((await res.json()).detail || 'Request failed');",
  "const err = await res.json(); throw new Error(err.detail ? JSON.stringify(err.detail) : 'Request failed');"
);
fs.writeFileSync('static/index.html', content);
