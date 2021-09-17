// Vue实例的构造函数
function JGVue(options) {

    this._template = document.querySelector(options.el);
    this._data = options.data;
    this._parent = this._template.parentNode;

    // 初始化数据：响应式化，依赖收集
    this.initData();

    // 挂载
    this.mount();
}
