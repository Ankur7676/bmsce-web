const fs = require('fs');
const cheerio = require('cheerio');
const doc = JSON.parse(fs.readFileSync('../iLoveMerge.json', 'utf8'));

const result = {};

for (const [category, pagesArray] of Object.entries(doc.pages || {})) {
  if (!result[category]) result[category] = {};
  
  if (Array.isArray(pagesArray)) {
    for (const page of pagesArray) {
      if (!page || !page.html) continue;
      
      const $ = cheerio.load(page.html);
      
      // Usually, BMSCE website content is inside a .col-lg-9 or #content container. 
      // If .col-lg-9 exists, extract it. Otherwise, extract the body minus header/footer.
      let mainContent = $('div.col-lg-9').first();
      if (!mainContent.length) {
          mainContent = $('.main').first();
      }
      
      if (!mainContent.length) continue;
      
      const paragraphs = [];
      mainContent.find('p, li, h3, h4, .text-justify').each((i, el) => {
        let text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length > 5 && text.indexOf('B.M.S.') === -1 && text.indexOf('Bangalore') === -1) {
            paragraphs.push(text);
        }
      });
      
      const uniqueParagraphs = Array.from(new Set(paragraphs));
      
      let safeKey = (page.name || page.title || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      if (safeKey === '') continue;
      
      result[category][safeKey] = {
         title: page.name || page.title,
         content: uniqueParagraphs.join('\n\n')
      };
    }
  }
}

fs.writeFileSync('data/merged_bmsce_data.json', JSON.stringify(result, null, 2));
console.log('Successfully completed full deep extraction into merged_bmsce_data.json!');
