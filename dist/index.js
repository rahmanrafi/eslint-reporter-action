/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 493:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Issue = __nccwpck_require__(503);

module.exports = class File {
    constructor(data) {
        this.path = data.filePath
        this.errorCount = data.errorCount
        this.fatalErrorCount = data.fatalErrorCount
        this.warningCount = data.warningCount
        this.issues = data.messages.map(message => new Issue(message))
        this.pass = this.issues.length == 0
    }

    /**
     * Return a Markdown formatted section containing a heading and table about 
     * this File and associated ESLint issues. Trailing newlines are omitted.
     * 
     * @returns     Markdown formatted section
     */
    toSection() {
        return `${this.toHeading}\n${this.toTable}`
    }

    /** 
     * Return a Markdown formatted table containing all ESLint 
     * issues found within this File. Trailing newlines are omitted.
     * 
     * @returns {string}    Markdown formatted table
     */
    toTable() {
        let markdownTable = this.pass ? '' : '|Line|Column|Message|Issue Type|Severity|Rule ID\n----'
        for (const issue in this.issues) {
            markdownTable += `\n${issue.genRow()}`
        }
    }

    /**
     * Return a Markdown formatted heading string 
     * for this File. Trailing newlines are omitted.
     * 
     * @returns {string}    Markdown formatted heading
     */
    toHeading() {
        let heading = `### ${this.path}: `
        let issueCountHeadings = []
        if (this.errorCount) {
            let descriptor = this.errorCount == 1 ? 'error' : 'errors'
            let errorsHeading = `${this.errorCount} ${descriptor} `
            // If fatal errors exist, include them with the normal error counts. e.g., 4 errors (1 fatal)
            if (this.fatalErrorCount) {
                errorsHeading += `(${this.fatalErrorCount} fatal) `
            }
            issueCountHeadings.push(errorsHeading)
        }

        if (this.warningCount) {
            let descriptor = this.warningCount == 1 ? 'warning' : 'warnings'
            let warningsHeading = `${this.warningCount} ${descriptor}`
            issueCountHeadings.push(warningsHeading)
        }

        heading += issueCountHeadings.join(', ')
        return heading
    }

    /**
     * Return a Markdown formatted table row containing 
     * information about this File. Trailing newlines are omitted.
     * 
     * @returns {string}    Markdown formatted table row
     */
    toRow() {
        let passSymbol = this.pass ? ':heavy_check_mark:' : ':x:'
        let errorTotals = this.fatalErrorCount ? `${this.errorCount} (${this.fatalErrorCount})` : this.errorCount
        // Parent table headings: | File | Warnings | Errors | Result |
        let fileSummary = [this.filePath, this.warningCount, errorTotals, passSymbol]
        return `|${fileSummary.join('|')}|`
    }
}

/***/ }),

/***/ 503:
/***/ ((module) => {

module.exports = class Issue {
    constructor(data) {
        // Escape any pipe characters "|" that might exist in string 
        // data to prevent conflicts with GitHub Markdown's table syntax
        this.ruleId = data.ruleId.replace(/\|/g, '\|')
        this.message = data.message.replace(/\|/g, '\|')
        this.messageType = data.messageId.replace(/\|/g, '\|')
        this.severity = data.severity
        this.lnRange = [data.line, data.endLine]
        this.colRange = [data.column, data.endColumn]
    }

    /** 
     * Return a Markdown formatted row containing 
     * information about this Issue. Trailing newlines are omitted.
     * 
     * @returns {string}    Markdown formatted table row
     */
    toRow() {
        let lnAbbrev = this.lnRange[0] == this.lnRange[1] ? this.lnRange[0] : this.lnRange.join(':')
        let markdownRow = [lnAbbrev, this.colRange[0], this.message, this.messageType, this.severity, this.ruleId]
        return `|${markdownRow.join('|')}|`
    }
}

/***/ }),

/***/ 442:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 671:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(442);
const github = __nccwpck_require__(671);
const File = __nccwpck_require__(493)


try {
  // Debugging. Remove before production.
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`Event payload: ${payload}`)
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
  let summaryTable = '\n\n|File|Warnings|Errors|Result|\n----'
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

})();

module.exports = __webpack_exports__;
/******/ })()
;