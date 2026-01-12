# iDesign Lab 后端 API 文档

## 基本信息

- **基础 URL**：`http://localhost:8080/api/v1`
- **认证方式**：所有受保护接口需在请求头添加 `Authorization: Bearer <JWT>`
- **数据格式**：`application/json; charset=utf-8`
- **多媒体上传**：`multipart/form-data`
- **默认时区**：`Asia/Shanghai`

## 目录

- [认证](#认证)
- [用户管理](#用户管理)
- [预约管理](#预约管理)
- [实验室管理](#实验室管理)
- [设备管理](#设备管理)
- [课程管理](#课程管理)
- [学期管理](#学期管理)
- [数据导出](#数据导出)
- [枚举与参考信息](#枚举与参考信息)

---

## 认证

### POST `/auth/register`

- **说明**：学生或临时用户注册。成功后状态为 `pending`，等待教师或管理员审核。
- **请求体**
  ```json
  {
    "name": "张三",
    "account": "student001",
    "password": "Passw0rd!",
    "phone": "13800000000",
    "grade": "2024级",
    "purpose": "参观实验室",
    "role": "student"
  }
  ```
- **成功响应**
  ```json
  {
    "code": 201,
    "message": "注册成功，请等待管理员审核",
    "data": {
      "status": "pending"
    }
  }
  ```
- **典型错误**
  - 400 参数缺失或格式错误
  - 400 账号已存在

### POST `/auth/login`

- **说明**：账号密码登录，返回 JWT。
- **请求体**
  ```json
  {
    "account": "student001",
    "password": "Passw0rd!"
  }
  ```
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "role": "student",
      "account": "student001",
      "name": "张三",
      "phone": "13800000000"
    }
  }
  ```
- **典型错误**
  - 400 参数验证失败
  - 401 用户不存在或密码错误
  - 403 账号未通过审核或被封禁

### POST `/auth/change-password` _(需登录)_

- **说明**：变更当前登录用户的密码。
- **请求体**
  ```json
  {
    "old_password": "Passw0rd!",
    "new_password": "NewPassw0rd!"
  }
  ```
- **成功响应**
  ```json
  { "code": 200, "message": "密码修改成功" }
  ```

### POST `/auth/reset-password`

- **说明**：通过账号 + 绑定手机号重置密码，无需登录。
- **请求体**
  ```json
  {
    "account": "student001",
    "phone": "13800000000",
    "new_password": "ResetPass123"
  }
  ```
- **成功响应**
  ```json
  { "code": 200, "message": "密码重置成功" }
  ```

---

## 用户管理

### GET `/users/me` _(需登录)_

- **说明**：返回当前登录用户的完整信息。
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "获取当前用户信息成功",
    "data": {
      "id": 5,
      "name": "张三",
      "account": "student001",
      "phone": "13800000000",
      "role": "student",
      "status": "approved",
      "grade": "2024级",
      "purpose": "",
      "created_at": "2025-01-10T01:00:00Z",
      "updated_at": "2025-01-10T01:00:00Z"
    }
  }
  ```

### GET `/users` _(需教师或管理员权限)_

- **说明**：获取用户列表，支持筛选与分页；默认仅返回学生/临时用户，指定 `role` 可查看其它角色。
- **查询参数**
  | 名称 | 说明 |
  |------|------|
  | `q` _(可选)_ | 关键词，匹配 `name/account/email/phone` |
  | `role` _(可选)_ | 用户角色（`student/teacher/admin/temporary`） |
  | `status` _(可选)_ | 用户状态（`pending/approved/rejected/banned`） |
  | `page` _(可选)_ | 页码（>=1，默认 1） |
  | `size` _(可选)_ | 每页条数（默认 20，最大 100） |
- **响应字段**
  ```json
  {
    "code": 200,
    "message": "获取用户列表成功",
    "data": {
      "items": [],
      "total": 0
    }
  }
  ```
  传入分页参数时响应示例：
  ```json
  {
    "code": 200,
    "message": "获取用户列表成功",
    "data": {
      "items": [
        {
          "id": 12,
          "name": "张三",
          "account": "student01",
          "email": "student01@example.com",
          "phone": "13800000000",
          "role": "student",
          "status": "approved",
          "created_at": "2025-10-10T01:00:00Z",
          "updated_at": "2025-10-12T01:00:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "size": 20,
        "total": 1
      }
    }
  }
  ```

### GET `/users/:id` _(需教师或管理员权限)_

- **说明**：获取指定用户详情。

### PATCH `/users` _(需教师或管理员权限)_

- **说明**：批量更新用户状态（审批、封禁、解封）。
- **请求体**
  ```json
  {
    "user_ids": [5, 6],
    "status": "approved",
    "reason": "材料齐全"
  }
  ```
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "用户状态更新成功",
    "data": {
      "updated_count": 2,
      "status": "approved",
      "user_ids": [5, 6]
    }
  }
  ```

---

## 预约管理

> 所有接口需登录；取消预约要求创建者、教师或管理员身份。

### GET `/reservations`

- **说明**：按条件查询预约记录；若不带分页参数返回全部结果，指定 `page`/`size` 时返回对应页面。
- **查询参数**
  | 名称 | 说明 |
  |------|------|
  | `start_date` / `end_date` | 日期范围（`YYYY-MM-DD`） |
  | `time_slot` | 时间段（`morning` / `noon` / `afternoon` / `evening`） |
  | `lab_id` | 预约实验室 ID |
  | `creator_account` | 创建者账号 |
  | `participant_account` | 参与者账号 |
  | `user_id` | 该用户作为创建者或参与者的预约 |
  | `status` | 动态状态筛选（`pending` / `in_progress` / `completed` / `cancelled` / `violated`） |
  | `page` _(可选)_ | 页码（>=1） |
  | `size` _(可选)_ | 每页条数（1-100） |
- **成功响应（未分页）**
  ```json
  {
    "code": 200,
    "message": "获取预约列表成功",
    "data": {
      "items": [
        {
          "id": 42,
          "created_at": "2025-10-12T01:20:00Z",
          "updated_at": "2025-10-12T01:20:00Z",
          "deleted_at": null,
          "creator_id": 7,
          "creator_account": "teacher01",
          "creator_name": "李老师",
          "purpose": "课程准备",
          "date": "2025-10-20T00:00:00Z",
          "time_slot": "afternoon",
          "lab_id": 10005,
          "status": "pending",
          "photo_urls": [],
          "photos_by_category": {
            "hygiene": [],
            "window": [],
            "access": []
          },
          "participants": [
            {
              "user_id": 12,
              "account": "student01",
              "name": "张三",
              "role": "student"
            }
          ]
        }
      ],
      "total": 1
    }
  }
  ```
- **成功响应（分页）**
  ```json
  {
    "code": 200,
    "message": "获取预约列表成功",
    "data": {
      "items": [
        /* 当前页数据 */
      ],
      "pagination": {
        "page": 2,
        "size": 20,
        "total": 45
      }
    }
  }
  ```

### GET `/reservations/:id`

- **说明**：查询单条预约详情，响应结构与列表项一致。

### POST `/reservations`

- **说明**：创建预约；参与者限制为 1–3 个账号，且学期、实验室、课程占用、房间容量均会校验。
- **请求体**
  ```json
  {
    "purpose": "团队讨论",
    "date": "2025-10-20",
    "time_slot": "afternoon",
    "lab_id": 10005,
    "participant_accounts": ["student01", "student02"]
  }
  ```
- **成功响应**
  ```json
  {
    "code": 201,
    "message": "多人预约创建成功",
    "data": {
      "id": 42,
      "creator_id": 7,
      "purpose": "团队讨论",
      "date": "2025-10-20T00:00:00Z",
      "time_slot": "afternoon",
      "lab_id": 10005,
      "participants": [
        { "user_id": 12, "name": "张三", "role": "student" },
        { "user_id": 13, "name": "李四", "role": "student" }
      ],
      "created_at": "2025-10-12T01:20:00Z"
    }
  }
  ```

### DELETE `/reservations/:id`

- **说明**：取消预约；只有创建者、教师或管理员可操作，且仅在预约日期到来前允许。
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "预约取消成功",
    "data": {
      "id": 42,
      "date": "2025-10-20T00:00:00Z",
      "time_slot": "afternoon",
      "lab_id": 10005,
      "canceled_at": "2025-10-13T01:45:00Z"
    }
  }
  ```

### POST `/reservations/:id/photos`

- **说明**：上传预约完成后的照片，字段 `photos` 支持多文件。
- **查询参数**：`category=hygiene|window|access`
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "照片上传成功",
    "data": {
      "reservation_id": 42,
      "category": "access",
      "new_upload_count": 2,
      "category_photo_count": 2,
      "total_photo_count": 2,
      "remaining_slots": { "hygiene": 2, "window": 2, "access": 0 },
      "photos_by_category": {
        "hygiene": [],
        "window": [],
        "access": [
          "/uploads/photos/1699999999999_42_access_0.jpg",
          "/uploads/photos/1699999999999_42_access_1.jpg"
        ]
      }
    }
  }
  ```

---

## 实验室管理

> 实验室列表与详情需登录可访问；新增/更新/删除仅教师或管理员可操作。

### GET `/labs`

- **说明**：获取实验室列表；未传分页参数时返回全部，指定 `page`/`size` 时分页。
- **查询参数**
  | 名称 | 说明 |
  |------|------|
  | `q` _(可选)_ | 关键词（模糊匹配 `lab_name`/`lab_number`/`teacher`/`material`） |
  | `lab_number` _(可选)_ | 实验室编号 |
  | `teacher` _(可选)_ | 负责人 |
  | `material` _(可选)_ | 材料分类 |
  | `page` _(可选)_ | 页码（>=1） |
  | `size` _(可选)_ | 每页条数（1-100） |
- **成功响应（未分页）**
  ```json
  {
    "code": 200,
    "message": "获取实验室列表成功",
    "data": {
      "items": [
        {
          "id": 10001,
          "lab_name": "快速成型实验室",
          "lab_number": "320",
          "teacher": "李老师",
          "rules": "1. ...",
          "image": "/uploads/labs/320.jpeg",
          "material": "",
          "capacity": 3,
          "created_at": "2025-10-12T01:00:00Z",
          "updated_at": "2025-10-12T01:00:00Z"
        }
      ],
      "total": 1
    }
  }
  ```
- **成功响应（分页）**
  ```json
  {
    "code": 200,
    "message": "获取实验室列表成功",
    "data": {
      "items": [
        /* 当前页实验室 */
      ],
      "pagination": {
        "page": 1,
        "size": 20,
        "total": 12
      }
    }
  }
  ```

### GET `/labs/{id}`

- **说明**：获取实验室详情。
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "获取实验室详情成功",
    "data": {
      "id": 10001,
      "lab_name": "快速成型实验室",
      "lab_number": "320",
      "teacher": "李老师",
      "rules": "1. ...",
      "image": "/uploads/labs/320.jpeg",
      "material": "",
      "capacity": 3,
      "created_at": "2025-10-12T01:00:00Z",
      "updated_at": "2025-10-12T01:00:00Z"
    }
  }
  ```

### POST `/labs`

- **说明**：创建实验室（教师/管理员），仅支持 `multipart/form-data`，图片必须上传并自动写入 `image` 字段。
- **请求体（multipart/form-data）**
  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | `lab_name` | string | 是 | 实验室名称 |
  | `lab_number` | string | 是 | 实验室编号 |
  | `teacher` | string | 否 | 负责人 |
  | `rules` | string | 否 | 实验室规则 |
  | `material` | string | 否 | 材料分类 |
  | `capacity` | int | 是 | 容量 |
  | `image` | file | 是 | 实验室图片（JPG/PNG） |
- **成功响应**
  ```json
  {
    "code": 201,
    "message": "实验室创建成功",
    "data": {
      "id": 10008,
      "lab_name": "快速成型实验室",
      "lab_number": "320",
      "teacher": "李老师",
      "rules": "1. ...",
      "image": "/uploads/labs/320.jpeg",
      "material": "",
      "capacity": 3,
      "created_at": "2025-10-12T01:00:00Z",
      "updated_at": "2025-10-12T01:00:00Z"
    }
  }
  ```

### PUT `/labs/{id}`

- **说明**：更新实验室（教师/管理员），仅支持 `multipart/form-data`，图片可选；未上传则保留原图。
- **请求体**：同创建实验室（multipart），`image` 可选
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "实验室更新成功",
    "data": {
      "id": 10001,
      "lab_name": "快速成型实验室",
      "lab_number": "320",
      "teacher": "李老师",
      "rules": "1. ...",
      "image": "/uploads/labs/320.jpeg",
      "material": "",
      "capacity": 3,
      "created_at": "2025-10-12T01:00:00Z",
      "updated_at": "2025-10-12T02:00:00Z"
    }
  }
  ```

### DELETE `/labs/{id}`

- **说明**：删除实验室（教师/管理员）。若有关联课程/预约，返回 409。
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "实验室删除成功"
  }
  ```

---

## 设备管理

> 设备列表与详情需登录可访问；新增/更新/删除仅教师或管理员可操作。

### GET `/equipments`

- **说明**：获取设备列表；未传分页参数时返回全部，指定 `page`/`size` 时分页。
- **查询参数**
  | 名称 | 说明 |
  |------|------|
  | `lab_id` _(可选)_ | 实验室 ID |
  | `q` _(可选)_ | 关键词（匹配 `name`/`model`/`category`） |
  | `category` _(可选)_ | 设备分类 |
  | `status` _(可选)_ | 状态（`available` / `maintenance` / `out_of_service`） |
  | `page` _(可选)_ | 页码（>=1） |
  | `size` _(可选)_ | 每页条数（1-100） |
- **成功响应（未分页）**
  ```json
  {
    "code": 200,
    "message": "获取设备列表成功",
    "data": {
      "items": [
        {
          "id": 1,
          "lab_id": 10001,
          "name": "3D 打印机",
          "category": "加工设备",
          "model": "Model X",
          "status": "available",
          "created_at": "2025-10-12T01:00:00Z",
          "updated_at": "2025-10-12T01:00:00Z"
        }
      ],
      "total": 1
    }
  }
  ```
- **成功响应（分页）**
  ```json
  {
    "code": 200,
    "message": "获取设备列表成功",
    "data": {
      "items": [
        /* 当前页设备 */
      ],
      "pagination": {
        "page": 1,
        "size": 20,
        "total": 12
      }
    }
  }
  ```

### GET `/equipments/{id}`

- **说明**：获取设备详情。

### POST `/equipments`

- **说明**：创建设备（教师/管理员）。
- **请求体**
  ```json
  {
    "lab_id": 10001,
    "name": "3D 打印机",
    "category": "加工设备",
    "model": "Model X",
    "status": "available"
  }
  ```
- **成功响应**
  ```json
  {
    "code": 201,
    "message": "设备创建成功",
    "data": {
      "id": 1,
      "lab_id": 10001,
      "name": "3D 打印机",
      "category": "加工设备",
      "model": "Model X",
      "status": "available",
      "created_at": "2025-10-12T01:00:00Z",
      "updated_at": "2025-10-12T01:00:00Z"
    }
  }
  ```

### PATCH `/equipments/{id}`

- **说明**：更新设备（教师/管理员）。
- **请求体**：可部分字段
  ```json
  {
    "status": "maintenance"
  }
  ```

### DELETE `/equipments/{id}`

- **说明**：删除设备（教师/管理员）。
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "设备删除成功"
  }
  ```

---

## 课程管理

> 仅教师或管理员可创建/删除课程，任何已登录用户均可查看。

### GET `/courses`

- **说明**：按条件查询课程信息；未传分页参数时返回全部课程，指定 `page`/`size` 时分页。
- **查询参数**
  | 名称 | 说明 |
  |------|------|
  | `lab_id` | 实验室 ID |
  | `start_date` / `end_date` | 日期范围（`YYYY-MM-DD`） |
  | `time_slot` | 时间段（`morning` / `noon` / `afternoon` / `evening`） |
  | `page` _(可选)_ | 页码（>=1） |
  | `size` _(可选)_ | 每页条数（1-100） |
- **成功响应（未分页）**
  ```json
  {
    "code": 200,
    "message": "获取课程记录成功",
    "data": {
      "items": [
        {
          "id": 18,
          "created_at": "2025-10-12T01:00:00Z",
          "updated_at": "2025-10-12T01:00:00Z",
          "deleted_at": null,
          "lab_id": 10005,
          "date": "2025-10-20T00:00:00Z",
          "time_slot": "morning",
          "reason": "工业设计基础课程",
          "created_by": 7
        }
      ],
      "total": 1
    }
  }
  ```
- **成功响应（分页）**
  ```json
  {
    "code": 200,
    "message": "获取课程记录成功",
    "data": {
      "items": [
        /* 当前页课程 */
      ],
      "pagination": {
        "page": 1,
        "size": 20,
        "total": 12
      }
    }
  }
  ```

### POST `/courses`

- **说明**：创建课程，需确保目标时间段内无课程也无预约。
- **请求体**
  ```json
  {
    "lab_id": 10005,
    "date": "2025-10-20",
    "time_slot": "morning",
    "reason": "工业设计基础课程"
  }
  ```
- **成功响应**
  ```json
  {
    "code": 201,
    "message": "课程创建成功",
    "data": {
      "id": 18,
      "lab_id": 10005,
      "date": "2025-10-20T00:00:00Z",
      "time_slot": "morning",
      "reason": "工业设计基础课程",
      "created_by": 7,
      "created_at": "2025-10-12T01:00:00Z",
      "updated_at": "2025-10-12T01:00:00Z"
    }
  }
  ```

### DELETE `/courses/:id`

- **说明**：删除指定课程（软删除），返回被删除的课程记录。
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "课程删除成功",
    "data": {
      "id": 18,
      "deleted_at": "2025-10-13T01:55:00Z",
      "lab_id": 10005,
      "date": "2025-10-20T00:00:00Z",
      "time_slot": "morning",
      "reason": "工业设计基础课程",
      "created_by": 7
    }
  }
  ```

---

## 学期管理

### GET `/semesters/current` _(需登录)_

- **说明**：所有认证用户可获取当前激活学期。

### GET `/semesters`

- **说明**：教师/管理员查看学期列表，支持分页与激活状态过滤。
- **查询参数**
  | 名称 | 说明 |
  |------|------|
  | `page` | 页码，默认 1 |
  | `size` | 每页条数，默认 10 |
  | `is_active` | `true` / `false`，可选 |
- **成功响应**
  ```json
  {
    "code": 200,
    "message": "获取学期列表成功",
    "data": {
      "items": [
        {
          "id": 1,
          "name": "2025 春季学期",
          "start_date": "2025-02-24T00:00:00Z",
          "end_date": "2025-06-30T00:00:00Z",
          "is_active": true
        }
      ],
      "pagination": {
        "page": 1,
        "size": 10,
        "total": 3
      }
    }
  }
  ```

### POST `/semesters`

- **说明**：教师/管理员创建新学期；若 `is_active=true` 会自动切换为当前学期。
- **请求体**
  ```json
  {
    "name": "2025 秋季学期",
    "start_date": "2025-09-01",
    "end_date": "2026-01-15",
    "is_active": false
  }
  ```

### PUT `/semesters/:id`

- **说明**：教师/管理员更新指定学期信息。

---

## 数据导出

### GET `/export/reservations`

- **说明**：教师或管理员导出预约数据。
- **查询参数**：`start_date=YYYY-MM-DD`、`end_date=YYYY-MM-DD`、`format=excel|json`
- **成功响应（format=json）**
  ```json
  {
    "code": 200,
    "message": "导出预约数据成功",
    "data": {
      "items": [
        {
          "id": 42,
          "creator_id": 7,
          "creator_account": "teacher01",
          "creator_name": "李老师",
          "purpose": "课程准备",
          "date": "2025-10-20T00:00:00Z",
          "time_slot": "afternoon",
          "time_range": "13:00-14:30",
          "lab_id": 10005,
          "lab_number": "D505",
          "lab_name": "工业设计实验室",
          "participants": [
            {
              "user_id": 12,
              "account": "student01",
              "name": "张三",
              "role": "student"
            }
          ],
          "photo_urls": [],
          "photos_by_category": { "hygiene": [], "window": [], "access": [] }
        }
      ],
      "total": 1
    }
  }
  ```
- **成功响应（format=excel）**：返回二进制 Excel 文件，文件名形如 `预约数据_2025-10-01_2025-10-31.xlsx`，包含“预约数据”与“预约统计”两个工作表。

---

## 枚举与参考信息

### 时间段

| 值          | 时间范围 (24h) |
| ----------- | -------------- |
| `morning`   | 09:00 – 10:30  |
| `noon`      | 10:30 – 12:00  |
| `afternoon` | 13:00 – 14:30  |
| `evening`   | 14:30 – 16:00  |

### 用户角色

| 值          | 说明     |
| ----------- | -------- |
| `student`   | 学生     |
| `teacher`   | 教师     |
| `admin`     | 管理员   |
| `temporary` | 临时用户 |

### 用户状态

| 值         | 说明     |
| ---------- | -------- |
| `pending`  | 待审核   |
| `approved` | 审核通过 |
| `rejected` | 审核拒绝 |
| `banned`   | 已封禁   |

### 预约状态（动态计算 + 持久化状态）

| 值            | 说明                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `pending`     | 尚未到预约开始时间（或已创建但未到开始时间）                                                                 |
| `in_progress` | 当前时间处于预约时间段内，且未被取消/未违规                                                                  |
| `completed`   | 预约时间段已结束，且流程已正常完成（包括已审核通过的补交情况）                                               |
| `cancelled`   | 预约已取消（包括软删除）                                                                                     |
| `violated`    | 预约结束且超出宽限期后仍未按要求提交照片，被系统判定为违规，并触发自动封禁                                   |
| `repaired`    | 违规后已补交关键照片（门禁照），用于标记“已补救”的违规预约；在用户解封时，这些记录会被批量归档为 `completed` |

### 种子账号

- 管理员：`SEED_ADMIN_ACCOUNT`（默认 `admin`） / `SEED_ADMIN_PASSWORD`（默认 `admin123456`）
- 测试教师：`SEED_TEST_TEACHER_ACCOUNT`（默认 `teacher_test`）
- 测试学生：`SEED_TEST_STUDENT_ACCOUNT`（默认 `student_test`）

---

## 错误响应约定

| 状态码 | 场景                             |
| ------ | -------------------------------- |
| 400    | 参数缺失、格式错误或业务校验失败 |
| 401    | 未携带有效 JWT                   |
| 403    | 角色或权限不足                   |
| 404    | 资源不存在                       |
| 409    | 业务冲突（如时间段已占用）       |
| 500    | 服务器内部错误                   |

失败时响应格式通常为：

```json
{ "code": 400, "message": "错误描述" }
```

---

## 版本

- **2025-01-07**：重构用户路由，将 `/user/current`、`/admin/users`、`/teacher/users` 统一到 `/users` 路径下，更符合 RESTful 规范。
- **2025-10-13**：更新预约时间段、补充课程与取消预约接口细节、增加测试账号说明。
- **2025-01-05**：重构日志体系、统一 RESTful 路由。

---

如需更多示例或调试，请访问部署实例的 `/swagger/index.html`。
