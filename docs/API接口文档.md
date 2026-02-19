# 陪诊系统后端接口文档

## 📋 更新说明

**最后更新：** 2025-02-16
**版本：** v2.1
**主要变更：**
- ✅ 响应格式改为 HTTP 状态码（200/400/401/500）
- ✅ 新增陪诊师个人信息接口
- ✅ 新增陪诊师接单/拒单接口
- ✅ 新增可预约时间段接口
- ✅ 修正陪诊师评论字段名（userName、time）
- ✅ 删除重复的抢单接口
- ✅ 添加陪诊师关键词搜索
- ✅ 新增字典模块（服务类型、医院、科室）
- ✅ 新增收藏模块（获取列表、添加、取消）
- ✅ 新增上传模块（图片上传）
- ✅ 新增钱包模块（消费记录、交易记录）
- ✅ 新增充值配置接口
- ✅ 新增更新用户资料接口

---

## 1. 接口规范

### 1.1 协议与域名
- **协议：** HTTP/HTTPS
- **基础路径：** `/api`
- **字符编码：** UTF-8
- **数据格式：** JSON

### 1.2 认证方式
- 登录成功后服务端下发 JWT 令牌
- **请求头：** `token: {JWT令牌}`
- 未登录时返回 `401` 状态码

**示例请求头：**
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.3 统一响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

| HTTP 状态码 | code | msg | 说明 |
|-------------|------|-----|------|
| 200 | 200 | 操作成功 | GET、POST、PUT、DELETE 请求成功 |
| 400 | 400 | 请求错误 | 参数错误、数据格式错误 |
| 401 | 401 | 未授权 | Token 无效或过期 |
| 500 | 500 | 服务器错误 | 服务器内部错误 |

### 1.4 分页参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认10 |

### 1.5 分页响应
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 100,
    "list": [],
    "page": 1,
    "size": 10
  }
}
```

---

## 2. 认证模块

### 2.1 用户注册
**接口地址：** `POST /auth/register`

**请求参数：**
```json
{
  "phone": "13800138000",
  "password": "123456",
  "nickname": "张三",
  "verifyCode": "123456"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | 是 | 手机号 |
| password | String | 是 | 密码 |
| nickname | String | 是 | 昵称 |
| verifyCode | String | 是 | 验证码 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "nickname": "张三",
      "avatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
      "phone": "13800138000",
      "balance": 0
    }
  }
}
```

### 2.2 用户登录
**接口地址：** `POST /auth/login`

**请求参数：**
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | 是 | 手机号 |
| password | String | 是 | 密码 |

**响应数据：** 同注册接口

### 2.3 用户退出
**接口地址：** `POST /auth/logout`

**请求头：** 需要认证

**响应数据：**
```json
{
  "code": 200,
  "msg": "退出成功",
  "data": null
}
```

### 2.4 重置密码
**接口地址：** `POST /auth/reset-password`

**请求参数：**
```json
{
  "phone": "13800138000",
  "verifyCode": "123456",
  "newPassword": "654321"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | 是 | 手机号 |
| verifyCode | String | 是 | 验证码 |
| newPassword | String | 是 | 新密码 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "密码修改成功",
  "data": null
}
```

---

## 3. 用户模块

### 3.1 获取用户信息
**接口地址：** `GET /user/profile`

**请求头：** 需要认证

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "nickname": "张三",
    "avatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "phone": "13800138000",
    "balance": 1000.50
  }
}
```

### 3.2 获取用户余额
**接口地址：** `GET /user/balance`

