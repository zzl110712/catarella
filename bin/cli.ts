#! /usr/bin/env node
// 命令行入口：只负责把 commander 的 program 装配起来并解析 argv
import { program } from 'commander'
import { myCompress } from '#lib/core/command'

program.name('cantarella') // help 里显示的命令名（不设的话按入口文件名显示成 cli）
myCompress(program)
program.parse(process.argv)
