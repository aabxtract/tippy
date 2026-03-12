const network = require('@stacks/network');
console.log('STACKS_MAINNET:', network.STACKS_MAINNET);
console.log('StacksNetworks:', network.StacksNetworks);
if (network.StacksNetworks) {
    console.log('StacksNetworks keys:', Object.keys(network.StacksNetworks));
}
// Try to see if StacksMainnet is a property of something else or just not exported as expected
