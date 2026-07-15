import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const outputDir = join(process.cwd(), 'public', 'data');

function fixFutureDates(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const now = new Date();
    let fixedCount = 0;

    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.published_at) {
          const pubDate = new Date(item.published_at);
          if (!isNaN(pubDate.getTime()) && pubDate.getTime() > now.getTime() + 60 * 60 * 1000) {
            console.log(`  Fixing future date: ${item.title.substring(0, 50)}...`);
            console.log(`    Original: ${item.published_at}`);
            item.published_at = now.toISOString();
            console.log(`    Fixed to: ${item.published_at}`);
            fixedCount++;
          }
        }
      }
    }

    if (fixedCount > 0) {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`✅ Fixed ${fixedCount} items with future dates in ${filePath}`);
    } else {
      console.log(`✅ No future dates found in ${filePath}`);
    }
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e);
  }
}

console.log('🔍 Checking for future dates in data files...\n');

fixFutureDates(join(outputDir, 'latest-24h.json'));
fixFutureDates(join(outputDir, 'latest-7d.json'));
fixFutureDates(join(outputDir, 'archive.json'));

console.log('\n✅ Done!');
