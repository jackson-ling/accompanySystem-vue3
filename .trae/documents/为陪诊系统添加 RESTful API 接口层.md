# 为陪诊系统添加 RESTful API 接口层

## 一、项目目标

将当前使用 mock 数据的陪诊系统改造为通过 RESTful API 与后端交互的真实应用。

## 二、实施计划

### 1. 完善 API 请求基础设施

* **优化** **[request.ts](d:\Gitprojects\accompanySystem-vue3\src\utils\request.ts)**

  * 启用 Token 认证（从 localStorage 读取并添加到请求头）

  * 完善响应拦截器（统一处理错误码、token 失效、消息提示）

  * 添加请求重试和超时处理

### 2. 创建 TypeScript 类型定义

创建 [types/api.ts](d:\Gitprojects\accompanySystem-vue3\src\types\api.ts) 定义所有 API 请求和响应的数据结构：

* 用户相关类型（登录、注册、个人信息）

* 陪诊师相关类型（列表、详情、评价）

* 服务相关类型（服务项、分类）

* 订单相关类型（订单创建、列表、状态）

* 消息相关类型

* 充值和消费记录类型

* 通用响应类型（`ApiResponse<T>`, `PaginatedResponse<T>`）

### 3. 创建 API 模块

在 [src/api/](d:\Gitprojects\accompanySystem-vue3\src\api) 目录下创建以下文件：

#### [src/api/auth.ts](d:\Gitprojects\accompanySystem-vue3\src\api/auth.ts) - 认证相关

* `POST /auth/login` - 用户登录

* `POST /auth/logout` - 用户登出

* `GET /auth/profile` - 获取用户信息

#### [src/api/user.ts](d:\Gitprojects\accompanySystem-vue3\src\api/user.ts) - 用户管理

* `PUT /user/profile` - 更新个人信息

* `PUT /user/avatar` - 更新头像

* `PUT /user/password` - 修改密码

* `GET /user/balance` - 获取余额

#### [src/api/patient.ts](d:\Gitprojects\accompanySystem-vue3\src\api\patient.ts) - 就诊人管理

* `GET /user/patients` - 获取就诊人列表

* `POST /user/patients` - 添加就诊人

* `PUT /user/patients/:id` - 更新就诊人

* `DELETE /user/patients/:id` - 删除就诊人

* `PUT /user/patients/:id/default` - 设置默认就诊人

#### [src/api/companion.ts](d:\Gitprojects\accompanySystem-vue3\src\api/companion.ts) - 陪诊师

* `GET /companions` - 获取陪诊师列表（支持筛选、分页、排序）

* `GET /companions/:id` - 获取陪诊师详情

* `GET /companions/:id/reviews` - 获取陪诊师评价

* `POST /companions/:id/favorite` - 收藏/取消收藏

#### [src/api/service.ts](d:\Gitprojects\accompanySystem-vue3\src\api\service.ts) - 服务项目

* `GET /services` - 获取服务列表

* `GET /services/:id` - 获取服务详情

* `GET /services/categories` - 获取服务分类

#### [src/api/order.ts](d:\Gitprojects\accompanySystem-vue3\src\api\order.ts) - 订单管理

* `POST /orders` - 创建订单

* `GET /orders` - 获取订单列表（支持状态筛选）

* `GET /orders/:id` - 获取订单详情

* `PUT /orders/:id/cancel` - 取消订单

* `PUT /orders/:id/pay` - 支付订单

#### [src/api/message.ts](d:\Gitprojects\accompanySystem-vue3\src\api\message.ts) - 消息系统

* `GET /messages/conversations` - 获取会话列表

* `GET /messages/:conversationId` - 获取聊天记录

* `POST /messages` - 发送消息

#### [src/api/recharge.ts](d:\Gitprojects\accompanySystem-vue3\src\api\recharge.ts) - 充值记录（已存在，需完善）

* `GET /user/recharge/records` - 获取充值记录

* `POST /user/recharge` - 创建充值订单

#### [src/api/wallet.ts](d:\Gitprojects\accompanySystem-vue3\src\api\wallet.ts) - 钱包相关

* `GET /user/consumption/records` - 获取消费记录

* `GET /user/transactions` - 获取交易明细

#### [src/api/feedback.ts](d:\Gitprojects\accompanySystem-vue3\src\api\feedback.ts) - 反馈

* `POST /feedback` - 提交反馈

#### [src/api/upload.ts](d:\Gitprojects\accompanySystem-vue3\src\api\upload.ts) - 文件上传

* `POST /upload/image` - 上传图片

### 4. 更新 Pinia Stores

修改 stores 以使用新的 API：

* [stores/user.ts](d:\Gitprojects\accompanySystem-vue3\src\stores\user.ts) - 集成登录、用户信息 API

* [stores/companion.ts](d:\Gitprojects\accompanySystem-vue3\src\stores\companion.ts) - 集成陪诊师列表 API

* [stores/order.ts](d:\Gitprojects\accompanySystem-vue3\src\stores\order.ts) - 集成订单创建 API

* [stores/message.ts](d:\Gitprojects\accompanySystem-vue3\src\stores\message.ts) - 集成消息 API

### 5. 配置环境变量

创建 `.env.development` 和 `.env.production` 文件：

* `VITE_API_BASE_URL` - API 基础地址

* `VITE_API_TIMEOUT` - 请求超时时间

## 三、RESTful API 规范

### 请求方法规范

* `GET` - 查询资源

* `POST` - 创建资源

* `PUT` - 更新资源（完整更新）

* `PATCH` - 更新资源（部分更新）

* `DELETE` - 删除资源

### 统一响应格式

```typescript
{
  code: number,        // 状态码：200成功，400客户端错误，500服务器错误
  message: string,     // 提示信息
  data: T,            // 实际数据
  timestamp: number    // 时间戳
}
```

### 分页响应格式

```typescript
{
  code: 200,
  message: "success",
  data: {
    items: T[],        // 数据列表
    total: number,     // 总记录数
    page: number,      // 当前页
    pageSize: number   // 每页数量
  }
}
```

## 四、文件清单

将创建/修改以下文件：

* ✏️ 修改 `src/utils/request.ts` - 完善请求拦截器

* ✨ 新建 `src/types/api.ts` - API 类型定义

* ✨ 新建 `src/api/auth.ts` - 认证接口

* ✨ 新建 `src/api/user.ts` - 用户接口

* ✨ 新建 `src/api/patient.ts` - 就诊人接口

* ✨ 新建 `src/api/companion.ts` - 陪诊师接口

* ✨ 新建 `src/api/service.ts` - 服务接口

* ✨ 新建 `src/api/order.ts` - 订单接口

* ✨ 新建 `src/api/message.ts` - 消息接口

* ✏️ 修改 `src/api/recharge.ts` - 完善充值接口

* ✨ 新建 `src/api/wallet.ts` - 钱包接口

* ✨ 新建 `src/api/feedback.ts` - 反馈接口

* ✨ 新建 `src/api/upload.ts` - 上传接口

* ✏️ 修改 stores/\*.ts - 集成 API

* ✨ 新建 `.env.development` - 开发环境配置

* ✨ 新建 `.env.production` - 生产环境配置

## 五、预计工作量

* API 类型定义：\~300 行

* API 模块实现：\~800 行

* Store 改造：\~200 行修改

* 总计：\~1300 行代码

