# biyejun-utils

工具包

## 发包流程

[超详细 如何发布自己的 npm 包](https://juejin.cn/post/7039140144250617887)

1. 检查 npm 源，如果是淘宝源，则需要改回 npm 源


```js
// 查看npm镜像源地址
npm config get registry

// 切换npm镜像源

// 设置npm默认源
npm config set registry https://registry.npmjs.org/
```

2. 在终端中切换到项目目录下，运行登陆命令，之后按照终端提示输入用户名、密码等信息即可

```js
// 登录
npm login

// 控制台会提示输入相关信息
Log in on https://registry.npmjs.org/
Username:  // 用户名
Password: // 密码
Email: (this IS public) // 邮箱
Enter one-time password: // 如果之前做过 双因素身份验证 (2FA)，需要生成一次性密钥
Logged in as xxx on https://registry.npmjs.org/.

```

## 一些参考链接

[pnpm + monorepo + changeset实现多包管理和发布](https://juejin.cn/post/7181720787400228925)

[包管理工具的演进 npm yarn pnpm
](https://zhuanlan.zhihu.com/p/582229306?utm_id=0)

[2022年了，你还没用pnpm吗](https://juejin.cn/post/7124142007659790372)

[pnpm官方文档](https://pnpm.io/zh/)

[如何在Node.js里使用ES6 import](https://www.lema.fun/post/how-to-use-es6-import-in-nodejs--5hombt7ua)
- `package.json加上 "type" : "module"`

[minimist，命令行参数解析](https://segmentfault.com/a/1190000012843641?sort=newest
)

[npm 的语义化版本（Semver）](https://blog.csdn.net/Seasons_in_your_sun/article/details/129774803
)

[semver](https://www.npmjs.com/package/semver)
- `包版本管理 api 解析`

[Execa.js 那些事儿](https://frontend.devrank.cn/traffic-information/7208208239786264631)
- `执行shell命令`

[execa](https://www.npmjs.com/package/execa)

[enquirer](https://www.npmjs.com/package/enquirer)

[Angular提交规范](https://zjdoc-gitguide.readthedocs.io/zh_CN/latest/message/angular-commit.html)

[mac 安装 Cz 工具以及使用介绍](https://ld246.com/article/1567587389729)

[git-cz 代码提交统一规范配置](https://www.cnblogs.com/amnesia999/p/17310137.html)

[vscode自定义代码片段（代码提示）](https://blog.csdn.net/cainiaoyihao_/article/details/115492570)

[什么是 CI/CD？](https://www.redhat.com/zh/topics/devops/what-is-ci-cd#:~:text=CI%2FCD%20%E6%98%AF%E4%B8%80%E7%A7%8D,%EF%BC%9A%E2%80%9C%E9%9B%86%E6%88%90%E5%9C%B0%E7%8B%B1%E2%80%9D%EF%BC%89%E3%80%82)

[.gitignore 忽略文件和目录](https://www.itqaq.com/index/211.html)

[npm ERR! 404 Not Found - Scope not found](https://www.cnblogs.com/shanejix/p/15652257.html)

[alpha、beta、rc各版本区别](https://www.jianshu.com/p/a812d2d2c5c8)

[git fork使用流程](https://blog.csdn.net/qq_36412715/article/details/122121445)

[GitHub action release tag](https://stackoverflow.com/questions/63932728/github-action-release-tag)

["Resource not accessible by integration"](https://stackoverflow.com/questions/70435286/resource-not-accessible-by-integration-on-github-post-repos-owner-repo-ac)

[使用Github Actions自动化构建exe](https://zhuanlan.zhihu.com/p/133766528)


## 一些笔记

* `@vue/cli` 前面的`@vue` 是组织，自己也可以建，在npm官网添加

* `pnpm publish` 发包

* `pnpm unpublish --force` 从远端删除包

  > 从npm库中删除的包，24小时内不允许再发包

* 每次发包时 都需要登录 `pnpm login`，登录的有效时间为24小时

* `pnpm logout` 可以退出登录

  * 如果发包的时候，不想每次都登录（npm发包登录时，npm官网会给自己的邮箱发送一个验证码，这个验证码有时候有延迟，所以有时候不能第一时间获取到，导致登录不上）
  * 可以从官网申请一个`Access Token`, 在本地仓库中设置token，就不用每次都登录了。
  * `.npmrc`

  ```js
  //registry.npmjs.org/:_authToken=npm_XXXXXXXXX
  ```

* 可以使用 `nvm` 管理 node 版本

* 可以使用 `nrm` 管理仓库获取的镜像源

* git 提交规范，`git cz`，只需要全局安装两个包
  * `commitizen`
  * `cz-conventional-changelog`
  * 再搞一个配置文件 `.czrc`
  ```js
    { "path": "cz-conventional-changelog" }
  ```