**请求头：** 需要认证

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": 1000.50
}
```

### 3.3 更新用户资料 ✨新增
**接口地址：** `PUT /user/profile`

**请求头：** 需要认证

**请求参数：**
```json
{
  "nickname": "新昵称",
  "avatar": "https://example.com/avatar.jpg"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | String | 否 | 昵称 |
| avatar | String | 否 | 头像URL |

**响应数据：** 同获取用户信息

### 3.4 更新用户头像
**接口地址：** `PUT /user/avatar`

**请求头：** 需要认证

**请求参数：**
```json
{
  "avatar": "https://example.com/avatar.jpg"
}
```

### 3.5 修改密码
**接口地址：** `PUT /user/password`

**请求头：** 需要认证

**请求参数：**
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

---

## 4. 字典模块 ✨新增

### 4.1 获取服务类型列表
**接口地址：** `GET /dict/service-types`

**请求头：** 需要认证

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "门诊陪诊",
      "value": "outpatient"
    },
    {
      "id": 2,
      "name": "住院陪护",
      "value": "inpatient"
    }
  ]
}
```

### 4.2 获取医院列表
**接口地址：** `GET /dict/hospitals`

**请求头：** 需要认证

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | 否 | 搜索关键词 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "北京协和医院",
      "address": "北京市东城区帅府园1号",
      "level": "三甲"
    },
    {
      "id": 2,
      "name": "北京同仁医院",
      "address": "北京市东城区东交民巷1号",
      "level": "三甲"
    }
  ]
}
```

### 4.3 获取科室列表
**接口地址：** `GET /dict/departments`

**请求头：** 需要认证

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| hospitalId | Integer | 否 | 医院ID（筛选特定医院的科室） |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "心内科",
      "hospitalId": 1
    },
    {
      "id": 2,
      "name": "神经内科",
      "hospitalId": 1
    }
  ]
}
```

---

## 5. 收藏模块 ✨新增

### 5.1 获取收藏列表
**接口地址：** `GET /user/favorites`

**请求头：** 需要认证

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 否 | 类型：companion/service |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "type": "companion",
      "itemId": 101,
      "name": "李华",
      "avatar": "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      "description": "资深陪诊师，服务热情周到"
    }
  ]
}
```

### 5.2 添加收藏
**接口地址：** `POST /user/favorites`

**请求头：** 需要认证

**请求参数：**
```json
{
  "type": "companion",
  "itemId": 101
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 是 | 类型：companion/service |
| itemId | Integer | 是 | 收藏项ID |

### 5.3 取消收藏
**接口地址：** `DELETE /user/favorites/{id}`

**请求头：** 需要认证

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 收藏记录ID |

---

## 6. 上传模块 ✨新增

### 6.1 上传图片
**接口地址：** `POST /upload/image`

**请求头：** 需要认证

**请求类型：** `multipart/form-data`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "url": "https://example.com/uploads/image.jpg",
    "filename": "image.jpg"
  }
}
```

**支持的图片格式：** jpg, jpeg, png, gif
**文件大小限制：** 5MB

---

## 7. 钱包模块 ✨新增

### 7.1 获取消费记录
**接口地址：** `GET /user/consumption`

**请求头：** 需要认证

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| size | Integer | 否 | 每页数量 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 20,
    "list": [
      {
        "id": 1,
        "type": "订单支付",
        "amount": -298.00,
        "balance": 702.00,
        "time": "2024-03-20 15:30:00",
        "orderId": "ORD001"
      }
    ],
    "page": 1,
    "size": 10
  }
}
```

### 7.2 获取交易记录
**接口地址：** `GET /user/transactions`

**请求头：** 需要认证

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| size | Integer | 否 | 每页数量 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 25,
    "list": [
      {
        "id": 1,
        "type": "充值",
        "amount": 100.00,
        "balance": 1100.00,
        "time": "2024-03-20 14:00:00"
      },
      {
        "id": 2,
        "type": "订单支付",
        "amount": -298.00,
        "balance": 802.00,
        "time": "2024-03-20 15:30:00",
        "orderId": "ORD001"
      }
    ],
    "page": 1,
    "size": 10
  }
}
```

---

## 8. 就诊人模块

### 4.1 获取就诊人列表
**接口地址：** `GET /user/patients`

