const tx = require('@stacks/transactions');
console.log('Includes cvToJSON:', Object.keys(tx).includes('cvToJSON'));
console.log('Includes callReadOnlyFunction:', Object.keys(tx).includes('callReadOnlyFunction'));
console.log('Includes principalCV:', Object.keys(tx).includes('principalCV'));
console.log('Includes stringAsciiCV:', Object.keys(tx).includes('stringAsciiCV'));
console.log('Includes uintCV:', Object.keys(tx).includes('uintCV'));
