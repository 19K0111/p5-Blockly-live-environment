# p5 Blockly Live Environment
## 概要
p5.jsとGoogle Blocklyを合わせたライブコーディングシステム

## インストール
`$ git clone https://github.com/19K0111/p5-Blockly-live-environment.git`  

## 使い方
サーバを立ち上げる。([`server2.js`](server2.js)はExpressモジュールを使用)

`$ node server2.js`

Google Chromeで[localhost:3000](http://localhost:3000/)にアクセス

## ライブラリ
Google Blockly: [`node_modules/`](node_modules)  
p5.js: [`p5/`](p5/)

## index.html
メインのHTMLファイル

## p5/p5-all-functions.json
p5.jsで利用できるすべての関数、定数

## 例題
[`demo-example`ディレクトリ](demo-example)を参照

例題ファイルを本環境のテキストエディタ上にコピーアンドペーストしてください。
|                                          例題ファイル                                           | 状態の保存と利用<br>(プログラム状態のスナップショット) | イベントマクロ |
| :---------------------------------------------------------------------------------------------: | :----------------------------------------------------: | :------------: |
| バブルソート<br>[`visualizingBubbleSortSocket.js`](demo-example/visualizingBubbleSortSocket.js) |                           ◯                            |       -        |
|            ソートパズル<br>[`userManuallySort.js`](demo-example/userManuallySort.js)            |                           ◯                            |       -        |
|             リバーシ<br>[`reversiEventMacro.js`](demo-example/reversiEventMacro.js)             |                           -                            |       ◯        |
|       迷路ゲーム<br>[`mazeEventMacroSnapshot.js`](demo-example/mazeEventMacroSnapshot.js)       |                           ◯                            |       ◯        |
