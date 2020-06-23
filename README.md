## Lighthouse Batch Reporter

Supports executing
[Lighthouse](https://developers.google.com/web/tools/lighthouse) analysis over a
number of sites in sequence and generating a summary report including all of
their scores. Scores are calculated from the average score between Performance,
PWA, Accessibility and Best Practice and SEO sections.

Also writes out the full `json` report for each site and optionally an `html`
report too.


> Lighthouse Batch v5+ requires Node v10.13+. This is a requirement
> from the dependency on Lighthouse v5+.

## CLI

Install globally

    npm install lighthouse-batch -g

Example usage

    lighthouse-batch -s https://www.bbc.com,https://housing.com

This will generate the following files under the `/report/lighthouse` folder.

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

If you also want html reports include the `--html` option.

    housing_com.report.html   // Full html results for housing.com
    www_bbc_com.report.html   // Full html results for bbc.com

There's also the option to read site urls from a text file, one per line.

    lighthouse-batch -f sites.txt

sites.txt

```text
https://www.bbc.com
https://housing.com
```

All options

    lighthouse-batch [options]

    Options:

        -s, --sites [sites]    a comma delimited list of site urls to analyze with Lighthouse
        -f, --file [path]      an input file with a site url per-line to analyze with Lighthouse
        -p, --params <params>  extra parameters to pass to lighthouse cli for each execution e.g. -p "--perf --quiet"
        -h, --html             generate an html report alongside the json report
        -o, --out [out]        the output folder to place reports, defaults to './report/lighthouse'
        -g, --use-global       use a global lighthouse install instead of the dependency version
        -v, --verbose          enable verbose logging
        --no-report            remove individual json reports for each site
        --print                print the final summary to stdout
        --help                 output usage information

## Notes

- Chrome is run with the following flags to support the widest set of execution
  environments, including docker containers
  `--chrome-flags="--no-sandbox --headless --disable-gpu"`. You can replace
  these with your own by passing `--chrome-flags` as extra parameters. e.g.

  `--params "--chrome-flags=\"--no-sandbox --disable-gpu\""`
