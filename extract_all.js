const fs = require('fs');
const doc = JSON.parse(fs.readFileSync('iLoveMerge.json', 'utf8'));

const result = {};

for (const [category, pagesArray] of Object.entries(doc.pages || {})) {
  if (!result[category]) result[category] = {};
  
  if (Array.isArray(pagesArray)) {
    for (const page of pagesArray) {
      if (!page || !page.data) continue;
      
      const title = page.title;
      let html = page.data.html || page.html || '';
      
      // Attempt to extract the main content using regex
      // BMSCE pages often have the content inside a "col-lg-9" or inside simple h4 / p tags
      // Let's strip all HTML to get pure text, or keep basic formatting.
      // Better yet, just find <div class="col-lg-9"> and grab its textual content, or extract paragraphs.
      
      // Let's grab all paragraphs and headings.
      const sections = [];
      const contentRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>|<p[^>]*>(.*?)<\/p>|<li[^>]*>(.*?)<\/li>/gi;
      let match;
      while ((match = contentRegex.exec(html)) !== null) {
        let text = (match[1] || match[2] || match[3] || '').replace(/<[^>]+(>|$)/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
        text = text.trim();
        if (text && !text.includes('B.M.S. College of Engineering') && !text.includes('Bangalore - 560 019') && text.length > 3) {
           sections.push(text);
        }
      }
      
      // Deduplicate consecutive elements
      const uniqueSections = sections.filter((v, i, a) => a.indexOf(v) === i);
      
      // Clean up string map keys a bit
      const safeKey = title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      
      if (uniqueSections.length > 0) {
        result[category][safeKey] = {
           title: title,
           content: uniqueSections.join('\n\n')
        };
      }
    }
  }
}

fs.writeFileSync('bmsce-website/data/bmsce_all_data.json', JSON.stringify(result, null, 2));
console.log('Successfully extracted all generic page data into bmsce_all_data.json!');
