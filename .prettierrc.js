module.exports = {
  // 基础配置
  printWidth: 120,              // 每行最大字符数
  tabWidth: 2,                  // 缩进宽度
  useTabs: false,               // 使用空格而不是制表符
  semi: true,                   // 语句末尾添加分号
  singleQuote: true,            // 使用单引号
  quoteProps: 'as-needed',      // 仅在需要时为对象属性添加引号
  jsxSingleQuote: true,         // JSX中使用单引号
  trailingComma: 'none',        // 不添加尾随逗号
  bracketSpacing: true,         // 对象字面量的括号间添加空格
  bracketSameLine: false,       // 将>放在下一行
  arrowParens: 'avoid',         // 箭头函数参数仅在必要时添加括号
  rangeStart: 0,                // 格式化文件的起始行号
  rangeEnd: Infinity,           // 格式化文件的结束行号
  requirePragma: false,         // 不需要编写文件开头的 @prettier
  insertPragma: false,          // 不需要插入 @prettier
  proseWrap: 'preserve',        // 按原样显示markdown文本
  htmlWhitespaceSensitivity: 'css', // HTML空白敏感性
  vueIndentScriptAndStyle: false,   // Vue文件中的script和style标签不缩进
  endOfLine: 'lf',              // 行尾符使用LF
  embeddedLanguageFormatting: 'auto', // 自动格式化嵌入的代码

  // 特定文件类型的配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2
      }
    },
    {
      files: '*.vue',
      options: {
        printWidth: 120,
        singleQuote: true
      }
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        printWidth: 80,
        tabWidth: 2,
        singleQuote: false
      }
    }
  ]
}; 