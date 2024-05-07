import { createStore } from './index'

interface State {
  count: number
  user: {
    a: {
      b: {
        c: {
          name: string
          age: number
        }
      }
    }
  }
  d: {
    d: number
  }
  arr: [[[[string]]]]
  e: {
    f: {
      g?: Array<number>
    }
  }
}

const initialState: State = {
  count: 0,
  user: {
    a: {
      b: {
        c: {
          name: 'tom',
          age: 14,
        },
      },
    },
  },
  d: {
    d: 1,
  },
  e: {
    f: {
      g: [1, 2, 3],
    },
  },
  arr: [[[['a']]]],
}

const store = createStore({
  state: () => initialState,
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    async asyncIncrement() {
      new Promise((resolve) => {
        setTimeout(() => {
          this.count++
          store.e.f.g!.push(4)
          resolve(true)
        }, 1000)
      })
    },
  },
})

store.$bind({
  setData: (data) => {
    console.log('setData done', data)
  },
})

// for (let i = 0; i < 6; i++) {
//   store.arr[0][0][0].push(i.toString())
// }
// store.e.f.g!.push(4)
// store.e.f.g!.pop()
// delete store.e.f.g
// store.user.a.b.c.name = 'bob'

// store.$reset()
// console.log(store.count)
// console.log(store.user.a.b.c.name)
// console.log('store.count', store.count)

// store.increment()
// store.asyncIncrement()
//
// console.log('store.count', store.count)
// console.log(store)
