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

    if (nodeType === 1) {
        let nodeName = node.nodeName;
        let attrs = node.attributes;
        let _attrObj = {};

        Array.prototype.forEach.call(attrs, (value, idx) => {
            _attrObj[value.nodeName] = value.nodeValue;
        })

        _vnode = new VNode(nodeName, _attrObj, undefined, nodeType);

        let children = node.childNodes;
        Array.prototype.forEach.call(children, (childNode, idx) => {
            _vnode.appendChild(parseToVNode(childNode));
        })
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
        _vnode.value = vnode.value.replace(
            /\{\{(.+?)\}\}/,
            function (_, g) {
                return getValueByPath(data, g.trim())       // 触发了读取器set
            }
        )
    }
    return _vnode;
}
