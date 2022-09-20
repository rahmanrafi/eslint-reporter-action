export const symbols = {
    'info': ':information_source:', 
    'pass': ':white_check_mark:',
    'warn': ':warning:', 
    'error': ':x:'
}

export function toCode(text, inline=false) {
    let codeText = `<code>${text}</code>`
    return inline ? codeText : wrap(codeText)
}

export function toLink(text, uri) {
    return wrap(`<a href="${uri}>${text}</a>`)
}

export function convertInlineCode(text) {
    return text.replace(/`(.+?)`/mg, toCode('$1', true))
}

function wrap(text) {
    return`<p>${text}</p>`
}