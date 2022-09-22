# ESLint Reporter

This action parses JSON formatted ESLint linting results into a summary for a GitHub Actions workflow step, including a summary table of linting issues, as well as more detailed views for individual files with issues.

## Inputs
### `json` (***required***)
ESLint linting results, formatted using ESLint's [built in `json` formatter](https://eslint.org/docs/latest/user-guide/formatters/#json) (**not** the `json-with-metadata` formatter).

### `title`
Title to use for the generated report. The default is `ESLint Report`.

## Outputs
### `report`
The GitHub flavored Markdown report that was generated.

The general structure of the report produced (as raw Markdown):

    # ESLint Report

    |  File  | Warnings | Errors | Result |
    |--------|----------|--------|--------|
    | foo.js |     1    |  3(1)  |    X   |
    | bar.js |     0    |    0   |   v/   |


    ## foo.js: 1 warning, 3 errors (1 fatal)

    | Line    | Column |  Message  |  Issue Type  | Severity      | Rule ID  |
    |---------|--------|-----------|--------------|---------------|----------|
    |     12  |    4   | a warning | warning type |     Warning   | prettier |
    |  14:16  |    2   |    ...    |     ...      |      ...      | etc...   |

## Example Usage
```yaml title=./github/workflows/example.yml
on: [push]

jobs:
  eslint-reporter:
    runs-on: ubuntu-latest
    name: Example ESLint Reporter Usage
    steps:
      - name: Get JSON
        id: json
        run: echo ::set-output name=sample::$(cat sample.json)
      - name: Run ESLint Reporter Action (using JSON string)
        uses: rahmanrafi/eslint-reporter-action@v1
        with:
          json: ${{ steps.json.outputs.sample }}
          title: ESLint Report
      - name: Run ESLint Reporter Action (using JSON file)
        uses: rahmanrafi/eslint-reporter-action@v1
        with:
          json: ./sample.json
          title: ESLint Report
```

## Roadmap

Development on this action will likely be very sparse, considering this was developed for internal use at [Qlik](https://github.com/qlik-oss). If you notice a bug, or build on top of this, please feel free to file an issue and/or submit a PR. 