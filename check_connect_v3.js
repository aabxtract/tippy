const connect = require('@stacks/connect');
console.log('Keys:', Object.keys(connect));
if (connect.default) {
    console.log('Default Keys:', Object.keys(connect.default));
}
