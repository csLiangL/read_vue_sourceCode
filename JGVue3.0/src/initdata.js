/**
 * 数据劫持
 */

/**
 * 接收一个对象类型的数据，
 * 并将传入的对象中的每个属性 变成响应式的。
 */
class Observer {
    constructor(value) {
        this.value = value;
        this.walk();                                // 遍历数据对象的每个属性，使其变成响应式。
    }
    walk() {
        Object.keys(this.value).forEach(key => {
            defineReactive(this.value, key);        // 对 该对象的 某个属性，响应式化。
        })
    }
}

/**
 * 接受任意类型的数据
 * - 如果传入的 对象类型，则变成响应式对象
 * - 如果传入的类型是 非对象类型，则不处理。
 */
function observe(data) {
    if (typeof data != "object") return;
    new Observer(data);
}

/**
 * 接受一个对象 的 一个属性， 并将该属性变成响应式的
 * 并对 属性值 进行处理，以及 赋的新值 进行处理：(observe)
 *      - 若是 对象，则继续响应式
 *      - 若是 非对象，则不处理。
 */
function defineReactive(data, key, value = data[key]) {

    // let dep = [];        // 将所有 依赖 key 的 watcher收集起来。
    let dep = new Dep();

    observe(value);      // ！！若 属性值 是对象，将其也变成响应式的

    Object.defineProperty(data, key, {
        get() {
            // dep.push(window.target);         // ！！第一次渲染拿数据时，此时watcher还没有实例化完成。
            dep.depend();
            return value;
        },
        set(newVal) {
            if (newVal === value) return;
            value = newVal;
            observe(newVal);    // 若赋的新值也是对象，则使其变成响应式的。
            // 派发更新
            // dep.forEach(w => w.update());
            dep.notify();
        }
    })
}