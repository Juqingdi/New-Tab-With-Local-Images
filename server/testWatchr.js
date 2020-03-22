// Import the watching library
var watchr = require('watchr')
 
let path = 'public';
// Create the stalker for the path
var stalker = watchr.create(path)
 
// Listen to the events for the stalker/watcher
stalker.on('change', listener)
stalker.on('log', console.log)
stalker.once('close', function (reason) {
    console.log('closed', path, 'because', reason)
    stalker.removeAllListeners()  // as it is closed, no need for our change or log listeners any more
})
 
// Set the default configuration for the stalker/watcher
stalker.setConfig({
    stat: null,
    interval: 5007,
    persistent: true,
    catchupDelay: 2000,
    preferredMethods: ['watch', 'watchFile'],
    followLinks: true,
    ignorePaths: false,
    ignoreHiddenFiles: false,
    ignoreCommonPatterns: true,
    ignoreCustomPatterns: null
})
 
// Start watching
stalker.watch(next)
 
// Stop watching
// stalker.close()