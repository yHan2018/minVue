// 解析模板
class Compile {
  /**
   * @param {*} el 选择器
   * @param {*} vm vue实例
   */
  
  constructor(el, vm) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.vm = vm;
    if (this.el) {
      // 1. 将el 节点放进内存；fragment
      let fragment = this.node2fragment(this.el);
      // 2. 在内存中编译 fragment
      this.compile(fragment);
      // 3. 将 fragment 加载到 dom 树中；
      this.el.appendChild(fragment);
    }
  }

  // 核心方法
  /**
   * 将节点放进 fragment
   * @param {*} el node 节点
   */
  node2fragment(node) {
    const fragment = document.createDocumentFragment();
    const childNodes = node.childNodes;
    // console.log(childNodes);
    this.toArray(childNodes).forEach(element => {
      fragment.appendChild(element);
    });

    return fragment;
  }

  /**
   * 编译节点
   */
  compile(fragment) {
    const childNodes = fragment.childNodes;
    this.toArray(childNodes).forEach((node) => {
      // console.log(node);
      // 节点类型：标签、文本节点
      if (this.isElementNode(node)) {
        // 标签需要解析指令
        this.compileElementNode(node);
      }

      if (this.isTextNode(node) && node.textContent.trim()) {
        // 文本节点只要解析插值表达式
        this.compileTextNode(node);
      }
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }

  /**
   * 解析元素节点
   * @param {*} node 
   */
  compileElementNode(node) {
    // console.log('解析元素节点');
    const attributes = node.attributes;
    this.toArray(attributes).forEach(el => {
      const attrName = el.name;

      if (this.isDirective(attrName)) {
        let type = attrName.slice(2);
        const expr = el.value;
        if (this.isEventDirective(type)) {
          CompileUtil['eventHandler'](node, this.vm, type, expr);
        } else {
          CompileUtil[type] && CompileUtil[type](node, this.vm, expr);
        }
      }
    });
  }

  /**
   * 解析文本节点
   * @param {*} node 
   */
  compileTextNode(node) {
    // console.log('解析文本节点');
    CompileUtil.mustache(node, this.vm);
  }

  // 工具方法
  /**
   * 将类数组转换成数组
   * @param {*} likeArray 
   */
  toArray(likeArray) {
    return [].slice.call(likeArray);
  }

  isElementNode(node) {
    // nodeType 1:元素节点 3: 文本节点
    return node.nodeType === 1;
  }

  isTextNode(node) {
    // nodeType 1:元素节点 3: 文本节点
    return node.nodeType === 3;
  }

  isDirective(attrName) {
    // console.log(attrName);
    return attrName.startsWith('v-');
  }

  isEventDirective(type) {
    const directiveType = type.split(':')[0];
    return directiveType === 'on';
  }
}

// 编译指令
let CompileUtil = {
  /**
   * 处理插值表达式
   */
  mustache(node, vm) {
    const text = node.textContent;
    const reg = /\{\{(.+)\}\}/;
    if (reg.test(text)) {
      const expr = RegExp.$1;
      node.textContent = text.replace(reg, this.getVmValue(vm, expr));
    }
  },

  text(node, vm, expr) {
    node.textContent = this.getVmValue(vm, expr);
  },

  html(node, vm, expr) {
    node.innerHTML = this.getVmValue(vm, expr);
  },

  model(node, vm, expr) {
    node.value = this.getVmValue(vm, expr);
  },

  eventHandler(node, vm, type, expr) {
    const eventType = type.split(':')[1];
    const fn = vm.$methods && vm.$methods[expr];
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm));
    }
  },

  /**
   * 获取 vm 中的数据
   * @param {*} vm 
   * @param {*} expr 
   */
  getVmValue(vm, expr) {
    let data = vm.$data;
    expr.split('.').forEach(item => {
      data = data[item];
    });
    return data;
  }
}