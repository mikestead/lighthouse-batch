'use strict'
require('shelljs/global');
const fs = require('fs')
const path = require('path')

const OUT = './report/lighthouse'
const REPORT_SUMMARY = 'summary.json'
const JSON_EXT = '.report.json'
const HTML_EXT = '.report.html'

execute.OUT = OUT
module.exports = execute

let hasErrored = false

function execute(options) {
  const out = options.out || OUT
  const lhc = lighthouseCmd(options)
  const summaryPath = `${out}/${REPORT_SUMMARY}`

  log = log.bind(log, options.verbose || false)

  rm('-rf', out)
  mkdir('-p', out)

  const count = options.sites.length
  log(`Lighthouse batch run begin for ${count} site${count > 1 ? 's' : ''}`)

  const reports = sitesInfo(options).map((site, i) => {
    const prefix = `${i + 1}/${count}: `
    const htmlOut = options.html ? ` --report=${out} --filename=${site.html}` : ''
    // if gen'ing html+json reports, ext '.report.json' is added by lighthouse cli automatically,
    // so here we try and keep the file names consistent by stripping to avoid duplication
    const cmd = `"${site.url}" ${htmlOut} ${options.params || ''}`
    const filePath = `${out}/${site.file}`

    log(`${prefix}Lighthouse analyzing '${site.url}'`)
    log(`${lhc} ${cmd}`)
    const outcome = exec(`${lhc} ${cmd}`)
    const summary = updateSummary(filePath, site, outcome, options)

    if (summary.error) console.warn(`${prefix}Lighthouse analysis FAILED for ${summary.url}`)
    else log(`${prefix}Lighthouse analysis of '${summary.url}' complete with score ${summary.score}`)

    return summary
  })

  log(`Lighthouse batch run end`)
  log(`Writing reports summary to ${summaryPath}`)
  fs.writeFileSync(summaryPath, JSON.stringify(reports), 'utf8')

  if (hasErrored) process.exit(1)
}

function sitesInfo(options) {
  return options.sites.map(url => {
    url = url.trim()
    if (!url.match(/^https?:/)) {
      if (!url.startsWith('//')) url = `//${url}`
      url = `https:${url}`
    }
    const name = siteName(url)
    const info = {
      url,
      name,
      file: `${name}${JSON_EXT}`
    }
    if (options.html) info.html = `${name}${HTML_EXT}`
    return info
  })
}

function lighthouseCmd(options) {
  return path.resolve(`${__dirname}/node_modules/.bin/lighthouse-ci`)
}

function siteName(site) {
  return site.replace(/^https?:\/\//, '').replace(/[\/\?#:\*\$@\!\.]/g, '_')
}

function updateSummary(filePath, summary, outcome, options) {
  if (outcome.code !== 0) {
    hasErrored = true
    summary.score = 0
    summary.error = outcome.stderr
    return summary
  }
  const report = getResults(filePath, outcome.stdout)
  summary.score = getAverageScore(report)
  return summary
}

function getResults(filePath, output) {
  const result = {}
  const re = /([a-z]+): ([0-9]+)/gi
  let m
  while (m = re.exec(output)) {
      const score = +m[2]
      result[m[1]] = score
  }
  fs.writeFileSync(filePath, JSON.stringify(result));
  return result
}

function getAverageScore(report) {
  const scores = Object.values(report)
  const total = scores.reduce((sum, score) => sum + score, 0)
  return (total / scores.length).toFixed(2)
}

function log(v, msg) {
  if (v) console.log(msg)
}
