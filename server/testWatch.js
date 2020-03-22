'use strict';

var watch = require('watch')

/*watch.createMonitor('public', function (monitor) {
	// monitor.files['/home/mikeal/.zshrc'] // Stat object for my zshrc.
	monitor.on("created", function (f, stat) {
	  // Handle new files
	  console.log(f);
	})
	monitor.on("changed", function (f, curr, prev) {
	  // Handle file changes
	  console.log(f);
	})
	monitor.on("removed", function (f, stat) {
	  // Handle removed files
	  console.log(f);
	})
	// monitor.stop(); // Stop watching
})*/

watch.watchTree('public', function (f, curr, prev) {
    if (typeof f == "object" && prev === null && curr === null) {
      // Finished walking the tree
      console.log('Finished walking the tree');
    } else if (prev === null) {
      // f is a new file
      console.log(f + ' added');
    } else if (curr.nlink === 0) {
      // f was removed
      console.log(f + ' removed');
    } else {
      // f was changed
      console.log(f + ' changed');
    }
  })