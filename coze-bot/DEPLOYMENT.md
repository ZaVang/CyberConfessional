# Cyber Confessional + Coze Bot 部署指南

## 架构概览

```
用户 → cyberconfessional 前端 (React)
     → FastAPI 后端
     → 调用 Coze Bot API (使用你的 Coze 积分)
     → 赛博神父回复
     → 返回前端展示
```

## 第一步：创建 Coze Bot

### 方式 A：自动创建（推荐）
Agent 正在浏览器中帮你创建，等待完成即可。

### 方式 B：手动创建
1. 访问 https://www.coze.cn
2. 点击"创建 Bot"
3. 名称：赛博神父 Cyber Priest
4. 简介：基于因果推断的情感支持 AI
5. 人设/提示词：复制 `coze-bot/BOT_PROMPT.md` 中的内容
6. 点击创建

### 获取 Bot ID
创建后，从 URL 获取 Bot ID：
```
https://www.coze.cn/space/{space_id}/bot/{bot_id}
                                           ↑
                                     这就是 bot_id
```

## 第二步：获取 Access Token

1. 访问 https://www.coze.cn/open/oauth/pats
2. 点击"创建新令牌"
3. 名称：cyberconfessional
4. 过期时间：选择"永不过期"或足够长的时间
5. 复制生成的 token（只显示一次！）

## 第三步：配置环境变量

创建 `backend/.env` 文件：

```bash
# Coze Bot API 配置
COZE_BOT_ID=你的bot_id
COZE_ACCESS_TOKEN=你的access_token

# 如果想保留其他 LLM 作为备选
# OPENAI_API_KEY=sk-xxx
# ANTHROPIC_API_KEY=sk-xxx
# GOOGLE_API_KEY=xxx
```

## 第四步：本地运行测试

```bash
# 安装依赖
cd backend
pip install -r requirements.txt

# 运行后端
python main.py

# 另一个终端，运行前端
cd ../frontend
npm install
npm run dev
```

访问 http://localhost:5173 测试。

## 第五步：部署上线

### 后端部署 (Railway/Fly.io)

**Railway:**
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up

# 设置环境变量
railway variables set COZE_BOT_ID=你的bot_id
railway variables set COZE_ACCESS_TOKEN=你的access_token
```

**Fly.io:**
```bash
# 安装 Fly CLI
curl -L https://fly.io/install.sh | sh

# 登录
fly auth login

# 创建应用
fly apps create cyberconfessional-api

# 部署
fly deploy

# 设置密钥
fly secrets set COZE_BOT_ID=你的bot_id
fly secrets set COZE_ACCESS_TOKEN=你的access_token
```

### 前端部署 (Vercel/Netlify)

**Vercel:**
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
cd frontend
vercel

# 设置环境变量（后端 API 地址）
vercel env set VITE_API_URL https://你的后端地址
```

**Netlify:**
1. 连接 GitHub 仓库
2. 构建命令：`npm run build`
3. 发布目录：`dist`
4. 设置环境变量：`VITE_API_URL`

## 费用估算

### Coze 积分消耗
- 每次对话约消耗 1-5 积分
- Coze 免费用户有 100 积分/天
- 付费用户有更多积分

### 部署费用
- Railway: $5/月 起
- Fly.io: 免费额度 + 按用量计费
- Vercel: 免费额度足够个人使用

## 常见问题

### Q: Bot 没有回复
检查：
1. `COZE_BOT_ID` 是否正确
2. `COZE_ACCESS_TOKEN` 是否有效
3. 后端日志是否有错误

### Q: 回复内容不符合预期
调整 Bot 的人设/提示词，重新发布 Bot。

### Q: 想切换回 Gemini/Claude
修改 `backend/app/config/llm_bridge_config.yaml`：
```yaml
default_model: priest_gemini  # 或 priest_claude
```

---

**下一步：等待 Agent 完成 Bot 创建，然后获取 Bot ID 和 Access Token 即可部署。**