**请求头：** 需要认证

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "王五",
      "phone": "13900139000",
      "address": "北京市朝阳区",
      "relationship": "本人",
      "default": true
    }
  ]
}
```

### 4.2 添加就诊人
**接口地址：** `POST /user/patients`

**请求头：** 需要认证

**请求参数：**
```json
{
  "name": "王五",
  "phone": "13900139000",
  "address": "北京市朝阳区",
  "relationship": "本人"
}
```

### 4.3 更新就诊人
**接口地址：** `PUT /user/patients/{id}`

### 4.4 删除就诊人
**接口地址：** `DELETE /user/patients/{id}`

### 4.5 设置默认就诊人
**接口地址：** `PUT /user/patients/{id}/default`

---

## 5. 服务模块

### 5.1 获取服务列表
**接口地址：** `GET /services`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 否 | 类型：companion/agency |
| sort | String | 否 | 排序：price_asc/price_desc/sales_desc |
| keyword | String | 否 | 搜索关键词 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "全程陪诊服务",
      "description": "专业陪诊师全程陪同，包括取号、缴费、取药等",
      "price": 298,
      "sales": 1200,
      "duration": "4小时",
      "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500",
      "type": "companion"
    }
  ]
}
```

### 5.2 获取服务详情
**接口地址：** `GET /services/{id}`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 服务ID |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "name": "全程陪诊服务",
    "description": "专业陪诊师全程陪同，包括取号、缴费、取药等",
    "price": 298,
    "sales": 1200,
    "duration": "4小时",
    "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500",
    "intro": "1. 专业陪诊师一对一服务\n2. 协助办理就诊卡、缴费、取药\n3. 陪同检查、候诊\n4. 记录医嘱，整理病历资料",
    "notes": "1. 请至少提前1天预约\n2. 服务期间产生的交通费、挂号费等由客户承担\n3. 如需取消，请提前2小时通知"
  }
}
```

### 5.3 获取服务分类
**接口地址：** `GET /services/categories`

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "门诊陪诊",
      "icon": "https://example.com/icon.png"
    }
  ]
}
```

### 5.4 获取可预约时间段 ✨新增
**接口地址：** `GET /services/{id}/available-times`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 服务ID |
| date | String | 是 | 日期，格式：YYYY-MM-DD |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "time": "09:00",
      "status": "available"
    },
    {
      "time": "09:30",
      "status": "booked"
    },
    {
      "time": "10:00",
      "status": "available"
    }
  ]
}
```

**字段说明：**
- `time`: 时间，格式 HH:mm
- `status`: 状态
  - `available`: 可预约（绿色显示，可点击）
  - `booked`: 已预约（灰色显示，不可点击）

---

## 6. 陪诊师模块

### 6.1 获取陪诊师列表
**接口地址：** `GET /companions`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| size | Integer | 否 | 每页数量 |
| gender | String | 否 | 性别：male/female |
| service | Integer | 否 | 服务类型ID |
| sort | String | 否 | 排序：score_desc/orders_desc |
| keyword | String | 否 | 搜索关键词（按姓名搜索）✨新增 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 50,
    "list": [
      {
        "id": 101,
        "name": "李华",
        "avatar": "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        "gender": "female",
        "age": 28,
        "score": 4.9,
        "orders": 156,
        "comments": 89,
        "experience": "从业3年",
        "services": [1, 2],
        "rating": 4.9,
        "tags": ["耐心", "专业"],
        "intro": "资深陪诊师，服务热情周到",
        "collected": 0
      }
    ],
    "page": 1,
    "size": 50
  }
}
```

**重要字段说明：**
- ✅ `experience`: **必填**，从业年限（如"从业3年"）
- ✅ `age`: **必填**，年龄（数字）
- ✅ `orders`: **必填**，接单数（数字）
- ✅ `score`: **必填**，评分（0-5）
- ✅ `comments`: **必填**，评论数（数字）
- `avatar`: 可选，为空时前端使用默认头像

### 6.2 获取陪诊师详情
**接口地址：** `GET /companions/{id}`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 陪诊师ID |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 101,
    "name": "李华",
    "avatar": "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    "gender": "female",
    "age": 28,
    "score": 4.9,
    "orders": 156,
    "comments": 89,
    "experience": "从业3年",
    "services": [1, 2],
    "rating": 4.9,
    "tags": ["耐心", "专业"],
    "intro": "资深陪诊师，服务热情周到，熟悉各大医院流程"
  }
}
```

### 6.3 获取陪诊师评论
**接口地址：** `GET /companions/{id}/comments`

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 陪诊师ID |

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| size | Integer | 否 | 每页数量 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 89,
    "list": [
      {
        "id": 1,
        "userName": "张女士",
        "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
        "score": 5,
        "content": "非常专业，帮我节省了很多时间，推荐！",
        "time": "2024-03-15 10:30:00"
      }
    ],
    "page": 1,
    "size": 10
  }
}
```

