declare module '@User' {
  import type { say } from './test1'
  export const hh = 'aaaa'
  export const sayFn: say  = (word) => {
    console.log(word,'word');
  }
}
