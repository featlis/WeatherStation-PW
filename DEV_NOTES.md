# 『並行世界の気象台』 開発記録・設計思想メモ (Architecture & Implementation Notes)

本書は、「並行世界の気象台」の設計思想、数理変換アルゴリズム、描画・音響パラメータ、および将来のPythonデスクトップアプリケーション（HTML非使用）への移植指針を記録した永続参照メモである。

---

## 1. 世界観と基本設計思想
- **コンセプト**: 現実世界の気象データ（東京、レイキャビク、ロンドン等）を、架空の並行世界「第N次元界・アストラ（Astraea / Aetheria）」の自然現象・天球物理にリアルタイム置換する。
- **体験価値**: 静寂・観察・没入（Ambient Focus）。作業用BGM・環境映像として長時間画面の片隅に置いておけること。
- **トーン＆マナー**:
  - 色彩: 漆黒の深宇宙、発光シアン（蒼光）、エメラルドエーテル、星素アメジスト、ソーラーアンバー。
  - 音響: ノイズのない澄んだ432Hz系基底ドローン、雨滴のペンタトニック・クリスタル共鳴、風のフィルタースイープ。

---

## 2. 気象変換数理モデル (Transmutation Formulas)

### (1) 気温 $T \in [-30, +45]^\circ\text{C}$ $\to$ 次元色温度 & エーテル活性度
- **色温度シフト**:
  - $T < 0$: 氷星次元（ディープアイスブルー `#06102b` + シアン `#00f0ff` + ネオンプリズム）
  - $0 \le T < 20$: 霊脈次元（ディープティール `#041820` + エメラルド `#00ffb2` + 蒼光雨）
  - $20 \le T < 32$: 恒星次元（インディゴ `#0d0d26` + 黄金エーテル `#ffd166` + 光輪）
  - $T \ge 32$: 星核フレア次元（深紅ヴァイオレット `#210b24` + ソーラークリムゾン `#ff4d6d`）
- **数式**:
  $$\text{EtherCaloric} = (T + 273.15) \times 0.1\quad [\kappa]$$

### (2) 風速 $W \in [0, 30]\,\text{m/s}$ $\to$ 粒子流速・オーロラ周期
- **風ベクトル**: 水平移動速度 $v_x = \text{drift} + W \times 0.18$
- **島の微細浮遊振動**: $\Delta y_{\text{island}} = \sin(\text{time} \times (0.8 + W \times 0.05)) \times (12 + W \times 0.2)$

### (3) 気圧 $P \in [960, 1040]\,\text{hPa}$ $\to$ 浮遊島の反重力浮力・大気密度
- **島基準浮力**:
  $$\text{BuoyancyOffset} = (1013.25 - P) \times 1.2\quad (\text{低気圧ほど島が高く浮遊})$$
- **浮遊高度指標**:
  $$\text{GravBuoyancy} = (1013.25 - P) \times 3.2 + 500\quad [\mu]$$

### (4) 湿度 $H \in [0, 100]\%$ $\to$ 蒼光粒子の発光残光・星屑密度
- **粒子総数**: $N = 60 + \lfloor H \times 1.8 \rfloor$
- **霊脈密度**: $\text{AstralDensity} = \min(100, \lfloor H \times 1.15 \rfloor)\quad [\%]$

---

## 3. Web版 実装モジュール構成
- [index.html](file:///c:/Users/aggsh/Documents/WeatherStation-PW/index.html): グラスモフィズムHUD、シミュレーションパネル、都市検索モーダル
- [css/style.css](file:///c:/Users/aggsh/Documents/WeatherStation-PW/css/style.css): ネオンルミネッセンス、ダークスペース基調、HUD非表示フェード
- [js/app.js](file:///c:/Users/aggsh/Documents/WeatherStation-PW/js/app.js): アプリケーション統合制御、キーバインド(`F`/`Space`/`M`)、周期ログ
- [js/weatherService.js](file:///c:/Users/aggsh/Documents/WeatherStation-PW/js/weatherService.js): Open-Meteo API (リアルタイム気象取得 & ジオコーディング)
- [js/converter.js](file:///c:/Users/aggsh/Documents/WeatherStation-PW/js/converter.js): 気象データ $\to$ 異世界パラメータ & 観測日誌生成
- [js/audioSynthesizer.js](file:///c:/Users/aggsh/Documents/WeatherStation-PW/js/audioSynthesizer.js): Web Audio API プロシージャル合成（ドローン・ピンクノイズ・ペンタトニックチャイム）
- [js/renderer/sky.js](file:///c:/Users/aggsh/Documents/WeatherStation-PW/js/renderer/sky.js): 天球、星屑、二重月、太陽光輪、オーロラ
- [js/renderer/landscape.js](file:///c:/Users/aggsh/Documents/WeatherStation-PW/js/renderer/landscape.js): 浮遊島、結晶モノリス、発光霊脈根、鏡面深淵
- [js/renderer/weatherEffects.js](file:///c:/Users/aggsh/Documents/WeatherStation-PW/js/renderer/weatherEffects.js): 蒼光雨胞子、反重力多面結晶、量子放電、波紋

---

## 4. 次フェーズ：Python（Windows非HTMLデスクトップアプリ）への移行指針

### 推奨技術スタック
1. **描画システム (OpenGL / Canvas)**:
   - **`Pygame` + `ModernGL` / `PyOpenGL`**: 高フレームレート（60fps+）、低リソース消費、パーティクル大量描画
   - または **`PyQt6` / `PySide6` (`QPainter` + `QOpenGLWidget`)**: 洗練されたデスクトップUIと透過オーバーレイ、トレイ常駐
2. **音響エンジン (Procedural Audio)**:
   - `numpy` による432Hzドローン波形 & ペンタトニック減衰サイン波のリアルタイムバッファ計算
   - `sounddevice` または `miniaudio` による低レイテンシ出力
3. **データ通信**:
   - `urllib.request` または `httpx` による非同期 Open-Meteo API フェッチ
4. **構造のマッピング表**:
   - `converter.js` $\to$ `converter.py`
   - `weatherService.js` $\to$ `weather_service.py`
   - `audioSynthesizer.js` $\to$ `audio_synthesizer.py`
   - `renderer/*.js` $\to$ `renderer/*.py`
