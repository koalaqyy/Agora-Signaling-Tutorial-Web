# Agora Signaling Tutorial (WEB)

*其他语言版本： [简体中文](README.md)*

This repository will help you learn how to use Agora Signal SDK to realize a simple chat web application, like wechat.

With this sample app, you can:

- Login into chat app
- Input another user's account and start a private chat
- Show your chat log
- Join group chats
- Send channel message, receive channel message
- Leave the group
- Logout

Agora Signal SDK supports iOS / Android / Web. You can find demos of these platform here:

- Android: https://github.com/AgoraIO/Agora-Signaling-Tutorial-Android
- IOS    : https://github.com/AgoraIO/Agora-Signaling-Tutorial-iOS-Swift
- Linux    : https://github.com/AgoraIO/Agora-Signaling-Tutorial-Linux
- MacOS  : https://github.com/AgoraIO/Agora-Signaling-Tutorial-macOS-Swift


## Running the App
First, create a developer account at [Agora.io](https://dashboard.agora.io/signin/), and obtain an App ID.
Then select the editor in the test project, click App Certificate, and get the App Certificate according to the operation.
Update "config.js" in the project root dir with your App ID and App Certificate.

``` javascript
const AGORA_APP_ID = 'abcdefg'

const AGORA_CERTIFICATE_ID = 'hijklmn'
```

Run npm to install dependency and use gulp to publish dist

``` bash
# install dependency
npm install
# generate dist
gulp build
```

A '/dist/' will be generated under the project root dir, warning: **do not use browser to directly open .html using file protocol, you must use http/https protocol**, that is to see you should deploy a server or use tools like Python simpleHTTPserver.


## Connect Us
- You can find full API document at [Document Center](https://docs.agora.io/en/)
- You can file bugs about this demo at [issue](https://github.com/AgoraIO/Agora-Android-Tutorial-1to1/issues)

## License
The MIT License (MIT).