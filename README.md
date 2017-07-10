## Lighthouse Batch Reporter

Supports executing [Lighthouse](https://developers.google.com/web/tools/lighthouse) analysis over a number of sites in sequence and
generating a summary report including all of their scores. Scores are calculated from the
average score between PWA, Performance, Accessibility and Best Practice sections.

Also writes out the full `json` report for each site and optionally an `html` report too.

## CLI

Install globally

    npm install lighthouse-batch -g

Example usage

    lighthouse-batch -s https://airhorner.com,https://housing.com

This will generate the following files under the `/report/lighthouse` folder.

    airhorner_com.report.json // Full results for airhorner.com
    housing_com.report.json   // Full results from housing.com
    summary.json              // Summary of results with scores out of 100  

If you also want html reports include the `--html` option.

    airhorner_com.report.html // Full html results for airhorner.com
    housing_com.report.html   // Full html results for airhorner.com

All options

    lighthouse-batch [options]

    Options:

      -h, --help             output usage information
      -V, --version          output the version number
      -s, --sites <sites>    a comma delimited list of site urls to analyze with Lighthouse
      -p, --params <params>  extra paramaters to pass to lighthouse cli for each execution e.g. -p "--perf --quiet"
      -h, --html             generate an html report alongside the json report
      -o, --out [out]        the output folder to place reports, defaults to './report/lighthouse'
      -g, --use-global       use a global lighthouse install instead of the dependency version
      -v, --verbose          enable verbose logging
