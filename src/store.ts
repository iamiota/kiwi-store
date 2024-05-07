import type { Page, StoreKey, StoreOption, StoreState, StoreAction } from './types'

class Store<S extends StoreState = {}, A extends StoreAction = {}> {
  __isKiwiStore: boolean = true
  __state: () => S
  __views: Array<Page> = []
  __privateKeys: Array<StoreKey> = []

  constructor(option: StoreOption<S, A>) {
    this.__state = option.state
    this.__privateKeys = [...Object.keys(this), ...Object.getOwnPropertyNames(Store.prototype)]

    Object.assign(this, {
      ...option.state(),
      ...option.actions,
    })
  }

  $bind(view: Page['view'], key: Page['key']) {
    this.__views.push({
      key,
      view,
    })
    view.setData({ [key]: this.__state() })
  }

  $unbind(view: Page['view']) {
    this.__views = this.__views.filter((item) => item.view !== view)
  }

  $reset() {
    Object.assign(this, {
      ...this.__state(),
    })
  }
}

export default Store
