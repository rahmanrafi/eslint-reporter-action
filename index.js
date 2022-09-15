const core = require('@actions/core');
const github = require('@actions/github');
const File = require('./src/File.js')


try {
  // Debugging. Remove before production.
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`Event payload: ${payload}`)
  // Action expects input to be a stringified JSON object. Invalid inputs will result in exceptions.
  const eslintInput = core.getInput('eslint-json')
  const root = JSON.parse(eslintInput)

  /*
  Markdown report structure (indented for clarity):
    <Report title>
    <ESLint summary table>
    <Section(s) for each file with issues>
      <File heading>
      <File issues table>
    <EOF>
  */
  let markdownReport = '## ESLint Report'
  let summaryTable = '\n\n|File|Warnings|Errors|Result|\n|---|---|---|---|'
  let fileSections = []
  let files = root.map(data => new File(data))

  for (const file of files) {
    summaryTable += `\n${file.toRow()}`
    if (!file.pass) {
      fileSections.push(file.toSection())
    }
  }
  markdownReport += `${summaryTable}\n\n`
  markdownReport += `${fileSections.join('\n\n')}`

  console.log(`Generated Markdown report:\n${markdownReport}`)
  core.setOutput('report', markdownReport)
} catch (error) {
  core.setFailed(error.message);
}
