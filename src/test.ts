import { createStore } from './index'

interface User {
  name: string
  age: number
}

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
      g?: Array<User>
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
      g: [
        {
          name: 'tom',
          age: 14,
        },
        {
          name: 'jerry',
          age: 15,
        },
        {
          name: 'bob',
          age: 16,
        },
      ],
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
          store.e.f.g!.push({
            name: 'tom',
            age: 14,
          })
          resolve(true)
        }, 1000)
      })
    },
  },
})

store.$bind(
  {
    data: {},
    setData: (data) => {
      console.log('setData done', data)
    },
  },
  'appStore',
)

const arr = store.e.f.g!.map((item) => item)
for (let i = 0; i < arr.length; i++) {
  arr[i].age = i
}
// store.e.f.g = []
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
