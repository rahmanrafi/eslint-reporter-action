const Issue = require('./Issue.js');

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