# @releaseband/ecs

## Before install

> [Authenticating to GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages)

- Create [.npmrc](https://docs.npmjs.com/cli/v7/configuring-npm/npmrc) file in the **root project folder**.

```bash
echo @releaseband:registry=https://npm.pkg.github.com > .npmrc
```

- You need authenticate to GitHub Packages with npm, for this you need to create access token
  with read:packages scope and add it to **~/.npmrc** file
  (or **%USERPROFILE%\\.npmrc** for windows users)

```bash
echo //npm.pkg.github.com/:_authToken={YOUR_TOKEN_HERE} >> .npmrc
```

## Install

```bash
npm i @releaseband/ecs --save
```
