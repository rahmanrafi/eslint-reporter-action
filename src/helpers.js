export const symbols = {
    'info': ':information_source:',
    'pass': ':white_check_mark:',
    'warn': ':warning:',
    'error': ':x:',
    'file': ':page_facing_up:',
    'fix': ':bulb:',
    'noFix': ':grey_question:'
}

export const github = {
    'server': process.env.GITHUB_SERVER_URL,
    'repo': process.env.GITHUB_REPOSITORY,
    'sha': process.env.GITHUB_SHA,
    'workdir': process.env.GITHUB_WORKSPACE,
    'blobSubdir': 'blob',
    'anchorPrefix': 'user-content-'
}

export const tdCenter = { 'align': 'center' }
export const fixHover = { 'title': 'ESLint reported this issue as fixable' }
export const noFixHover = { 'title': 'ESLint did not report this issue as fixable' }

/**
 * Return the provided text/raw HTML wrapped within another HTML tag 
 * 
 * @param {string} text Text (raw HTML or otherwise) perform the wrap around
 * @param {string} [tag='p'] Tag to wrap the text in
 * @param {boolean} [newline=false] Whether this new raw HTML element should terminate with a newline character
 * @param {Object} [attributes={}] HTML attributes to add to the new element
 * 
 * @returns {string} Wrapped raw HTML element
 */
export function wrap(text, tag = 'p', newline = false, attributes = {}) {
    const eol = newline ? '\n' : ''
    const attrsArray = []
    for (const [attr, val] of Object.entries(attributes)) {
        attrsArray.push(`${attr}="${val}"`)
    }
    const attrs = ` ${attrsArray.join(' ')}`
    return `<${tag}${attrs}>${text}</${tag}>${eol}`
}

/**
 * Return an HTML link, either inline or wrapped by a parent element
 * 
 * @param {string} text Text used for for the link
 * @param {string} url Full URL that this link points to (i.e., value of href)
 * @param {boolean} [inline=false] Whether this code block should be wrapped in a parent element
 * 
 * @returns {string} Link (<a> tag) raw HTML
 */
export function toLink(text, url, inline = false) {
    const link = wrap(text, 'a', undefined, { 'href': url })
    return inline ? link : wrap(link)
}

/**
 * Return an HTML formatted code block, either inline or wrapped by a parent element.
 * 
 * @param {string} text Plaintext to extract a code block from
 * @param {boolean} [inline=false] Whether this code block should be wrapped in a parent element
 * @param {string} [wrapTag='p'] If not inline, the tag for the parent element used to wrap this code block
 * @param {Object} [attrs={}] If not inline, additional HTML attributes to add to the parent element
 * 
 * @returns {string} Code block raw HTML
 */
export function toCode(text, inline = false, wrapTag = 'p', attrs = {}) {
    const codeTag = wrap(text, 'code')
    return inline ? codeTag : wrap(codeTag, wrapTag, false, attrs)
}

/**
 * Return a string with contained code blocks wrapped in HTML code tags (inline or multiline)
 * 
 * @param {string} text Source text containing code blocks to wrap
 * @param {boolean} [forceMultiline=false] Force the code block being generated to be a multiline
 * @returns {string} Text with contained code blocks wrapped in HTML code tags
 */
export function convertInlineCode(text, forceMultiline = false) {
    // This regex will at most consume 1 pair of backticks (`), stopping when EOL (with '.' matching newlines) or a specified boundary character is found.
    // This preserves any nested backticks, and prevents incorrect parsing of closing backticks as an opening backtick.
    const codeTextRegex = /`(.+?)`(?=$|\s|[\]\)\}\>\.])/gms

    // This regex will match the Unicode human readable symbols for carriage return ('CR') and/or line feed ('LF') followed by the return symbol (↲)
    // These characters are NOT equivalent to the actual, machine readable Unicode characters (i.e., 'CRLF' != \r\n)
    const crlfRegex = /([\u240D\u240A]?\u23CE)/gm

    // Since some ESLint messages can be very long, the containing GitHub table can be rendered wider than the viewport.
    // We can somewhat mitigate this by checking the length of the message and inserting a linebreak before each code block
    let br = ''
    let inline = true
    let wrapTag = undefined
    let attrs = undefined
    // let [br, inline, wrapTag, attrs] = ['', true, undefined, undefined]
    if (forceMultiline || text.length >= 100) {
        // While we're breaking up the message, we can make the separated code blocks into multiline ones with syntax highlighting,
        // and in those, insert a newline character after any carriage return and/or line feed *symbol* for visual clarity in the code block.
        text = text.replace(crlfRegex, `$1\n`)
        br = '<br>'
        inline = false
        wrapTag = 'pre'
        attrs = { 'lang': 'javascript' }
    }

    return text.replace(codeTextRegex, toCode(`${br}$1`, inline, wrapTag, attrs))
}

/**
 * Return a recursively generated an HTML unordered list from an n-dimensional array, nesting as required
 * 
 * @param {string|string[]|undefined} obj Array of strings to create a <ul> element for, or a string to create a <li> item for
 * 
 * @returns {string|undefined} Unordered list element raw HTML
 */
export function toNestedUl(obj) {
    if (Array.isArray(obj)) {
        let contents = ''
        obj.forEach((el) => {
            const childValue = toNestedUl(el)
            // Only add the child if its not undefined (since some generated subarrays might be empty, but still get iterated over)
            if (childValue) {
                contents += childValue
            }
        })
        return wrap(contents, 'ul', true)
    } else if (obj) {
        return wrap(obj.toString(), 'li', true)
    } else {
        return
    }

}

/**
 * Return a custom formatted HTML table. This function is derived from the original Summary.toTable() method from @actions/core
 * 
 * @param {Object[]} rows Array of table row contents
 * @param {string} [tableId=''] Optional id attribute to attach to the table element
 * 
 * @returns {string} Table element raw HTML
 */
export function toCustomTable(rows, tableId = '') {
    const tableBody = rows.map(row => {
        const cells = row.map(cell => {
            // Handle the scenario where the "cell" is actually an array of the cell contents and HTML attributes
            if (Array.isArray(cell) || typeof (cell) === 'string') {
                let cellAttrs = undefined
                if (Array.isArray(cell)) {
                    cellAttrs = cell[1]
                    cell = cell[0]
                }
                return wrap(cell, 'td', undefined, cellAttrs)
            }
            const { header, data } = cell
            return wrap(data, header ? 'th' : 'td')
        }).join('')
        return wrap(cells, 'tr')
    }).join('')

    const attributes = tableId ? { 'id': tableId } : {}
    return wrap(tableBody, 'table', true, attributes)
}

/**
 * Return a collapsible HTML element containing some arbitrary raw HTML element
 * 
 * @param {string} el Raw HTML element to render into a collapsible item
 * @returns {string} Collapsible element raw HTML
 */
export function toCollapsible(el) {
    return wrap(el, 'summary')
}

/**
 * Pluralize a word depending on an associated count
 * 
 * @param {number} value Count to determine pluralization
 * @param {string} noun String to pluralize
 * 
 * @returns {string} Pluralized word
 */
export function pluarlize(value, noun) {
    return value == 1 ? noun : `${noun}s`
}
