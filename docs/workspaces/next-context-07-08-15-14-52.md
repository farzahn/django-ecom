# Next Context Report: Updating Shipping Options

## Context

The project is an e-commerce platform called "pasargadprints" that sells custom 3D printed items. Recent work has focused on integrating GoShippo for real-time shipping rates and fixing a critical bug where inventory stock was not being deducted after successful purchases.

The user is now asking about how to update shipping options. Based on the codebase analysis, shipping is currently handled through the GoShippo API integration, which dynamically fetches available carriers and rates. However, there is no built-in administrative interface for managing shipping options within the Django application itself.

### Current Shipping Implementation:
- **GoShippo Integration**: Real-time shipping rates from multiple carriers
- **Supported Carriers**: USPS, UPS, FedEx (via GoShippo)
- **Configuration**: API key via environment variable
- **Storage**: Shipping details stored in Order model after checkout
- **Origin Address**: Hardcoded in `shipping_views.py`

### Recent Progress:
- Successfully integrated GoShippo API for fetching shipping rates
- Fixed stock deduction bug in order fulfillment
- Created comprehensive tests for shipping and stock management
- Resolved CSS compilation errors in frontend

## Tasks

```json
[
  {
    "id": "1",
    "description": "Create database models for shipping configuration (ShippingCarrier, ShippingService, ShippingConfiguration)",
    "type": "feature",
    "status": "pending"
  },
  {
    "id": "2",
    "description": "Implement Django admin interface for managing shipping carriers and services",
    "type": "feature",
    "status": "pending"
  },
  {
    "id": "3",
    "description": "Move hardcoded shipping origin address to configurable settings",
    "type": "refactor",
    "status": "pending"
  },
  {
    "id": "4",
    "description": "Add shipping rules engine for custom rates, markups, and zone-based pricing",
    "type": "feature",
    "status": "pending"
  },
  {
    "id": "5",
    "description": "Create API endpoints for managing shipping configuration",
    "type": "feature",
    "status": "pending"
  },
  {
    "id": "6",
    "description": "Add ability to enable/disable specific carriers and services",
    "type": "feature",
    "status": "pending"
  },
  {
    "id": "7",
    "description": "Implement shipping method override for specific products or categories",
    "type": "feature",
    "status": "pending"
  },
  {
    "id": "8",
    "description": "Document shipping configuration process for administrators",
    "type": "docs",
    "status": "pending"
  }
]
```

## References

### Key Files for Shipping Implementation:
- `/store/shipping_views.py` - Main shipping rates API endpoint
- `/store/models.py` - Order model with shipping fields
- `/store/stripe_views.py` - Checkout integration with shipping
- `/frontend/src/components/CheckoutForm.tsx` - Frontend shipping selection
- `/store/tests/test_goshippo_integration_flow.py` - Shipping integration tests

### Configuration Files:
- `.env` - Contains `SHIPPO_API_KEY` environment variable
- `/store/settings.py` - Django settings for API configuration

