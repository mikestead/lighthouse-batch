'use strict'
require('shelljs/global');
const fs = require('fs')
const path = require('path')

const OUT = './report/lighthouse'
const REPORT_SUMMARY = 'summary.json'
const JSON_EXT = '.report.json'
const HTML_EXT = '.report.html'

execute.OUT = OUT
module.exports = execute;

function execute(options) {
  log = log.bind(log, options.verbose || false)

  const out = options.out || OUT
  const lhScript = lighthouseScript(options, log)
  const summaryPath = path.join(out, REPORT_SUMMARY)

  try {
    const files = fs.readdirSync(out)
    files.forEach(f => {
      if (f.endsWith(JSON_EXT) || f.endsWith(HTML_EXT) || f == REPORT_SUMMARY) {
        const oldFile = path.join(out, f)
        log(`Removing old report file: ${oldFile}`)
        rm('-f', oldFile)
      }
    })
  } catch(e) {}

  mkdir('-p', out)

  const count = options.sites.length
  log(`Lighthouse batch run begin for ${count} site${count > 1 ? 's' : ''}`)

  const reports = sitesInfo(options).map((site, i) => {
    const prefix = `${i + 1}/${count}: `
    const htmlOut = options.html ? ' --output html' : ''
    const filePath = path.join(out, site.file)
    const customParams = options.params || ''
    const chromeFlags = customParams.indexOf('--chrome-flags=') === -1 ? `--chrome-flags="--no-sandbox --headless --disable-gpu"` : ''
    // if gen'ing html+json reports, ext '.report.json' is added by lighthouse cli automatically,
    // so here we try and keep the file names consistent by stripping to avoid duplication
    const outputPath = options.html ? filePath.slice(0, -JSON_EXT.length) : filePath
    const cmd = `"${site.url}" --output json${htmlOut} --output-path "${outputPath}" ${chromeFlags} ${customParams}`

    log(`${prefix}Lighthouse analyzing '${site.url}'`)
    log(cmd)
    const outcome = exec(`${lhScript} ${cmd}`)
    const summary = updateSummary(filePath, site, outcome, options)

    if (summary.error) console.warn(`${prefix}Lighthouse analysis FAILED for ${summary.url}`)
    else log(`${prefix}Lighthouse analysis of '${summary.url}' complete with score ${summary.score}`)

    if (options.report === false) {
      log(`Removing generated report file '${filePath}'`)
      rm(filePath)
    }

    return summary
  })

  console.log(`Lighthouse batch run end`)
  console.log(`Writing reports summary to ${summaryPath}`)

  fs.writeFileSync(summaryPath, JSON.stringify(reports), 'utf8')
  if (options.print) {
    console.log(`Printing reports summary`)
    console.log(JSON.stringify(reports, null, 2))
  }
}

function sitesInfo(options) {
  let sites = []
  if (options.file) {
    try {
      const contents = fs.readFileSync(options.file, 'utf8')
      sites = contents.trim().split('\n')
    } catch (e) {
      console.error(`Failed to read file ${options.file}, aborting.\n`, e)
      process.exit(1)
    }
  }
  if (options.sites) {
    sites = sites.concat(options.sites)
  }
  return sites.map(url => {
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

function lighthouseScript(options, log) {
  if (options.useGlobal) {
    if (exec('lighthouse --version').code === 0) {
      log('Targeting global install of Lighthouse cli')
      return 'lighthouse'
    } else {
      console.warn('Global Lighthouse install not found, falling back to local one')
    }
  }
  let cliPath = path.resolve(`${__dirname}/node_modules/lighthouse/lighthouse-cli/index.js`)
  if (!fs.existsSync(cliPath)) {
    cliPath = path.resolve(`${__dirname}/../lighthouse/lighthouse-cli/index.js`)
    if (!fs.existsSync(cliPath)) {
      console.error(`Failed to find Lighthouse CLI, aborting.`)
      process.exit(1)
    }
  }
  log(`Targeting local Lighthouse cli at '${cliPath}'`)
  return `node ${cliPath}`
}

function siteName(site) {
  return site.replace(/^https?:\/\//, '').replace(/[\/\?#:\*\$@\!\.]/g, '_')
}

function updateSummary(filePath, summary, outcome, options) {
  if (outcome.code !== 0) {
    summary.score = 0
    summary.error = outcome.stderr
    return summary
  }
  const report = JSON.parse(fs.readFileSync(filePath))
  return {
    ...summary,
    ...getAverageScore(report)
  }
}

function getAverageScore(report) {
  let categories = report.reportCategories // lighthouse v1,2
  if (report.categories) { // lighthouse v3
    categories = Object.values(report.categories)
  }
  let total = 0
  const detail = categories.reduce((acc, cat) => {
    if (cat.id) acc[cat.id] = cat.score
    total += cat.score
    return acc
  }, {})
  return {
    score: (total / categories.length).toFixed(2),
    detail
  }
}

function log(v, msg) {
  if (v) console.log(msg)
}
