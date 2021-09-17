# 整体流程

## initData数据初始化

- 递归地调用defineProperty, 把_data中的每个属性 及 属性的属性 变成响应式。

- 代理：**本质上仍是调用defineProperty**, 让app._data中的属性映射到app的属性上。


## mount挂载组件

- 创建render函数：将 真实DOM 转化为 虚拟DOM 缓存起来。

- 创建watcher，执行render函数，将 虚拟DOM + _data 渲染到页面中。

    - 渲染时必定发生 数据属性的读取， 此时进行 **依赖收集**。

    - 让 该属性的dep 记录下此时的watcher。

    - 让 该watcher 监听 该属性的dep。


## 当数据发生改变时

- 属性的dep 去 notify，通知 该属性所有的watcher 进行更新，即 **派发更新**。

- 而在 更新过程中，即渲染过程，又会发生 **依赖收集**。
