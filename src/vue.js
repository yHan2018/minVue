// 定义 vue 类， 用于创建vue实例
class Vue {
  constructor(options = {}) {
    // 给vue 实例添加属性
    this.$el = options.el;
    this.$data = options.data;
    this.$methods = options.methods;

    if (this.$el) {
      new Compile(this.$el, this);
    }
  }
}