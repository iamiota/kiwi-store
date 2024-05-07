import type { Queue, Page, TStore, StoreKey, StoreOption, StoreState, StoreAction } from './types'
import Store from './store'

const arrayIndexL = '[[[['
const arrayIndexR = ']]]]'

const queues: Array<Queue> = []

const updateStore = () => {
  const patchs: Array<{
    view: Page
    states: Array<Queue>
  }> = []

  while (queues.length > 0) {
    const queue = queues.shift()!

    for (let i = 0; i < queue.store.__views.length; i++) {
      const view = queue.store.__views[i]

      let patchIndex = patchs.findIndex((item) => item.view === view)
      if (patchIndex === -1) {
        patchs.push({
          view,
          states: [],
        })
        patchIndex = patchs.length - 1
      }
      patchs[patchIndex].states.push(queue)
    }
  }

  for (let i = 0; i < patchs.length; i++) {
    const patch = patchs[i]
    const data = {} as Record<StoreKey, any>

    for (let l = 0; l < patch.states.length; l++) {
      const state = patch.states[l]
      const path = state.paths.reduce(
        (a, b) =>
          a +
          ((b as string).startsWith(arrayIndexL)
            ? (b as string).replace(arrayIndexL, '[').replace(arrayIndexR, ']')
            : `.${b}`),
        '',
      )

      let obj: any = state.store
      let value = undefined
      for (let j = 0; j < state.paths.length; j++) {
        const k = (state.paths[j] as string).replace(arrayIndexL, '').replace(arrayIndexR, '')
        value = obj[k]
        obj = value
      }
      data[`${patch.view.key}${path}`] = value
    }

    patch.view.view.setData(data)
  }
}

const fire = () => {
  setTimeout(() => {
    updateStore()
  })
}

export function createStore<S extends StoreState = {}, A extends StoreAction = {}>(
  option: StoreOption<S, A>,
): TStore<S, A> {
  const store = new Store<S, A>(option) as TStore<S, A>

  const variablePaths: Queue['paths'] = []
  const ignoreProps = store.__privateKeys

  let stopRecordPath = false
  let currentTarget: any

  function getHandler<T extends TStore<S, A>>() {
    const handler: ProxyHandler<T> = {
      get: (target, prop, receiver) => {
        currentTarget = target

        if ((currentTarget === store && ignoreProps.includes(prop as string)) || typeof prop === 'symbol') {
          return currentTarget[prop as string]
        }

        if (currentTarget === store) {
          variablePaths.length = 0
          stopRecordPath = false
        }

        if (ignoreProps.includes(prop as string) === false) {
          if (Array.isArray(currentTarget)) {
            if (Number.isNaN(Number(prop))) {
              stopRecordPath = true
            }
          }
          if (typeof currentTarget[prop as string] !== 'function') {
            if (stopRecordPath === false) {
              variablePaths.push(
                Array.isArray(currentTarget) ? `${arrayIndexL}${[prop]}${arrayIndexR}` : (prop as string),
              )
            }
          }
        }

        const value = Reflect.get(target, prop, receiver)

        if (typeof value === 'object' && value !== null) {
          return new Proxy(value, getHandler<typeof value>())
        }

        return value
      },
      set: (target, prop, value, receiver) => {
        if (target === store) {
          if (ignoreProps.includes(prop as string) || typeof prop === 'symbol') {
            return Reflect.set(target, prop, value, receiver)
          }

          variablePaths.length = 0
          stopRecordPath = false
        }

        if (stopRecordPath === false) {
          if (variablePaths.length > 0) {
            if (currentTarget !== target) {
              variablePaths.push(prop as string)
            }
          } else {
            variablePaths.push(prop as string)
          }
        }

        if (variablePaths.length > 0) {
          queues.push({
            store,
            paths: [...variablePaths],
          })
          fire()
        }

        return Reflect.set(target, prop, value, receiver)
      },
      deleteProperty: (target, prop) => {
        if (target === store && ignoreProps.includes(prop as string)) {
          return Reflect.deleteProperty(target, prop)
        }

        queues.push({
          store,
          paths: [...variablePaths],
        })

        fire()

        return Reflect.deleteProperty(target, prop)
      },
    }
    return handler
  }

  return new Proxy(store, getHandler<typeof store>()) as TStore<S, A>
}
