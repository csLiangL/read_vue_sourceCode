// 挂载：
// 1. 模板 => AST    
// 2. AST => 不带数据的VNode
// 3. 挂载组件
// 这里将1和2简化为 从 模板 直接到 不带数据 的VNode(parseToVNode), 再从 不带数据 的VNode到 带数据 的Vnode(combine)

// render = parseToVNode + combine
JGVue.prototype.mount = function () {
    // 创建render函数(可以用户自己提供)
    this.render = this.createRenderFn();
    // 挂载组件
    this.mountComponent();
}

// 缓存 模板VNode
JGVue.prototype.createRenderFn = function () {
    // 这里将ast简化为不带数据的VNode
    let ast = parseToVNode(this._template);
    return function () {
        return combine(ast, this._data);        // 返回带数据的VNode
    }
}

// 将 模板VNode 转换为 有数据的VNode
JGVue.prototype.mountComponent = function () {
    let mount = () => {
        this.update(this.render());         // this.render()实际上就是 combine
    }
    new Watcher(this, mount)      // 相当于重新渲染组件。
}

// 将 有数据的VNode 转化为 Node，更新。
JGVue.prototype.update = function (vnode) {
    let realNode = parseToNode(vnode);
    this._parent.replaceChild(realNode, document.querySelector("#root"))
}