**重要：字段名是 `userName` 和 `time`，不是 `username` 和 `date`！**

### 6.4 收藏/取消收藏陪诊师
**接口地址：** `POST /companions/{id}/favorite`

**请求头：** 需要认证

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Integer | 是 | 陪诊师ID |

---

## 7. 陪诊师工作台模块

### 7.1 获取陪诊师个人信息 ✨新增
**接口地址：** `GET /companion/profile`

**请求头：** 需要认证（陪诊师身份）

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 101,
    "name": "李华",
    "avatar": "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    "experience": "从业3年",
    "gender": "female",
    "age": 28
  }
}
```

### 7.2 获取陪诊师统计数据
**接口地址：** `GET /companion/statistics`

**请求头：** 需要认证（陪诊师身份）

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "todayIncome": 596.00,
    "todayOrders": 2,
    "rating": 4.9,
    "followers": 89,
    "totalOrders": 156,
    "workDays": 180
  }
}
```

### 7.3 获取可接订单列表（抢单大厅）
**接口地址：** `GET /companion/available-orders`

**请求头：** 需要认证（陪诊师身份）

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| size | Integer | 否 | 每页数量 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 20,
    "list": [
      {
        "id": "20240320001",
        "serviceName": "全程陪诊服务",
        "patientName": "王先生",
        "hospital": "北京协和医院",
        "department": "心内科",
        "appointmentTime": "2024-03-21 09:00",
        "amount": 298.00
      }
    ],
    "page": 1,
    "size": 50
  }
}
```

### 7.4 陪诊师接单 ✨新增
**接口地址：** `PUT /companion/orders/{orderId}/accept`

**请求头：** 需要认证（陪诊师身份）

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | String | 是 | 订单ID |

**响应数据：**
```json
{
  "code": 200,
  "msg": "接单成功",
  "data": {
    "id": "20240320001",
    "status": 2,
    "serviceName": "全程陪诊服务",
    "appointmentTime": "2024-03-21 09:00:00"
  }
}
```

### 7.5 陪诊师拒单 ✨新增
**接口地址：** `PUT /companion/orders/{orderId}/reject`

**请求头：** 需要认证（陪诊师身份）

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | String | 是 | 订单ID |

**请求参数：**
```json
{
  "reason": "时间冲突"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reason | String | 否 | 拒单原因 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "已拒绝订单",
  "data": null
}
```

### 7.6 获取陪诊师订单列表
**接口地址：** `GET /companion/orders`

**请求头：** 需要认证（陪诊师身份）

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| size | Integer | 否 | 每页数量 |
| status | Integer | 否 | 订单状态（1=待接单，2=待服务，3=服务中） |

### 7.7 获取陪诊师收入明细
**接口地址：** `GET /companion/income`

**请求头：** 需要认证（陪诊师身份）

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| size | Integer | 否 | 每页数量 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 8,
    "list": [
      {
        "id": 1,
        "orderId": "ORD001",
        "serviceName": "全程陪诊",
        "amount": 198.00,
        "time": "2024-03-21 14:30:00",
        "status": "completed"
      }
    ],
    "page": 1,
    "size": 10
  }
}
```

### 7.8 更新陪诊师在线状态
**接口地址：** `POST /companion/status`

**请求头：** 需要认证（陪诊师身份）

**请求参数：**
```json
{
  "isOnline": true
}
```

---

## 8. 订单模块

### 8.1 获取用户订单列表
**接口地址：** `GET /user/orders`

