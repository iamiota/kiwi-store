import { createStore } from './store'

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
  state: (): State => initialState,
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
  },
})
store.$bind({
  setData: (data) => {
    console.log('setData done', data)
  },
})

store.increment()
// console.log(store.count)
// console.log(store.user.name)
store.count = 2

for (let i = 0; i < 6; i++) {
  store.arr[0][0][0].push(i.toString())
}
store.e.f.g!.push(4)
store.e.f.g!.pop()
delete store.e.f.g

store.user.a.b.c.name = 'bob'
// store.$reset()
// console.log(store.count)
// console.log(store.user.a.b.c.name)
// console.log('store.count', store.count)
store.increment()
// console.log('store.count', store.count)
// console.log(store)
