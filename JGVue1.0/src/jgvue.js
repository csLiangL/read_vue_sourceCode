// Vue实例的构造函数
function JGVue(options) {

    this._template = document.querySelector(options.el);
    this._data = options.data;
    this._parent = this._template.parentNode;

    this.initData();

    // 挂载
    this.mount();
}
