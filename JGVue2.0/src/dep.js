class Dep {
    constructor() {
        this.subs = [];     // 与该dep关联的watcher。
    }

    // 当属性更新时，触发。
    notify() {
        this.subs.forEach(watcher => {
            watcher.update();
        })
    }

    addSub(sub) {
        this.subs.push(sub);
    }

    // 依赖收集：关联该属性的watcher
    depend() {
        if (Dep.target) {
            this.addSub(Dep.target);
            Dep.target.addDep(this);
        }
    }
}

// 当前内存中的watcher，用来更新渲染组件。
Dep.target = null;

// 为什么要用一个数组来存储watcher？？？
let targetStack = [];


// 将 当前的watcher 存储到 全局数组中
// 第一次构造watcher时，会调用get方法，进行渲染，此时进行依赖收集，所有的完成之后，watcher对象才会存在。
// 如果这么写，则在依赖收集时，该watcher对象(Dep.target)还未存在，而依赖收集就是收集属性对应的watcher。
// 但是在进行依赖收集前，即渲染之前需要把watcher即Dep.target，加入全局中。
function pushTarget(target) {
    targetStack.push(target);
    Dep.target = target;
}

function popTarget() {
    Dep.target = targetStack.pop();
}