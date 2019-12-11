const REGEX_FUNC = /function([\s\S]*?)endfunction/
const REGEX_FUNC_NAME_WITH_ANNOTATION = /@[a-z0-9]+[\s]{0,}(function)+[\s]{0,}[a-z0-9]{1,}/
const REGEX_PERSISTENT = /persistent([\s\S]*?);/
const REGEX_USE =  /use([\s\S]*?);/
const REGEX_USE_NAME = /(?<=\use).+?(?=\[)/
const REGEX_BETWEEN_SQUARE_BRACKETS = /(?<=\[).+?(?=\])/
const REGEX_BETWEEN_ROUND_BRACKETS = /(?<=\().+?(?=\))/
const REGEX_COMMENT = /\/.*/

export class Parser {
// get names of all annotted functions
// any annotation and lsit of functions names

//     static function main(source){
//
// }

    static remove_comments(source){
         const regexp = RegExp(REGEX_COMMENT,'g')
         return source.replace(regexp, '')
    }


    static get_functions(source) {
        source = Parser.remove_comments(source)
        const regexp = RegExp(REGEX_FUNC,'g');
        return [...source.matchAll(regexp)]
    }

    static get_sharded_use_names(source) {
        const sharded_len = 'sharded'.length
        source = Parser.remove_comments(source)
        const regexp_func = RegExp(REGEX_FUNC,'g');
        // we don't want to look inside functions, so we remove them.
        source = source.replace(regexp_func, '')
        const regexp_persistent = RegExp(REGEX_PERSISTENT,'g');
        let array = [...source.matchAll(regexp_persistent)]
        let sharded_funcs = []

        for (let i = 0; i < array.length; i++) {
            // let s = array[i].slice(persistent_len).trim()
            if (array[i][1].includes('sharded')) {
                let s = array[i][1].trim().slice(sharded_len)
                s = s.trim()
                let func_name = s.substr(0, s.indexOf(' '))
                sharded_funcs.push(func_name)
            }
        }
        return sharded_funcs
    }

    static get_annotations(source) {
         source = Parser.remove_comments(source)
         const regexp = RegExp(REGEX_FUNC_NAME_WITH_ANNOTATION,'g');
         let array = [...source.matchAll(regexp)]

        const annotations = {}

        for (let i = 0; i < array.length; i++) {
            let split = array[i][0].split('function')
            let annotation = split[0].trim()
            let func_name = split[1].trim()
            if (typeof annotations[annotation] === 'undefined') {
                annotations[annotation] = []
            }
            annotations[annotation].push(func_name)
        }
        return annotations
    }


// param is array of functions as strings
    static get_rescource_addresses(source) {
        const funcs = Parser.get_functions(source)

       let rescource_addresses = [];

        for (let i = 0; i < funcs.length; i++) {

            let func_params = REGEX_BETWEEN_ROUND_BRACKETS.exec(funcs[i])
            let func_params_arr = func_params.split(',');
            // assumes that func param names must be unique, delete when verified this is true
            let func_params_obj = {}

            for (let i = 0; i < func_params_arr.length; i++) {
                let [param_type, identifier] = func_params_arr.split(':');
                func_params_obj[identifier] = param_type;
            }

            // we only bother with first match of use statement within each func - delete this comment if this is correct usage
            let use = REGEX_USE.exec(funcs[i]);
            if(use === null) continue;
            let use_params = REGEX_BETWEEN_SQUARE_BRACKETS.exec(use[0])
            let use_params_arr = use_params.split(',');

            for (let i = 0; i < funcs.length; i++) {
                // won't actually work just to see
                if(typeof funcs[i] === 'string'){
                       rescource_addresses.push(use_params[i])
                } else {
                       func_params_obj[funcs[i]]
                }
            }
        }
    }



}
