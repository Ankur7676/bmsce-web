const fs = require('fs');
const doc = JSON.parse(fs.readFileSync('iLoveMerge.json', 'utf8'));

fs.writeFileSync('keys.json', JSON.stringify({
  zero_about_text: doc.pages.about[0].text,
  zero_about_name: doc.pages.about[0].name,
  zero_about_title: doc.pages.about[0].title
}, null, 2));
  