#!/usr/bin/env node
'use strict'

const program = require('commander')
const execute = require('./index')

program
  .version(require('./package.json').version)
  .option('-s, --sites <sites>', 'a comma delimited list of site urls to analyze with Lighthouse', (str) => str.split(','), [])
  .option('-p, --params <params>', 'extra parameters to pass to lighthouse cli for each execution e.g. -p "--perf --quiet"', null, '')
  .option('-h, --html', 'generate an html report alongside the json report')
  .option('-o, --out [out]', `the output folder to place reports, defaults to '${execute.OUT}'`)
  .option('-v, --verbose', 'enable verbose logging')
  .parse(process.argv)

execute(program)