**请求头：** 需要认证

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| size | Integer | 否 | 每页数量 |
| status | Integer | 否 | 订单状态 |

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 10,
    "list": [
      {
        "id": "20240320001",
        "serviceName": "全程陪诊服务",
        "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500",
        "price": 298,
        "status": 2,
        "createTime": "2024-03-20 10:00:00",
        "payTime": "2024-03-20 10:05:00",
        "appointmentTime": "2024-03-21 09:00:00",
        "patientName": "张三",
        "phone": "138****1234",
        "hospital": "北京协和医院",
        "department": "心内科",
        "pickupOption": "自行前往",
        "remarks": "",
        "companionId": 101,
        "companionName": "李华",
        "companionAvatar": "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        "companionPhone": "139****5678"
      }
    ],
    "page": 1,
    "size": 10
  }
}
```

**订单状态说明：**
| 状态值 | 说明 |
|--------|------|
| 1 | 待付款 |
| 2 | 待服务 |
| 3 | 服务中 |
| 4 | 已完成 |
| 5 | 退款/售后 |

### 8.2 创建订单
**接口地址：** `POST /user/orders`

**请求头：** 需要认证

**请求参数：**
```json
{
  "serviceId": 1,
  "companionId": 101,
  "patientId": 1,
  "hospital": "北京协和医院",
  "department": "内科",
  "appointmentTime": "2024-03-21 09:00:00",
  "pickupOption": "none",
  "remarks": "",
  "paymentMethod": "balance"
}
```

### 8.3 获取订单详情
**接口地址：** `GET /user/orders/{id}`

**请求头：** 需要认证

### 8.4 取消订单
**接口地址：** `PUT /user/orders/{id}/cancel`

### 8.5 支付订单
**接口地址：** `POST /user/orders/{id}/pay`

### 8.6 确认订单完成
**接口地址：** `PUT /user/orders/{id}/confirm`

### 8.7 提交评价
**接口地址：** `POST /user/orders/{id}/comment`

**请求参数：**
```json
{
  "score": 5,
  "content": "服务非常好！"
}
```

---

## 9. 充值模块

### 9.1 获取充值记录
**接口地址：** `GET /user/recharge/records`

**请求头：** 需要认证

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "amount": 100.00,
      "method": "wechat",
      "time": "2024-03-20 15:30:00",
      "status": "success"
    }
  ]
}
```

### 9.2 充值
**接口地址：** `POST /user/recharge`

**请求头：** 需要认证

**请求参数：**
```json
{
  "amount": 100,
  "method": "wechat"
}
```

**响应数据：**
```json
{
  "code": 200,
  "msg": "充值成功",
  "data": {
    "orderId": "R20240320001",
    "amount": 100.00,
    "balance": 1100.50
  }
}
```

### 9.3 获取充值配置 ✨新增
**接口地址：** `GET /user/recharge/config`

**请求头：** 需要认证

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "amounts": [50, 100, 200, 500, 1000],
    "methods": [
      {
        "value": "wechat",
        "name": "微信支付",
        "icon": "https://example.com/wechat.png"
      },
      {
        "value": "alipay",
        "name": "支付宝",
        "icon": "https://example.com/alipay.png"
      }
    ]
  }
}
```

**字段说明：**
- `amounts`: 推荐充值金额数组
- `methods`: 支付方式列表
  - `value`: 支付方式值
  - `name`: 显示名称
  - `icon`: 图标URL

---

## 10. 消息模块

### 10.1 获取消息会话列表
**接口地址：** `GET /user/messages`

**请求头：** 需要认证

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": "1",
      "userId": 101,
      "userName": "李华",
      "userAvatar": "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      "lastMessage": "好的，明天见",
      "lastTime": "2024-03-20 18:30"
    }
  ]
}
```

### 10.2 获取未读消息数
**接口地址：** `GET /user/messages/unread-count`

**请求头：** 需要认证

**响应数据：**
```json
{
  "code": 200,
  "msg": "success",
  "data": 5
}
```

### 10.3 标记消息已读
**接口地址：** `PUT /user/messages/{id}/read`

### 10.4 删除消息会话
**接口地址：** `DELETE /user/messages/{id}`

---

## 11. 聊天模块

### 11.1 获取聊天消息列表
**接口地址：** `GET /user/chats/{type}`

**请求头：** 需要认证

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 是 | 聊天类型（订单ID等） |

