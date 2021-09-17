methods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "slice",
    "splice",
]
// 重写数组的原型对象。
let newProto = Object.create(Array.prototype);
methods.forEach(method => {
    newProto[method] = function () {
        console.log(`调用截取的${method}方法`)
        let res = Array.prototype[method].apply(this, arguments);
        return res;
    }
});

// 将对象target的属性设置为响应式
function defineReactive(vm, target, key, value, enumerable) {
    // 利用函数的闭包: definProperty中可以访问defineReactive中的value

    let dep = new Dep();

    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: !!enumerable,
        set(val) {
            console.log(`设置${key}的值`)
            if (typeof val === "object" && val !== null) {      // 赋值操作时，能将赋值号右边的变量(若是对象的话)转化为响应式的。
                reactify(vm, val);
            }
            value = val;
            dep.notify();   // 一旦发生修改，dep.notify() => watcher.update() => vm调用更新方法(模板+最新的_data)。
        },
        // 渲染时(VDOM + _data) 需要读取 _data中的值
        get() {
            console.log(`获取${key}的值`)
            if (typeof value === "object" && value !== null) {      // 代码2：数组原生方法push时，会调用arguments中元素的get方法。
                reactify(vm, value);
            }
            dep.depend()    // 依赖收集
            return value;
        }
    })
}

// 递归: 将 对象/数组 中的嵌套属性变成响应式。
// 这么写，则若是数组传递首次传递进来，则自身并没有变成响应式。
// 类似于对象首次传递进来，其自身并没有变成响应式。
function reactify(vm, o) {
    if (Array.isArray(o)) {
        o.__proto__ = newProto;
    }
    for (let key in o) {
        let value = o[key];
        if (typeof value !== "function") {      // 不枚举 对象的 方法。
            // 属性值是基本数据类型
            if (typeof value !== "object") {
                defineReactive(vm, o, key, value, true);
            } else if (value != null) {
                defineReactive(vm, o, key, value, true);        //代码1： 属性值是数组/对象类型，也要把该属性变成响应式
                reactify(vm, value);
            }
        }
    }
}

JGVue.prototype.initData = function () {
    // 让数据响应式化
    reactify(this, this._data);
    // 代理，让this._data[key] 映射到 this[key]上
    for (let i in this._data) {
        proxy(this, "_data", i)
    }
}

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