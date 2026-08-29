#! /usr/bin/env node
// 命令行入口：只负责把 commander 的 program 装配起来并解析 argv
// 骨架状态 —— 功能代码请跟 docs/tutorial.md 一步步自己实现：
//   Step 6 完成后，这里最终会是：
//     import { myCompress } from '../lib/core/command.ts'
//     myCompress(program)
import { program } from 'commander'

program.name('cantarella') // help 里显示的命令名（不设的话按入口文件名显示成 cli）

program.parse(process.argv)
