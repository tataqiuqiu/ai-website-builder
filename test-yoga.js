// 测试 Yoga Layout 引擎是否可用 (使用 ESM 导入)
async function testYoga() {
  console.log('Yoga Layout 可用性测试:');

  try {
    // 动态导入 Yoga Layout
    const Yoga = await import('yoga-layout');
    const { default: yoga } = Yoga;
    
    console.log('Yoga Layout 版本:', yoga.Version);
    
    // 创建一个简单的布局节点
    const root = yoga.Node.create();
    root.setWidth(500);
    root.setHeight(300);
    root.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    
    // 创建子节点
    const child1 = yoga.Node.create();
    child1.setWidth(100);
    child1.setHeight(100);
    
    const child2 = yoga.Node.create();
    child2.setWidth(200);
    child2.setHeight(100);
    
    // 添加子节点
    root.insertChild(child1, 0);
    root.insertChild(child2, 1);
    
    // 计算布局
    root.calculateLayout(500, 300, yoga.DIRECTION_LTR);
    
    // 获取计算结果
    console.log('Root layout:', {
      width: root.getComputedWidth(),
      height: root.getComputedHeight(),
      left: root.getComputedLeft(),
      top: root.getComputedTop()
    });
    
    console.log('Child 1 layout:', {
      width: child1.getComputedWidth(),
      height: child1.getComputedHeight(),
      left: child1.getComputedLeft(),
      top: child1.getComputedTop()
    });
    
    console.log('Child 2 layout:', {
      width: child2.getComputedWidth(),
      height: child2.getComputedHeight(),
      left: child2.getComputedLeft(),
      top: child2.getComputedTop()
    });
    
    // 清理
    root.freeRecursive();
    
    console.log('\n✅ Yoga Layout 引擎测试成功！');
    return yoga;
  } catch (error) {
    console.error('❌ Yoga Layout 引擎测试失败:', error.message);
    console.error(error);
    return null;
  }
}

// 运行测试
testYoga().then(yoga => {
  if (yoga) {
    console.log('Yoga Layout 引擎已成功加载');
  } else {
    console.log('Yoga Layout 引擎加载失败');
  }
});