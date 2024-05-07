import Store from './store'

export type StoreKey = string | number
export type StoreState = Record<StoreKey, any>
export type StoreAction = Record<StoreKey, Function>

export interface StoreOption<S extends StoreState, A extends StoreAction> {
  state: () => S
  actions: A & ThisType<S & A>
}

export type TStore<S extends StoreState, A extends StoreAction> = S & A & Store<S, A>

export interface Page {
  key: string
  view: {
    setData: (data: Partial<Store>) => void
    data: object
  }
}

export interface Queue {
  store: Store
  paths: Array<StoreKey>
}
