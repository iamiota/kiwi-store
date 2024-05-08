# Kiwi Store

一个在小程序环境中使用的状态管理库，基于TypeScript。

## Installation

Install through npm:

```
npm install --save kiwi-store
```

Install through yarn:

```
yarn add kiwi-store
```

## Usage

```typescript
/// appStore.ts
import { createStore } from 'kiwi-store'

/// state中的任一层级的key只可以使用string或者number类型，不可以使用symbol类型
const appStore = createStore({
  state: () => ({
    user: {
      name: 'tom',
      age: 22,
    },
    a: {
      b: [1],
    },
  }),
  actions: {
    /// action中的this可以访问state中的数据和其他action
    changeUser() {
      this.user = {
        name: 'jerry',
        age: 23,
      }
    },
  },
})

export default appStore
```

```typescript
/// page.ts
import appStore from './appStore'

Page({
  data: {
    title: 'User Page',
  },
  onLoad() {
    /// 将appStore绑定到当前页面的data中，第二个参数是绑定的key，需要和data中的key不同
    appStore.$bind(this, 'myAppStore')
  },
  changeUser() {
    appStore.changeUser()
  },
  onUnload() {
    /// 必须在页面卸载时解绑
    appStore.$unbind(this)
  },
})
```

```vue
/// page.wxml
<view>
  <text>{{title}}</text>
  <button type="primary" capture-bind:tap="changeUser">Change User</button>
  <text>{{myAppStore.user.name}}</text>
  <text>{{myAppStore.user.age}}</text>
</view>
```

## methods

### $bind(page, key: string)

将store绑定到页面的data中，key是绑定的key，需要和data中的key不同。

---

### $unbind(page)

解绑store。

---

### $reset()

重新调用createStore时的state函数，重置store中的数据。

---

## Contribution

Your contributions and suggestions are heartily welcome.

## License

MIT
