# 数据劫持

![](./img/数据劫持.awebp)

# 依赖收集(订阅)

- 假设 某**计算属性 b** 是通过 **数据a(data的某个属性)** 转化得到，则我们希望 **数据a 在变化时 能够通知到 a本身 以及 b**。
- Vue1.0中的做法是 **定义watcherA和watcherB**，分别对应a 和 b，他们 **都用来监听属性数据a**，以便于在属性a发生改变的时候，watcherA用来改变 a本身，watcherB则用来改变 b。
- 既然他们都 监听 属性数据a，则不妨给 属性数据a 添加一个Dep，可以将其简单理解为一个数组，里面就存放着 **监听属性a的两个watcher**，这样 属性数据a发生改变后，只要遍历 一遍数组，就能将所有 的依赖 都更新一遍了。
- 而 给属性添加Dep数组 自然就发生在 **defineProperty()** 中，依赖收集即给数组增加元素 则发生在 **属性的 getter** 里面。
- 这里 将watcher 一个个 推入 Dep数组中，就是 **订阅过程**。

>tips:
>
>- 在Vue1.0中：一个watcher只监听一个数据，页面更新也只更新这一个节点，粒度很细。
>
>- 在Vue2.0中，一个watcher监听一个组件，页面更新以组件为单位，粒度扩大了。

> tips：
>
> - 只有当Dep.target存在时，才会进行依赖收集。
> - 即依赖收集前，一定会判断 Dep.target是否存在。

# 派发更新(发布)

- dep 对应 **某一个属性的 一群watcher**。

- 派发更新即 **发布过程** 就是将数组中的watcher一个个拿出来更新，则自然发生 在setter里，因此数据改变必然触发setter。

# 整体流程

## initData数据初始化

- 首先就是数据劫持，递归地调用defineProperty, 把_data中的每个属性 及 属性的属性 变成响应式。

- 代理：**本质上仍是调用defineProperty**, 让app._data中的属性映射到app的属性上。


## mount挂载组件

- 创建render函数：将 真实DOM 转化为 虚拟DOM 缓存起来。

- 创建watcher，执行render函数，将 虚拟DOM + _data 渲染到页面中。

    - **渲染时必定发生 数据属性的读取**， 此时进行 **依赖收集**。

    - 让 该属性的dep 记录下此时的watcher。

    - 让 该watcher 监听 该属性的dep。


## 当数据发生改变时

- 属性的dep 去 notify，通知 该属性所有的watcher 进行更新，即 **派发更新**。

- 而在 更新过程中，即渲染过程，又会发生 **依赖收集**。



# 各个函数的说明

## Vnode类

- 属性有 `tagName, data, value, type, children`，方法为 `appendChild(vnode)`。

## getValueByPath(obj, path)

- 目的：将 x.y.z 转化为 x\[y][z]

  ```javascript
  res = obj;
  prop = arr.shift();
  res = res[prop]
  ```
## parseToVNode(node)

- 将 DOM节点node 转化为 虚拟DOM实例，并返回。
- 非文本节点：
  - `_vnode = new VNode(nodeName, attributes, undefined, nodeType)`
  - `_vnode.appendChild(parseToVNode(childNodes))`
- 文本节点：
  - `_vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);`

## parseToNode(vnode)

- 将 虚拟DOM节点 转化为 真实node，并返回。
- 非文本节点：
  - `_node = document.createElement(vnode.tag);`
  - `_node.setAttribute(attr, data[attr]);`
  - `_node.appendChild(parseToNode(child));`
- 文本节点：
  - `_node = document.createTextNode(vnode.value);`

## combine(vnode, data)

- 将 含有"{{ }}" 的 vnode 转化为 带数据的 vnode。

- 非文本节点：

  - `_vnode.appendChild(combine(child, data));`

- 文本节点：

  - ```javascript
    _vnode.value = vnode.value.replace(
                /\{\{(.+?)\}\}/,
                function (_, g) {
                    return getValueByPath(data, g.trim())       // 触发了读取器set
                }
            )
    ```

  ## initData()

- 定义在 Vue原型上，对 Vue实例的数据进行响应式化，并代理。

  - 响应式化，和代理都要用到 `defineProperty()`。

  - 响应式函数，每一个响应式对象 会对应一个 Observe实例。在实例的初始化中 会对接收到的对象 的 每个属性 进行响应式化。

    - 对每个属性 `defineProperty()`，`get()`时依赖收集，`set()`时派发更新。
    - 若该属性 的属性值 也是一个对象，则将 这个对象 再次 对应一个 Oberve实例；如果不是对象就不处理。

  - 代理函数：`proxy(target, prop, key)`，本质上是给 target[key] 增加了属性。

    ```javascript
    function proxy(target, prop, key) {
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            set(newVal) {
                target[prop][key] = newVal;
            },
            get() {
                return target[prop][key];
            }
        })
    }
    ```

### 怎么依赖收集的？

- 每 对一个属性 响应式化，这个属性就会对应一个 Dep实例，而每次读取这个属性，会有一个全局的`watcher`，依赖收集就是把这个全局的watcher加入到 Dep实例的内部数组中，也就是存储了 与这个 属性相关的 所有watcher。

### 怎么派发更新的？

- 当有属性 发生更改时，就是拿到这个属性对应的 Dep实例，其中存储了与这个属性相关的所有watcher，然后让 watcher自己去更新。

## watcher是在什么时候创建的？

- 挂载组件时，创建的watcher，将 渲染函数 也传递进入了 watcher 类中。
- 这个渲染函数会在两个地方调用，1. watcher初始化时，2. 数据发生改变时。
- 渲染函数的作用，缓存了 模板VNode，当数据发生改变时，只要将模板VNode + data，重新渲染成 带数据的VNode。