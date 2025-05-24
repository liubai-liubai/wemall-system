module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复bug
        'docs', // 文档更新
        'style', // 代码格式调整
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试相关
        'chore', // 构建过程或辅助工具的变动
        'revert', // 回滚
        'build', // 构建系统或外部依赖变更
        'ci' // CI配置变更
      ]
    ],
    // 类型大小写
    'type-case': [2, 'always', 'lower-case'],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 范围大小写
    'scope-case': [2, 'always', 'lower-case'],
    // 主题大小写
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    // 主题不能为空
    'subject-empty': [2, 'never'],
    // 主题结尾不能有句号
    'subject-full-stop': [2, 'never', '.'],
    // 头部最大长度
    'header-max-length': [2, 'always', 100],
    // 正文前必须有空行
    'body-leading-blank': [1, 'always'],
    // 脚注前必须有空行
    'footer-leading-blank': [1, 'always']
  },
  // 提示信息配置
  prompt: {
    questions: {
      type: {
        description: '选择你要提交的类型',
        enum: {
          feat: {
            description: '新功能',
            title: 'Features',
            emoji: '✨'
          },
          fix: {
            description: '修复bug',
            title: 'Bug Fixes',
            emoji: '🐛'
          },
          docs: {
            description: '文档更新',
            title: 'Documentation',
            emoji: '📚'
          },
          style: {
            description: '代码格式调整(不影响功能)',
            title: 'Styles',
            emoji: '💎'
          },
          refactor: {
            description: '重构(既不是新增功能，也不是修复bug)',
            title: 'Code Refactoring',
            emoji: '📦'
          },
          perf: {
            description: '性能优化',
            title: 'Performance Improvements',
            emoji: '🚀'
          },
          test: {
            description: '测试相关',
            title: 'Tests',
            emoji: '🚨'
          },
          chore: {
            description: '构建过程或辅助工具的变动',
            title: 'Chores',
            emoji: '♻️'
          },
          revert: {
            description: '回滚',
            title: 'Reverts',
            emoji: '🗑'
          },
          build: {
            description: '构建系统或外部依赖变更',
            title: 'Builds',
            emoji: '🛠'
          },
          ci: {
            description: 'CI配置变更',
            title: 'Continuous Integrations',
            emoji: '⚙️'
          }
        }
      },
      scope: {
        description: '本次变更的影响范围 (可选)'
      },
      subject: {
        description: '简短描述'
      },
      body: {
        description: '详细描述 (可选)'
      },
      isBreaking: {
        description: '是否包含破坏性变更?'
      },
      breakingBody: {
        description: '破坏性变更的详细描述'
      },
      breaking: {
        description: '描述破坏性变更'
      },
      isIssueAffected: {
        description: '是否影响某个issue?'
      },
      issuesBody: {
        description: '如果issues已关闭，commit需要有相关描述'
      },
      issues: {
        description: '关联的issue (例如: "fix #123", "re #123")'
      }
    }
  }
};
