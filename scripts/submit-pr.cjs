const { Octokit } = require('@octokit/rest')
const simpleGit = require('simple-git')
const git = simpleGit()

// 配置信息
const OWNER = '你的用户名' // 例如 "my-github-user"
const REPO = '你的仓库名' // 例如 "nextjs-app"
const TOKEN = process.env.GITHUB_TOKEN

const octokit = new Octokit({ auth: TOKEN })

async function autoSubmitPR() {
  try {
    // 1. 检查 Git 状态
    const status = await git.status()
    if (status.files.length === 0) {
      console.log('没有检测到代码更改，跳过 PR。')
      return
    }

    // 2. 创建并切换新分支
    const branchName = `auto-fix-${Date.now()}`
    await git.checkoutLocalBranch(branchName)
    console.log(`已创建分支: ${branchName}`)

    // 3. 提交更改
    await git.add('.')
    await git.commit('chore: auto-generated code update')

    // 4. 推送到远程 (假设远程是 origin)
    // 注意：这里需要确保你的环境有权推送。如果报错，可能需要设置 remote url 包含 token
    await git.push('origin', branchName)
    console.log('代码已推送到 GitHub')

    // 5. 调用 GitHub API 创建 PR
    const { data: pr } = await octokit.rest.pulls.create({
      owner: OWNER,
      repo: REPO,
      title: '🚀 自动代码更新',
      body: '这是由 Codex Agent 自动生成的 Pull Request。',
      head: branchName,
      base: 'main', // 或者你的主分支名
    })

    console.log(`PR 创建成功! 链接: ${pr.html_url}`)
  } catch (error) {
    console.error('执行失败:', error.message)
  }
}

autoSubmitPR()
