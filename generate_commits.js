const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const filePath = path.join(__dirname, 'contracts', 'tippy.clar');

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

console.log('Starting 200 random commits...');

for (let i = 1; i <= 200; i++) {
    // Generate a random string to ensure the file actually changes
    const randomHex = Math.floor(Math.random() * 16777215).toString(16);
    
    // Append a comment line to the Clarity contract
    fs.appendFileSync(filePath, `\n;; random change ${randomHex}`);
    
    try {
        // Stage the file
        execSync(`git add "${filePath}"`);
        
        // Commit the change
        execSync(`git commit -m "pending changes ${i}"`);
        
        console.log(`Created commit: pending changes ${i}`);
    } catch (err) {
        console.error(`Failed at commit ${i}:`, err.message);
        break;
    }
}

console.log("Finished generating 200 commits.");
