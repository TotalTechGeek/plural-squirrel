
const groupMatch = /\[[^\|\[\]]*\|[^\|\[\]]*\]/
const maxGroupMatch = /\[[^\|\[\]]*\|[^\|\[\]]*\|[^\|\[\]]*\]/
const numberMatch = /\[#\]/
const argsMatch = /\[[0-9]+\]/

const joinedMatch = new RegExp(`(${groupMatch.source})|(${maxGroupMatch.source})|(${numberMatch.source})|(${argsMatch.source})`, 'g')

/**
 * Creates a function from a template string that produces output based on the number passed into it.
 * "[#] dog[|s]" would produce "1 dog" for 1, and "10 dogs" for 10.
 * You may use [#] to fetch the number passed into the function, [single|plural|zero] to optionally add text dependent
 * on whether it's singular or plural (or even zero, optionally!), and [0] or [1] to refer to any additional arguments you pass into the function.
 * @param {string|[string]} template
 * @returns {(count: number, ...args: string[]) => string}
 * @test '[#] dog[|s]' ~> 1 returns '1 dog'
 * @test '[#] dog[|s]' ~> 2 returns '2 dogs'
 * @test '[#] dog[|s]' ~> #integer returns @ === if(args.0 === 1, '1 dog', cat(args.0, ' dogs'))
 * @test 'You have [#] dog[|s] named [0]' ~> 2, 'Doug and Bill' returns 'You have 2 dogs named Doug and Bill'
 * @test 'You have [#] dog[|s] named [0]' ~> 1, 'Doug' returns 'You have 1 dog named Doug'
 * @test '[0] [1] [single|plural]' ~> 0, #string, #string returns cat(args.1, ' ', args.2, ' plural')
 */
function plural (template) {
  if (Array.isArray(template)) template = template[0]
  const terms = template.split(joinedMatch).filter(i => i)

  const termParse = term => {
    if (term === '#') return 'count'
    return JSON.stringify(term)
  }

  const func = terms.reduce((current, term) => {
    if (current) current += ' + '
    if (maxGroupMatch.test(term) || groupMatch.test(term)) {
      const arr = term.substring(1, term.length - 1).split('|')
      if (arr.length === 3) return current + '(count === 0 ? ' + termParse(arr[2]) + ': (count === 1) ? ' + termParse(arr[0]) + ' : ' + termParse(arr[1]) + ')'
      return current + '((count === 1) ? ' + termParse(arr[0]) + ' : ' + termParse(arr[1]) + ')'
    }

    if (numberMatch.test(term)) return current + 'count'

    if (argsMatch.test(term)) {
      const index = +term.substring(1, term.length - 1)
      return current + `args[${index}]`
    }

    return current + JSON.stringify(term)
  }, '')

  // Eval is definitely dangerous; but the use-case is tightly constrained. (Plus 100% Speed-Up)
  // eslint-disable-next-line no-eval
  return eval(`(count, ...args) => ${func}`)
}

/**
 * Creates a function from a template string that produces output based on the number passed into it.
 * "[#] dog[|s]" would produce "1 dog" for 1, and "10 dogs" for 10. This function also takes in a "join" string
 * to concatenate the list with.
 * You may use [#] to fetch the number passed into the function, [single|plural|zero] to optionally add text dependent
 * on whether it's singular or plural (or even zero, optionally!). [0] may be used to refer to the concatenated list.
 * @param {string} template
 * @param {string} join
 * @returns {(list: any[]) => string}
 *
 * @test 'The user[|s] in this list [is|are] banned.' ~> ['John'] returns "The user in this list is banned."
 * @test 'The user[|s] in this list [is|are] banned.' ~> ['John', 'James'] returns "The users in this list are banned."
 * @test 'The following user[|s] [is|are] banned: [0]' ~> ['Bob'] returns 'The following user is banned: Bob'
 * @test 'The following user[|s] [is|are] banned: [0]', ', ' ~> ['Bob', 'Josh'] returns 'The following users are banned: Bob, Josh'
 */
function pluralList (template, join) {
  const func = plural(template)
  return list => func(list.length, list.join(join))
}

module.exports = {
    plural,
    pluralList
}