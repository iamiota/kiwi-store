import Store from './store'

export type StoreKey = string | number
export type StoreStateOption = Record<StoreKey, any>
export type StoreActionOption = Record<StoreKey, Function>

export interface StoreOption<S extends StoreStateOption, A extends StoreActionOption> {
  state: () => S
  actions: A
}

export type TStore<S extends StoreStateOption, A extends StoreActionOption> = S & A & Store<S, A>

export interface IView {
  setData: (data: object) => void
}

export interface Queue {
  store: TStore<{}, {}>
  paths: Array<StoreKey>
}
