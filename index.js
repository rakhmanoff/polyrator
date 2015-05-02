#! /usr/bin/env node

'use strict';

var userArgs = process.argv.splice(2);
if (userArgs.length == 0) {
  console.log('Use an argument "-h" for the help information')
}

