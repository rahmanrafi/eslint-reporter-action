# ESLint Reporter

This action parses JSON formatted ESLint linting results into a summary for a GitHub Actions workflow step, including a summary table of linting issues, as well as more detailed views for individual files with issues.

## Inputs
### `eslint-json` (***required***)
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
    | bar.js |     0    |    0   |    ✓   |


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
      # Example step that outputs ESLint results formatted as JSON
      - name: Get JSON
        id: json
        run: echo ::set-output name=sample::$(cat sample.json)
      - name: Run ESLint Reporter Action
        uses: rahmanrafi/eslint-reporter-action@v1
        with:
          eslint-json: ${{ steps.json.outputs.sample }}
          title: ESLint Report
```

## Roadmap

Development on this action will likely be very sparse, considering this was developed for use with an internal workflow. Nonetheless, some QoL improvements might be made eventually:

- [ ] Accept paths to `.json` files located on the runner as valid input for `eslint-json` (*in progress*)
- [ ] Clean up the file names in the report to omit the working directory (*in progress*)
- [ ] Directly link to relevant files and/or lines from the linting report
- [ ] Annotate relevant code blocks (although [ataylorme/eslint-annotate-action](https://github.com/marketplace/actions/eslint-annotate-from-report-json) exists)

Alternatively, feel free to fork this action and/or submit a PR with new features or bug fixes!