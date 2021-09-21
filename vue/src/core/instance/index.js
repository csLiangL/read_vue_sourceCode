import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'


// 函数的5种调用方式：函数模式，方法模式，构造器模式，上下文模式，bind模式。
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)    // 把Vue当成构造函数调用，this才会指向Vue实例对象。
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}


// 下面这些函数，内部会挂载一些方法：如Vue.prototype.xxx = function
initMixin(Vue)            // 挂载 _init()方法
stateMixin(Vue)           
eventsMixin(Vue)          // 挂载 on()、off()方法
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
