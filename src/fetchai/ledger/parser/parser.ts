import {ValidationError} from '../errors'
import {Address} from '../crypto/address'

const FUNC = /function ([\s\S]*?)endfunction/
const FUNC_NAME_WITH_ANNOTATION = /@[a-z0-9]+[\s]{0,}(function)+[\s]{0,}[a-z0-9]{1,}/
const PERSISTENT_STATEMENT = /persistent([\s\S]*?);/
const FUNC_NAME = /(?:function)([\s\S]*?)(?=\()/
const USE_STATEMENT = /use([\s\S]*?);/
const USE_STATEMENT_WITH_SQUARE_BRACKETS_NAME = /(?:\use).+?(?=\[)/
const BETWEEN_SQUARE_BRACKETS = /(?:\[)(.+?)(?=\])/
const BETWEEN_ROUND_BRACKETS = /(?:\()(.+?)(?=\))/
const SINGLE_LINE_COMMENT = /\/\/.*/
const MULTI_LINE_COMMENT = /\/\*([\s\S]*?)\*\//

interface FuncInfo {
    readonly identifier: string;
    readonly type: string;
}

//todo check if usestatementinfo is
interface UseStatementInfo {
    readonly sharded: boolean;
    readonly identifier: string;
    readonly params?: Array<string>;
}


export class Parser {

    static remove_comments(source: string): string {
        const regexp = RegExp(SINGLE_LINE_COMMENT, 'g')
        const regexp2 = RegExp(MULTI_LINE_COMMENT, 'g')
        source = source.replace(regexp, '')
        return source.replace(regexp2, '')
    }

    static get_functions(source: string): Array<string> {
        source = Parser.remove_comments(source)
        const regexp = RegExp(FUNC, 'g')
        const temp = [...source.matchAll(regexp)]
        const temp2 = temp.map((arr) => arr[0])
        return temp2
    }

    static get_sharded_use_names(source: string): Array<string> {
        const sharded_len = 'sharded'.length
        source = Parser.remove_comments(source)
        const regexp_func = RegExp(FUNC, 'g')
        // we don't want to look inside functions, so we remove them.
        source = source.replace(regexp_func, '')
        const regexp_persistent = RegExp(PERSISTENT_STATEMENT, 'g')
        const array = [...source.matchAll(regexp_persistent)]
        const sharded_funcs = []

        for (let i = 0; i < array.length; i++) {
            if (array[i][1].includes('sharded')) {
                let s = array[i][1].trim().slice(sharded_len)
                s = s.trim()
                const func_name = s.substr(0, s.indexOf(' '))
                sharded_funcs.push(func_name)
            }
        }
        return sharded_funcs
    }

    static get_annotations(source: string): Record<string, Array<string>> {
        source = Parser.remove_comments(source)
        const regexp = RegExp(FUNC_NAME_WITH_ANNOTATION, 'g')
        const array = [...source.matchAll(regexp)]

        const annotations: any = {}

        for (let i = 0; i < array.length; i++) {
            const split = array[i][0].split('function')
            const annotation = split[0].trim()
            const func_name = split[1].trim()
            if (typeof annotations[annotation] === 'undefined') {
                annotations[annotation] = []
            }
            annotations[annotation].push(func_name)
        }
        return annotations
    }

    static get_func_params(func_source: string): Array<FuncInfo> {
        const func_params: RegExpExecArrayOptionalItems | null = BETWEEN_ROUND_BRACKETS.exec(func_source)
        const ret: Array<any> = []
        // we start by coding only for funcs with params
        if (func_params == null) return ret

        const func_params_arr = func_params[1].split(',')
        // assumes that func param names must be unique, delete when verified this is true

        // we create an object of with function param identifiers as the keys, adn type as values
        for (let i = 0; i < func_params_arr.length; i++) {
            const [identifier, param_type] = func_params_arr[i].split(':')
            ret.push({identifier: identifier.trim(), type: param_type.trim()})
        }
        return ret
    }

    static parse_use_statements(source: string): Array<UseStatementInfo> {
        const regexp = RegExp(USE_STATEMENT, 'g')
        const use_statements = [...source.matchAll(regexp)]

        const ret: Array<any> = []

        if (use_statements === null) return ret

        for (let i = 0; i < use_statements.length; i++) {
            // if it has square brackets this should match, else it is a use without
            const s = use_statements
            // @ts-ignore
            const use_name = USE_STATEMENT_WITH_SQUARE_BRACKETS_NAME.exec(s[i])
            const obj = {} as any
            // if null then use statement has no params, so we deal with it differently.
            if (use_name === null || use_name.length < 1 || use_name[1] === null) {
                const non_paramaterized_use_name = /(?:use)([\s\S]*?)(?=;)/
                // @ts-ignore
                const identifier: RegExpExecArrayOptionalItems | null = non_paramaterized_use_name.exec(use_statements[i])

                obj.sharded = false
                obj.identifier = identifier[1].trim()
                ret.push(obj)
                continue
            }
            // all use statements with params should be sharded.
            obj.sharded = true
            obj.identifier = use_name[1].trim()
            // @ts-ignore
            const use_params = BETWEEN_SQUARE_BRACKETS.exec(use_statements[i])
            obj.params = use_params[1].split(',').map(param => param.trim())
            ret.push(obj)
        }
        return ret
    }


    static get_resource_addresses(source: string, func_name: string, ordered_args: MessagePackable): Array<string> {

        const sharded_use_names = Parser.get_sharded_use_names(source)
        // we get all functions including bodies
        const funcs = Parser.get_functions(source)

        const resource_addresses = []
        let func

        for (let i = 0; i < funcs.length; i++) {
            const name = FUNC_NAME.exec(funcs[i])[1].trim()
            // we get the whole function from the function name
            if (name == func_name) {
                func = funcs[i]
                break
            }
        }

        if (typeof func === 'undefined') {
            throw new ValidationError(`named function ${func_name} was not found in contract`)
        }

        const func_params = Parser.get_func_params(func)
        const use_statements = Parser.parse_use_statements(func)
        // we only bother with first match of use statement within each func - delete this comment if this is correct usage.
        // will mod to ad to work on all use statements

        const valid_perisistent_statements = use_statements.filter((obj) => (obj.sharded === true)).every((obj) => (sharded_use_names.includes(obj.identifier)))

        if (!valid_perisistent_statements) {
            // at least one of our parameterized use statements doesn't have an associated use statement
            throw new ValidationError('All parameterized use statements must have an associated Persistent statement stating that they are sharded ')
        }

        for (let i = 0; i < use_statements.length; i++) {

            if (!use_statements[i].sharded) {
                resource_addresses.push(use_statements[i].identifier)
                continue
            }
            for (let j = 0; j < use_statements[i].params.length; j++) {
                if (use_statements[i].params[j].startsWith('"')) {
                    // string we just add the name
                    resource_addresses.push(use_statements[i].identifier + '.' + use_statements[i].params[j].substring(1, use_statements[i].params[j].length - 1))
                } else {
                    for (let k = 0; k < func_params.length; k++) {
                        if (use_statements[i].params[j] == func_params[k].identifier) {
                            if (func_params[k].type !== 'Address' && func_params[k].type !== 'String') {
                                throw new ValidationError(`named function ${func_name} params referenced by use statements must be of type Address or String: found type ${func_params[k].type}`)
                            }

                            // if it is an address we take the display.
                            if (ordered_args[k] instanceof Address) {
                                resource_addresses.push(use_statements[i].identifier + '.' + ordered_args[k].toString())
                            } else {
                                resource_addresses.push(use_statements[i].identifier + '.' + ordered_args[k])
                            }

                        }
                    }
                }
            }
        }

        return resource_addresses
    }


}
