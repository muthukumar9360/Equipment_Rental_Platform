const fs = require('fs');
const content = fs.readFileSync('Marketplace.jsx', 'utf8').split('\n');

const part1 = content.slice(0, 108); // lines 0-107 (up to </div>)
const part2 = content.slice(112, 213); // lines 112-212 (search block)
const part3 = content.slice(108, 112); // lines 108-111 (HeroShowcase & FeaturedCategories)
const part4 = content.slice(213); // lines 213-end

const newContent = [...part1, ...part2, ...part3, ...part4].join('\n');
fs.writeFileSync('Marketplace.jsx', newContent, 'utf8');
console.log('Success');