### External Resources:
- [GoShippo API Documentation](https://goshippo.com/docs/)
- [GoShippo Dashboard](https://app.goshippo.com/) - External carrier management
- [Django Admin Documentation](https://docs.djangoproject.com/en/4.2/ref/contrib/admin/)

### Related Test Files:
- `/store/tests/test_goshippo_shipping_rates_enhanced.py`
- `/store/tests/test_stock_deduction.py`

## Clarifications

```json
[
  {
    "question": "Should shipping configuration be managed entirely within Django, or should it continue to rely on GoShippo's external configuration?",
    "context": "Currently, carriers and services are managed through GoShippo's dashboard. Adding Django models would create a dual management system."
  },
  {
    "question": "What level of shipping customization is needed? Basic carrier selection or advanced rules with zones, weight tiers, and product-specific rates?",
    "context": "This affects the complexity of the shipping configuration models and admin interface."
  },
  {
    "question": "Should the system support multiple shipping origin addresses for different warehouses or fulfillment centers?",
    "context": "Currently only one hardcoded origin address is used."
  },
  {
    "question": "Is there a need for shipping promotions (free shipping thresholds, discount codes for shipping)?",
    "context": "This would require additional models and business logic."
  },
  {
    "question": "Should shipping rates be cached to reduce API calls to GoShippo?",
    "context": "This could improve performance but requires cache invalidation logic."
  }
]

---

# 下一步工作报告：更新配送选项

## 项目背景

该项目是一个名为"pasargadprints"的电子商务平台，专门销售定制3D打印产品。最近的工作重点是集成GoShippo以获取实时运费，并修复了一个关键bug——成功购买后库存未被扣减。

用户现在询问如何更新配送选项。根据代码库分析，配送目前通过GoShippo API集成处理，动态获取可用的承运商和费率。但是，Django应用程序内部没有用于管理配送选项的内置管理界面。

### 当前配送实现：
- **GoShippo集成**：来自多个承运商的实时运费
- **支持的承运商**：USPS、UPS、FedEx（通过GoShippo）
- **配置**：通过环境变量设置API密钥
- **存储**：结账后将配送详情存储在订单模型中
- **发货地址**：在`shipping_views.py`中硬编码

### 最近进展：
- 成功集成GoShippo API获取运费
- 修复了订单履行中的库存扣减bug
- 为配送和库存管理创建了全面的测试
- 解决了前端CSS编译错误

## 任务清单

```json
[
  {
    "id": "1",
    "description": "创建配送配置的数据库模型（ShippingCarrier、ShippingService、ShippingConfiguration）",
    "type": "功能",
    "status": "待开始"
  },
  {
    "id": "2",
    "description": "实现Django管理界面来管理配送承运商和服务",
    "type": "功能",
    "status": "待开始"
  },
  {
    "id": "3",
    "description": "将硬编码的发货地址移至可配置设置",
    "type": "重构",
    "status": "待开始"
  },
  {
    "id": "4",
    "description": "添加配送规则引擎，用于自定义费率、加价和基于区域的定价",
    "type": "功能",
    "status": "待开始"
  },
  {
    "id": "5",
    "description": "创建用于管理配送配置的API端点",
    "type": "功能",
    "status": "待开始"
  },
  {
    "id": "6",
    "description": "添加启用/禁用特定承运商和服务的功能",
    "type": "功能",
    "status": "待开始"
  },
  {
    "id": "7",
    "description": "为特定产品或类别实现配送方式覆盖",
    "type": "功能",
    "status": "待开始"
  },
  {
    "id": "8",
    "description": "为管理员编写配送配置流程文档",
    "type": "文档",
    "status": "待开始"
  }
]
```

## 参考资料

### 配送实现的关键文件：
- `/store/shipping_views.py` - 主要的运费API端点
- `/store/models.py` - 带有配送字段的订单模型
- `/store/stripe_views.py` - 与配送集成的结账功能
- `/frontend/src/components/CheckoutForm.tsx` - 前端配送选择
- `/store/tests/test_goshippo_integration_flow.py` - 配送集成测试

### 配置文件：
- `.env` - 包含`SHIPPO_API_KEY`环境变量
- `/store/settings.py` - API配置的Django设置

### 外部资源：
- [GoShippo API文档](https://goshippo.com/docs/)
- [GoShippo控制台](https://app.goshippo.com/) - 外部承运商管理
- [Django管理文档](https://docs.djangoproject.com/en/4.2/ref/contrib/admin/)

### 相关测试文件：
- `/store/tests/test_goshippo_shipping_rates_enhanced.py`
- `/store/tests/test_stock_deduction.py`

## 待澄清问题

```json
[
  {
    "question": "配送配置应该完全在Django内管理，还是继续依赖GoShippo的外部配置？",
    "context": "目前，承运商和服务通过GoShippo的控制台管理。添加Django模型将创建双重管理系统。"
  },
  {
    "question": "需要什么级别的配送定制？基本的承运商选择还是带有区域、重量等级和产品特定费率的高级规则？",
    "context": "这会影响配送配置模型和管理界面的复杂性。"
  },
  {
    "question": "系统是否应该支持多个发货地址，用于不同的仓库或履行中心？",
    "context": "目前只使用一个硬编码的发货地址。"
  },
  {
    "question": "是否需要配送促销（免费配送门槛、配送折扣码）？",
    "context": "这将需要额外的模型和业务逻辑。"
  },
  {
    "question": "是否应该缓存运费以减少对GoShippo的API调用？",
    "context": "这可以提高性能，但需要缓存失效逻辑。"
  }
]
```