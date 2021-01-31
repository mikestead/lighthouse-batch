## Lighthouse Batch Reporter

Supports executing
[Lighthouse](https://developers.google.com/web/tools/lighthouse) analysis over a
number of sites in sequence and generating a summary report including all of
their scores. Scores are calculated from the average score between Performance,
PWA, Accessibility and Best Practice and SEO sections.

Also writes out the full `json` report for each site and optionally an `html`
report too.


> Lighthouse Batch v7+ requires Node v12+. This is a requirement
> from the dependency on Lighthouse v7+.

## CLI

Example usage

    npx lighthouse-batch -s https://www.bbc.com,https://housing.com

or install globally before use

    npm install lighthouse-batch -g
    lighthouse-batch -s https://www.bbc.com,https://housing.com

This will generate the following files under the `./report/lighthouse` folder.

    www_bbc_com.report.json   // Full results for bbc.com
    housing_com.report.json   // Full results from housing.com
    summary.json              // Summary of results with scores out of 100

Example `summary.json`

```json
[
  {
    "url": "https://www.bbc.com",
    "name": "www_bbc_com",
    "file": "www_bbc_com.report.json",
    "score": "0.64",
    "detail": {
      "performance": 0.36,
      "accessibility": 0.87,
      "best-practices": 0.71,
      "seo": 0.96,
      "pwa": 0.31
    }
  },
  {
    "url": "https://housing.com",
    "name": "housing_com",
    "file": "housing_com.report.json",
    "score": "0.71",
    "detail": {
      "performance": 0.42,
      "accessibility": 0.78,
      "best-practices": 0.93,
      "seo": 0.97,
      "pwa": 0.46
    }
  }
]
```

There's the option to read site urls from a text file, one per line.

    lighthouse-batch -f sites.txt

Example `sites.txt`:

```text
https://www.bbc.com
https://housing.com
```

If you want html reports include the `--html` option.

    housing_com.report.html
    www_bbc_com.report.html

Or add the `--csv` option for csv reports.

    housing_com.report.csv
    www_bbc_com.report.csv

You can specify budget thresholds for primary metrics. If any are not met the run will fail.

    lighthouse-batch -s https://web.dev \
        --score 92 \
        --seo 95 \
        --pwa 85 \
        --best-practices 90 \
        --accessibility 100 \
        --fail-fast

The `--fail-fast` option will error as soon as a budget is not met 
and skip pending sites.

#### All options

```console
lighthouse-batch [options]

Options:
  -V, --version                 output the version number
  -s, --sites [sites]           a comma delimited list of site urls to analyze with Lighthouse
  -f, --file [path]             an input file with a site url per-line to analyze with Lighthouse
  -p, --params <params>         extra parameters to pass to lighthouse cli for each execution e.g. -p "--perf --quiet"
  -h, --html                    generate an html report alongside the json report
  --csv                         generate a csv report alongside the json report
  -o, --out [out]               the output folder to place reports, defaults to './report/lighthouse'
  --score <threshold>           average score for each site to meet (1-100)
  --accessibility <threshold>   accessibility score for each site to meet (1-100)
  --best-practices <threshold>  best practices score for each site to meet (1-100)
  --seo <threshold>             seo score for each site to meet (1-100)
  --pwa <threshold>             pwa score for each site to meet (1-100)
  --fail-fast                   fail as soon as a budget threshold is not met
  -g, --use-global              use a global lighthouse install instead of the dependency version
  -v, --verbose                 enable verbose logging
  --no-report                   remove individual json reports for each site
  --print                       print the final summary to stdout
  -h, --help                    output usage information
```

## Notes

- Chrome is run with the following flags to support the widest set of execution
  environments, including docker containers
  `--chrome-flags="--no-sandbox --headless --disable-gpu"`. You can replace
  these with your own by passing `--chrome-flags` as extra parameters. e.g.

  `--params "--chrome-flags=\"--no-sandbox --disable-gpu\""`
