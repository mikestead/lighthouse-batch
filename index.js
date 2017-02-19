'use strict'
require('shelljs/global');
const fs = require('fs')
const path = require('path')

const OUT = './report'
const REPORT_SUMMARY = 'summaries.json'

execute.OUT = OUT
module.exports = execute;

function execute(options) {
  const out = options.out || OUT
  const lhc = lighthouseCmd(options)
  const summaryPath = `${out}/${REPORT_SUMMARY}`

  log = log.bind(log, options.verbose || false)

  rm('-rf', out)
  mkdir('-p', out)

  const count = options.sites.length
  log(`Lighthouse batch run begin for ${count} site${count > 1 ? 's' : ''}`)

  const reports = sitesInfo(options.sites).map((site, i) => {
    const filePath = `${out}/${site.file}`
    const prefix = `${i + 1}/${count}: `
    const cmd = `${site.url} --output json --output-path ${filePath} ${options.params}`

    log(`${prefix}Lighthouse analyzing '${site.url}'`)
    log(cmd)

    const outcome = exec(`${lhc} ${cmd}`)
    const summary = updateSummary(filePath, site, outcome)

    if (summary.error) console.warn(`${prefix}Lighthouse analysis FAILED for ${summary.url}`)
    else log(`${prefix}Lighthouse analysis of '${summary.url}' complete with score ${summary.score}`)

    return summary
  })

  log(`Lighthouse batch run end`)
  log(`Writing reports summary to ${summaryPath}`)
  fs.writeFileSync(summaryPath, JSON.stringify(reports), 'utf8')
}

function sitesInfo(sites) {
  return sites.map(url => {
    url = url.trim()
    if (!url.match(/^https?:/)) {
      if (!url.startsWith('//')) url = `//${url}`
      url = `https:${url}`
    }
    const name = siteName(url)
    return {
      url,
      name,
      file: `${name}.json`
    }
  })
}

function lighthouseCmd(options) {
  if (options.useGlobal) {
    if (exec('lighthouse --version').code === 0) {
      return 'lighthouse '
    } else {
      console.warn('Global Lighthouse install not found, falling back to local one')
    }
  }
  let cliPath = path.resolve(`${__dirname}/node_modules/lighthouse/lighthouse-cli/index.js`)
  if (!fs.existsSync(cliPath)) {
    cliPath = path.resolve(`${__dirname}/../node_modules/lighthouse/lighthouse-cli/index.js`)
    if (!fs.existsSync(cliPath)) {
      console.error(`Faild to find Lighthouse CLI, aborting.`)
      process.exit(1)
    }
  }
  return cliPath
}

function siteName(site) {
  return site.replace(/^https?:\/\//, '').replace(/[\/\?#:\*\$@\!\.]/g, '_')
}

function updateSummary(filePath, summary, outcome) {
  if (outcome.code !== 0) {
    summary.score = 0
    summary.error = outcome.stderr
    return summary
  }
  const results = JSON.parse(fs.readFileSync(filePath))
  summary.score = calculateTotalScore(results)
  return summary
}

function calculateTotalScore(results) {
  const scoredAggregations = results.aggregations.filter(a => a.scored)
  const total = scoredAggregations.reduce((sum, aggregation) => sum + aggregation.total, 0)
  return (total / scoredAggregations.length) * 100
}

function log(v, msg) {
  if (v) console.log(msg)
}