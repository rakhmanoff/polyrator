/**
 Copyright 2015 Andrey Rakhmanov
 Use of this source code is governed by a MIT license 
 that can be found in the LICENSE file.
 */

#! /usr/bin/env node

(function() {
  'use strict';

  var dir             = require('node-dir');
  var fs              = require('fs');
  var path            = require('path');
  var rimraf          = require('rimraf');

  var WC_PREFIX       = 'wc-';
  var WC_NAME_KEY     = '{{name}}';
  var WC_DIR_MATCH    = '[\\/\\\\]' + WC_PREFIX + WC_NAME_KEY;

  var actions = {
    help: '-h',
    add: '-a',
    remove: '-r'
  };

  var templates = {
    jade:     __dirname + '/template-jade.jade',
    styl:     __dirname + '/template-stylus.stylus',
    js:       __dirname + '/template-js.js'
  };

  var generatedNames = {
    jade: 'template.jade',
    styl: 'style.styl',
    js: 'main.js'
  };

  var messages = {
    helpLink:           'Use an argument "-h" for the help information',

    helpText:           '"ptor -a your-component-name": creating a new ' + 
                        'WebComponent named wc-your-component-name in the current directory\n' + 
                        '"ptor -r your-component-name": searching a WebComponent named wc-your-component-name\n' + 
                        'in the current directory and its subdirs and removed it',

    unknownCommand:     'Unknown command. Use an argument "-h" for the help information',

    mustHaveDash:       'WebComponent name must contains "dash" (-) symbol',

    createSuccess:      'WebComponent created',

    removeSuccess:      'WebComponent removed',

    alreadyExist:       'WebComponent with the same name already exists. ' + 
                        'Remove it explicity with "-r" command and try create again',

    notFound:           'WebComponent with the name not found',

    tooManyMatches:     'There are too many components in this folder with the same name. Check it manually before removing'
  };


  function checkArguments(userArgs) {
    if (userArgs.length == 0) {
      console.log(messages.helpLink);
      return false;
    }

    if (userArgs[0] == actions.help) {
      console.log(messages.helpText);
      return false;
    }

    if (userArgs.length != 2) {
      console.log(messages.unknownCommand);
      return false;
    }

    if (userArgs[1].indexOf('-') == -1) {
      console.log(messages.mustHaveDash);
      return false;
    }

    return true;
  }

  function start() {
    var userArgs = process.argv.splice(2);

    if (checkArguments(userArgs)) {
      var command = userArgs[0],
          name = userArgs[1];

      switch (command) {
        case actions.add:
          add(name);
          break;

        case actions.remove:
          remove(name);
          break;

        default:
          console.log(messages.unknownCommand);
      }
    }
  }

  function add(name) {
    if (name.indexOf(WC_PREFIX) === 0) {
      name = name.replace(WC_PREFIX, '');
    }

    var componentDir = WC_PREFIX + name;

    if (fs.existsSync(componentDir)){
      console.log(messages.alreadyExist);
      return;
    }

    fs.mkdirSync(componentDir);

    var jadeSource = fs.readFileSync(templates.jade, 'utf8');
    var jadeResult = jadeSource.replace(WC_NAME_KEY, name);
    fs.writeFileSync(path.join(componentDir, generatedNames.jade), jadeResult);

    var stylContent = fs.readFileSync(templates.styl, 'utf8');
    fs.writeFileSync(path.join(componentDir, generatedNames.styl), stylContent);

    var jsSource = fs.readFileSync(templates.js, 'utf8');
    var jsResult = jsSource.replace(WC_NAME_KEY, name);
    fs.writeFileSync(path.join(componentDir, generatedNames.js), jsResult);

    console.log(messages.createSuccess);
  }

  function remove(name) {
    var baseDir = process.cwd();

    dir.subdirs(baseDir, function(err, dirs) {
      if (err) throw err;

      var matchTemplate = new RegExp(WC_DIR_MATCH.replace(WC_NAME_KEY, name));
      var matches = dirs.filter(function (directory) {
        return matchTemplate.test(directory);
      });

      switch (matches.length) {
        // success
        case 1: 
          rimraf.sync(matches[0]);
          console.log(messages.removeSuccess);
          break;

        // errors
        case 0:
          console.log(messages.notFound);
          break;

        default:
          console.log(messages.tooManyMatches);
          break;
      }
    });
  }

  /**
   * Execute point
   */
  start();

}());
