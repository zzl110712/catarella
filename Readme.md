# cantarella — 批量压缩图片的命令行工具

基于 [sharp](https://sharp.pixelplumbing.com/) 的图片批量压缩 CLI。传入一个文件夹（或单张图片），自动压缩覆盖，覆盖前把原图备份到 `.backup/` 目录。

**本仓库当前只包含工程骨架，全部功能代码跟着本地教程文件 `docs/tutorial.md` 一步步自己实现（该文件不上传 GitHub）。**

## 用法（最终形态）

```bash
cantarella compress                       # 交互模式：逐项问答
cantarella compress ./photos              # 压缩目录下所有图片（仅当前层）
cantarella compress ./photos -r           # 递归子目录
cantarella compress ./a.jpg -q 60         # 单文件 + 指定质量
cantarella compress ./photos --format webp  # 全部转成 webp
cantarella compress ./photos -w 1920      # 限制最大宽度 1920（只缩小不放大）
cantarella compress ./photos --dry        # 预览：真实计算大小但不写任何文件
cantarella compress ./photos --report     # 生成 markdown 压缩报告
```

## 支持格式

- **输入**：jpg / jpeg / png / webp / avif / tiff / gif / **heic / heif**（iPhone 照片）/ **svg**
- **输出**：jpeg / png / webp / avif / tiff / gif（heic 预编译版只能解码不能编码、svg 只能作为输入，二者会自动转格式：heic→jpeg、svg→png）

## 技术栈

| 库 | 用途 |
|---|---|
| [sharp](https://sharp.pixelplumbing.com/) | 图片解码 / 缩放 / 重编码（基于 libvips） |
| [p-limit](https://github.com/sindresorhus/p-limit) | 并发控制（同时处理 4 张） |
| [commander](https://github.com/tj/commander.js) | 子命令与选项解析 |
| [inquirer](https://github.com/SBoudrias/Inquirer.js) | 交互问答（不带参数时） |
| [ora](https://github.com/sindresorhus/ora) | 处理中的 spinner |
| [chalk](https://github.com/chalk/chalk) | 终端着色 |

## 开发

```bash
pnpm install        # 安装依赖
pnpm typecheck      # tsc 类型检查（本项目零构建：Node 22+ 直接运行 .ts）
pnpm start          # node bin/cli.ts --help
```

实现教程：本地文件 `docs/tutorial.md`（不上传，仓库只保留工程骨架）
