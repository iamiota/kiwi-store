import type { Queue, IView, TStore, StoreKey, StoreOption, StoreStateOption, StoreActionOption } from './types'

const queues: Array<Queue> = []

const updateStore = () => {
  const patchs: Array<{
    view: IView
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
    const data = {}

    for (let l = 0; l < patch.states.length; l++) {
      const state = patch.states[l]
      const path = state.paths
        .map((item) =>
          (item as string).startsWith('[[[[') ? (item as string).replace('[[[[', '[').replace(']]]]', ']') : `.${item}`,
        )
        .join('')
        .replace('.', '')
      let obj: any = state.store
      let value = undefined
      for (let j = 0; j < state.paths.length; j++) {
        const k = (state.paths[j] as string).replace('[[[[', '').replace(']]]]', '')
        value = obj[k]
        obj = value
      }
      data[path] = value
    }

    patch.view.setData(data)
  }
}

const fire = () => {
  setTimeout(() => {
    updateStore()
  })
}

export function createStore<S extends StoreStateOption = {}, A extends StoreActionOption = {}>(
  option: StoreOption<S, A>,
): TStore<S, A> {
  const store = new Store<S, A>(option) as TStore<S, A>

  const variablePaths: Queue['paths'] = []
  const ignoreProps = store.__privateKeys

  let stopRecordPath = false
  let currentReceiver: any

  function getHandler<T extends object | TStore<S, A>>() {
    const handler: ProxyHandler<T> = {
      get: (target, prop, receiver) => {
        currentReceiver = target
        if (target === store) {
          variablePaths.length = 0
          stopRecordPath = false
        }

        if (ignoreProps.includes(prop as string) === false) {
          if (Array.isArray(target)) {
            if (Number.isNaN(Number(prop))) {
              stopRecordPath = true
            }
          }
          if (typeof target[prop] !== 'function') {
            if (stopRecordPath === false) {
              variablePaths.push(Array.isArray(target) ? `[[[[${[prop]}]]]]` : (prop as string))
            }
          }
        }

        // console.log('get', prop)

        const value = Reflect.get(target, prop, receiver)

        if (typeof value === 'object' && value !== null) {
          return new Proxy(value, getHandler<typeof value>())
        }

        return value
      },
      set: (target, prop, value, receiver) => {
        if (ignoreProps.includes(prop as string)) {
          return false
        }

        if (stopRecordPath === false) {
          if (variablePaths.length > 0) {
            if (currentReceiver !== target) {
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
        if (ignoreProps.includes(prop as string)) {
          return false
        }

        queues.push({
          store,
          paths: [...variablePaths],
        })

        fire()

        // console.log('delete', variablePaths)

        return Reflect.deleteProperty(target, prop)
      },
    }
    return handler
  }

  return new Proxy(store, getHandler<typeof store>())
}

class Store<S extends StoreStateOption = {}, A extends StoreActionOption = {}> {
  __isKiwiStore: boolean = true
  __state: () => S
  __views: Array<IView> = []
  __privateKeys: Array<StoreKey> = []

  constructor(option: StoreOption<S, A>) {
    this.__state = option.state
    this.__privateKeys = [...Object.keys(this), ...Object.getOwnPropertyNames(Store.prototype)]

    Object.assign(this, {
      ...option.state(),
      ...option.actions,
    })
  }

  $bind(view: IView) {
    this.__views.push(view)
  }

  $unbind(view: IView) {
    this.__views = this.__views.filter((item) => item !== view)
  }

  $reset() {
    Object.assign(this, {
      ...this.__state(),
    })
  }
}

export default Store
