# 並行世界の気象台 (Aetheria Observatory)

> 実在する都市の気象データ（気温・風速・気圧・天候）をリアルタイムに取得し、それを「架空の異世界の風景と環境音響」へと変換して描画する観察・静寂型Web観測所。

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-00f0ff?style=flat-square&logo=github)](https://featlis.github.io/WeatherStation-PW/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🌌 概要

現実世界の退屈な数値を幻想的な体験へと置換し、長時間の滞在や作業用BGM・環境映像として画面の傍らに置いておく使い方を想定したWebアプリケーションです。

- **リアルタイム気象変換**: Open-Meteo APIと同期。東京が雨なら青い発光胞子（蒼光星屑雨）が降り注ぎ、気圧が下がれば浮遊島が上昇します。
- **5つのプロシージャル・バイオーム**:
  - 🏢 **星間摩天楼 (Megalopolis)**: パララックス多層ビル群、窓マトリクス発光、空中交通路
  - 🌿 **霊光草原 (Plains)**: 風速に連動してしなる数百本の草ブレード、胞子放つ巨大霊樹
  - 🌊 **結晶海岸 (Coast)**: 位相合成された波光アニメーション、星屑灯台の回転光芒
  - 🏝️ **浮遊列島 (Archipelago)**: 反重力島、発光霊脈根、結晶モノリス
  - ❄️ **極氷晶界 (Glacier)**: 多面体氷尖塔群、ダイヤモンドダスト
- **自然環境音響 (Web Audio API)**:
  - 外部音源ファイル不要のプロシージャル合成。
  - 雨粒の音、晴天時の天球鳥のさえずり、風草のそよぎ、波音、着地クリスタルチャイムが天候・地点に応じてシームレスにクロスフェードします（重低音ドローンを排した澄んだ音響）。
- **完全ゼロ依存**: Pure HTML5 / Canvas 2D / Web Audio API / Vanilla JS。外部フレームワークやビルドステップ不要。

---

## 🎮 操作方法 / ショートカット

| キー / 操作 | 機能 |
|---|---|
| <kbd>F</kbd> または <kbd>Space</kbd> | **全画面・静寂観察モード (HUD非表示)** |
| <kbd>M</kbd> | **環境音響 BGM の再生 / ミュート切り替え** |
| 画面ダブルクリック | **HUD非表示 / 復帰の切り替え** |
| ヘッダーの都市名クリック | **観測都市の切り替え & グローバル都市検索** |

---

## 🚀 GitHub Pages での公開手順

本リポジトリは GitHub Actions による自動デプロイに対応しています。

1. GitHub のリポジトリ設定 (`Settings`) を開く。
2. 左メニューの **Pages** を選択。
3. **Build and deployment** > **Source** を **`GitHub Actions`** に設定。
4. `main` ブランチにプッシュすると、自動的にビルド＆デプロイが完了します。
5. 公開URL: `https://featlis.github.io/WeatherStation-PW/`

---

## 💻 ローカル実行方法

ローカルサーバーで即座に実行できます（PythonやNode.js等）：

```bash
# Python 3
python -m http.server 8000

# または Node.js (npx)
npx serve .
```

ブラウザで `http://localhost:8000` を開きます。