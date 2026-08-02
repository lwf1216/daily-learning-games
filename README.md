# Daily Learning Games · 语数英每日打卡

将数学冒险岛、语文森林和 Word Carnival 整合成同一个 30 天学习网站。每天分别完成数学、语文和英文，三科全部完成后点亮当天总打卡。

## 功能

- 30 天统一课程、补练日历和三科独立完成状态
- 数学 30 天 770 题
- 语文 21 天 535 题，第 22–30 天复习原课程第 13–21 天
- 英文 6 个主题、100 个课程条目，包含听读、词汇闯关、跟读、句型语法和自由练习
- 家长统计、连续打卡、金币奖励、完整备份和旧版三科记录迁移
- 只使用当前浏览器缓存，不需要 PIN，也不上传儿童学习数据

## 隐私

应用不要求注册账号。学习记录只保存在当前浏览器的 `localStorage` 中，不会由应用上传到服务器。导出的备份文件由用户自行保管，详情见 [PRIVACY.md](PRIVACY.md)。

## 本地开发

```bash
npm install
npm run dev
```

完整校验：

```bash
npm run check
```

## 部署

公开仓库中的 `wrangler.jsonc` 是不含账号 ID、生产域名或密钥的通用 Cloudflare Workers Static Assets 配置。部署前请按自己的 Cloudflare 账号和域名调整配置。

```bash
npm run deploy
```

## 许可证与课程内容

程序代码采用 [MIT License](LICENSE)。课程题目、词汇数据和图片素材的适用范围见 [CONTENT_NOTICE.md](CONTENT_NOTICE.md)；重新发布前请确认你拥有相应内容的使用权。
