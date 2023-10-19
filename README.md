# biyejun-utils

工具包

## 发包流程

[超详细 如何发布自己的 npm 包](https://juejin.cn/post/7039140144250617887
)

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