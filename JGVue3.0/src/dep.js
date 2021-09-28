/**
 * 本质上dep就是一个数组，存放着 依赖于某属性的 所有watcher。
 */

class Dep {
    constructor() {
        this.subs = [];
    }

    // 依赖收集
    depend() {
        if (Dep.target) {
            this.subs.add(Dep.target);
        }
    }

    // 派发更新
    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}