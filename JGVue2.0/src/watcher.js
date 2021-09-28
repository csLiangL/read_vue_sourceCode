class Watcher {
    constructor(vm, expOrFn) {
        this.vm = vm;
        this.getter = expOrFn;
        this.deps = [];     // 监听的属性

        // 一开始的渲染，真实的Vue中 this.lazy ? undefined : this.get()
        this.get();
    }

    // 会在两种情况下触发：1. watcher初始化时 2. 数据发生改变时。
    get() {
        pushTarget(this);               // 第一次渲染时，保留上下文
        this.getter.call(this.vm)       // 重新生成 VDOM + _data, 并渲染。
        popTarget(this);
    }

    // 执行，并判断 1.是不是懒加载，2.是不是同步执行，3.是不是异步执行。
    run() {
        this.get();
    }

    // 对外公开的接口，用于在 属性 发生变化时触发。
    update() {
        this.run();
    }

    // 对外公开：让watcher监听 该属性。
    addDep(dep) {
        this.deps.push(dep)
    }
}