### 11.2 发送聊天消息
**接口地址：** `POST /user/chats/{type}/messages`

### 11.3 删除聊天
**接口地址：** `DELETE /user/chats/{type}`

---

## 附录 A：数据模型

### User（用户）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户ID |
| nickname | String | 昵称 |
| avatar | String | 头像URL（可为空） |
| phone | String | 手机号 |
| balance | BigDecimal | 余额 |

### Companion（陪诊师）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 陪诊师ID |
| name | String | 是 | 姓名 |
| avatar | String | 否 | 头像URL |
| gender | String | 否 | 性别：male/female |
| age | Integer | **是** | 年龄 |
| score | BigDecimal | **是** | 评分（0-5） |
| orders | Integer | **是** | 接单数 |
| comments | Integer | **是** | 评论数 |
| experience | String | **是** | 从业年限（如"从业3年"） |
| services | Integer[] | 否 | 提供的服务ID列表 |
| rating | BigDecimal | 否 | 评分（备用） |
| tags | String[] | 否 | 标签数组 |
| intro | String | 否 | 个人简介 |

### CompanionReview（陪诊师评论）
| 字段 | 类型 | **必填** | 说明 |
|------|------|----------|------|
| id | Long | 是 | 评论ID |
| userName | String | **是** | 用户名（注意不是 username！） |
| userAvatar | String | 否 | 用户头像 |
| score | Integer | **是** | 评分（1-5） |
| content | String | **是** | 评论内容 |
| images | String[] | 否 | 图片列表 |
| time | String | **是** | 时间（注意不是 date！） |

### Order（订单）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 订单ID |
| serviceName | String | 服务名称 |
| image | String | 服务图片 |
| price | Decimal | 订单金额 |
| status | Integer | 订单状态 |
| appointmentTime | String | 预约时间 |
| patientName | String | 就诊人姓名 |
| phone | String | 联系电话 |
| hospital | String | 医院 |
| department | String | 科室 |
| companionId | Long | 陪诊师ID |
| companionName | String | 陪诊师姓名 |
| companionAvatar | String | 陪诊师头像 |
| clientComment | Object | 用户评价（已完成订单时返回） |

---

## 附录 B：错误码

| HTTP 状态码 | code | msg | 说明 |
|-------------|------|-----|------|
| 200 | 200 | 操作成功 | GET、POST、PUT、DELETE 请求成功 |
| 400 | 400 | 请求错误 | 参数错误、数据格式错误 |
| 401 | 401 | 未授权 | Token 无效或过期 |
| 500 | 500 | 服务器错误 | 服务器内部错误 |

---

## 附录 C：Apifox Mock 配置要点

### 关键字段检查清单

#### 陪诊师列表（GET /api/companions）
- ✅ 必须包含：`id`, `name`, `gender`, `age`, `score`, `orders`, `comments`, `experience`
- ✅ `avatar` 可以为空，前端会使用默认头像
- ✅ `experience` 格式如："从业3年"

#### 陪诊师评论（GET /api/companions/{id}/comments）
- ⚠️ 字段名必须是 `userName`（不是 `username`）
- ⚠️ 字段名必须是 `time`（不是 `date`）

#### 可预约时间段（GET /api/services/{id}/available-times）
- ✅ `status` 只能是 `available` 或 `booked`
- ✅ `time` 格式为 HH:mm（如 "09:00"）

#### 充值配置（GET /api/user/recharge/config）✨新增
- ✅ 返回 `amounts` 数组（推荐充值金额）
- ✅ 返回 `methods` 数组（支付方式列表）
- ✅ 每个支付方式包含 `value`, `name`, `icon`

#### 医院列表（GET /api/dict/hospitals）✨新增
- ✅ 返回医院数组，包含 `id`, `name`, `address`, `level`

#### 科室列表（GET /api/dict/departments）✨新增
- ✅ 返回科室数组，包含 `id`, `name`, `hospitalId`

#### 充值记录（GET /api/user/recharge/records）
- ✅ 返回数组（非分页），包含 `id`, `amount`, `method`, `time`, `status`
- ✅ `status` 可选值：`success`, `pending`, `failed`
