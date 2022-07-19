import debounce from 'lodash/debounce'
import { add } from './lib.js'

const calc = debounce(() => {
  console.log(add(1, 2))
})

calc()