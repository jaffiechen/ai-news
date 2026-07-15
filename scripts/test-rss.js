async function test() {
  const r = await fetch('https://openai.com/blog/rss.xml', {headers:{'User-Agent':'test'}});
  const t = await r.text();
  
  console.log('Content length:', t.length);
  console.log('First 500 chars:', t.substring(0, 500));
  
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  let count = 0;
  
  while ((match = itemRegex.exec(t)) !== null) {
    count++;
    if (count <= 3) {
      console.log('\nItem ' + count + ' content:');
      console.log(match[1].substring(0, 200));
    }
  }
  console.log('\nTotal items found:', count);
  
  const testItem = match ? match[1] : '';
  console.log('\n--- Testing extractTag ---');
  
  function extractTag(content, tag) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
    const match = content.match(regex);
    return match ? match[1] : '';
  }
  
  const sampleItem = '<title><![CDATA[Test Title]]></title><link>https://example.com</link>';
  console.log('Sample title:', extractTag(sampleItem, 'title'));
  console.log('Sample link:', extractTag(sampleItem, 'link'));
}

test().catch(e => console.error(e));