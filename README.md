# ESLint Reporter

This action parses JSON formatted ESLint linting results into a GitHub flavored Markdown summary report, including a summary table of linting issues, as well as more detailed views for individual files with issues. This report can either be uploaded as an `.md` artifact, or added as a summary to the relevant job in your Actions run.

## Inputs

### `eslint-json`

**Required** ESLint linting results, formatted using ESLint's [built in `json` formatter](https://eslint.org/docs/latest/user-guide/formatters/#json) (**not** the `json-with-metadata` formatter).

## Outputs

### `report`

The GitHub flavored Markdown report that was generated.

The general structure of the report is as follows:
```md
// example.md

# ESLint Report

|  File  | Warnings | Errors | Result |
|--------|----------|--------|--------|
| foo.js |     1    |  3(1)  |    X   |
| bar.js |     0    |    0   |    ✓   |


## foo.js: 1 warning, 3 errors (1 fatal)

| Line | Column |  Message  |  Issue Type  | Severity | Rule ID  |
|------|--------|-----------|--------------|----------|----------|
|  12  |    4   | a warning | warning type |     1    | prettier |
| ...  |   ...  |    ...    |     ...      |    ...   |  ...etc. |

```
## Example Workflow

```yaml
# ./github/workflows/example.yml

on: [push]

jobs:
  eslint-reporter:
    runs-on: ubuntu-latest
    name: Example ESLint Reporter Usage
    steps:
      - name: Checkout # Only required if this action is cloned within within a private repo
        uses: actions/checkout@v3
      - name: Get JSON # Example step that produces and outputs JSON
        id: json
        run: echo ::set-output name=sample::$(cat sample.json)
      - name: Run ESLint Reporter Action
        uses: ./
        with:
          eslint-json: ${{ steps.json.outputs.sample }}
```
