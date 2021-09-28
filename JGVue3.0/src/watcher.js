/**
 * 依赖收集
 *  - watcher 对应 一个数据，相当于 买家 要买一个商品。
 *      - 这是Vue1.0的做法：一个watcher只监听一个数据，页面更新也只更新这一个节点，粒度很细。
 *      - 在Vue2.0中，一个watcher监听一个组件，页面更新以组件为单位，粒度扩大了。
 *  - dep 对应 一群watcher，相当于 卖家 要 发布 很多个商品。
 * 其中，dep是发布者，在getter里进行依赖收集，在setter里进行派发更新。
 * 
 */

class Watcher {
    // data: 数据对象
    // exp: 表达式如 a.b.c.xxx
    // cb: 回调函数，当exp数据发生改变时触发。
    constructor(data, exp, cb) {
        this.data = data;
        this.exp = exp;
        this.cb = cb;

        // 初始化时，订阅数据
        this.value = this.get();
    }

    get() {
        // window.target = this;           // 下面要进行依赖收集(读数据)，需要用到此watcher，为了保留上下文，将此watcher存入全局。
        pushTarget(this);
        let value = getValueByPath(this.data, this.exp);
        popTarget();
        return value;
    }

    // 当依赖的数据发生改变时，调用。
    update() {
        let oldVal = this.value;
        this.value = getValueByPath(this.data, this.exp);   // 更新数据
        this.cb.call(this.data, this.value, oldVal);        // 让该回调可以监听数据的新值和旧值
    }

    // o = { friend: {adress: {name: "北京"}}  }
    // friend.address.name
    getValueByPath(obj, path) {
        let arr = path.split(".");
        let temp = obj;
        for (let i = 0; i < arr.length; i++) {
            temp = temp[arr[i]];
        }
        return temp;
    }
}

// 当前内存中的watcher，用来更新渲染组件。
Dep.target = null;

// 栈结构，若 父在渲染过程中(会创建watcher1)，发现子组件也需要渲染(会创建watcher2)，因此用targetStack来保存 父子组件的 渲染栈。
let targetStack = [];


function pushTarget(target) {
    targetStack.push(target);
    Dep.target = target;
}

function popTarget() {
    Dep.target = targetStack.pop();
}