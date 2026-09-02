// 主题色集中定义：CLI 里所有自定义颜色都从这里取，改一处全局生效。
// 注意 clack 自己的边框 / spinner 配色没有主题接口，这里管不到它们。
import chalk from "chalk";

// 海蓝色（ocean blue）。
// hex 是 truecolor，终端不支持时 chalk 会自动降级到最接近的 256 色 / 16 色，不会报错。
export const accent = chalk.hex("#0077BE");
