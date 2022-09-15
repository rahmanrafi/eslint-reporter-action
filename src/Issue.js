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