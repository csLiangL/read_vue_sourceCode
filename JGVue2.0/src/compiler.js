// "x.x.x" => x[x][x]
function getValueByPath(obj, path) {
    let arr = path.split(".");
    let res = obj;
    let prop;
    while (prop = arr.shift()) {
        res = res[prop];
    }
    return res;
}


// 真正的DOM => 为虚拟DOM
function parseToVNode(node) {
    let nodeType = node.nodeType;
    let _vnode = null;

    // 元素节点
    if (nodeType === 1) {
        let nodeName = node.nodeName;
        let attrs = node.attributes;
        let _attrObj = {};

        // attrs: Map类型 {0: id, 1:class}.
        // value: DOM结构如 id="demo", 可以通过 nodeName拿到"id", nodeValue拿到"demo".
        Array.prototype.forEach.call(attrs, (value, idx) => {
            _attrObj[value.nodeName] = value.nodeValue;
        })

        _vnode = new VNode(nodeName, _attrObj, undefined, nodeType);

        let children = node.childNodes;
        Array.prototype.forEach.call(children, (childNode, idx) => {
            _vnode.appendChild(parseToVNode(childNode));
        })

        // 文本节点
    } else if (nodeType === 3) {
        _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);
    }

    return _vnode;
}

// 将 虚拟DOM 还原成 真实DOM
function parseToNode(vnode) {

    let vnodeType = vnode.type;
    let _node = null;

    if (vnodeType == 1) {

        // tag
        _node = document.createElement(vnode.tag);

        // data
        let data = vnode.data;
        for (let attr in data) {
            _node.setAttribute(attr, data[attr]);
        }

        // children
        vnode.children.forEach(child => {
            _node.appendChild(parseToNode(child));
        })

    } else if (vnodeType == 3) {
        _node = document.createTextNode(vnode.value);
    }

    return _node;
}

// 有坑的虚拟DOM => 带数据的虚拟DOM
function combine(vnode, data) {
    let _type = vnode.type;
    let _tag = vnode.tag;
    let _data = vnode.data;
    let _value = vnode.value;

    let _vnode = new VNode(_tag, _data, _value, _type);

    if (_type == 1) {
        vnode.children.forEach(child => {
            _vnode.appendChild(combine(child, data));
        })
    } else if (_type == 3) {
        // .* 表示匹配任意字符串，再加个"?"表示符合条件的最短的
        _vnode.value = vnode.value.replace(
            /\{\{(.*?)\}\}/g,
            function (_, g) {
                return getValueByPath(data, g.trim())       // 触发了读取器set
            }
        )
    }
    return _vnode;
}


// let template = "Hello, ${who}, ${wether}"
// let values = {who: "world", wether: "sunny"}
function formatter(template, values) {
    let newStr = template;
    newStr = newStr.replace(
        /\$\{(.*?)\}/g,
        function (_, g) {
            return values[g.trim()];
        }
    )
    return newStr;
}