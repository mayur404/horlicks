html {
  margin: 0;
  padding: 0;
  overflow: hidden; }

body {
  background: #546E7A;
  font-family: 'Roboto Mono';
  margin: 0px;
  padding: 0px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: fixed; }

* {
  box-sizing: border-box; }

.layout {
  position: absolute;
  top: 50%;
  margin-top: -75px;
  left: 0;
  width: 100%;
  display: none; }

.content {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  height: 150px;
  text-align: center; }

.intro {
  display: block; }

.demoArea {
  display: none; }

.gameArea {
  position: absolute;
  width: 100%;
  height: 100%;
  display: none;
  overflow: hidden;
  background: white; }

.screen {
  position: absolute;
  width: 100%;
  top: 50%;
  z-index: 10;
  font-size: 0px; }

.topScreen {
  position: absolute;
  width: 100%;
  top: 50%;
  font-size: 0px; }

.bottomScreen {
  position: absolute;
  width: 100%;
  top: 50%;
  font-size: 0px; }

._hTile {
  position: relative;
  display: inline-block;
  background: white;
  opacity: 1;
  box-sizing: border-box; }

._hShrine {
  position: relative;
  display: inline-block;
  /*background: rgba(241,196,15,0.7);*/
  background: #FE9132;
  box-sizing: border-box;
  opacity: 0.8; }

._hShrineInner {
  position: absolute;
  background: #FCB634;
  box-sizing: border-box;
  vertical-align: middle;
  left: 50%;
  top: 50%;
  opacity: 1; }

._hShrineInner2 {
  position: absolute;
  background: #FCB634;
  box-sizing: border-box;
  vertical-align: middle;
  left: 50%;
  top: 50%;
  opacity: 1;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
  -webkit-animation: infinite-spinning 3.5s linear infinite; }

._hShrineCircle {
  position: absolute;
  background: #FCB634;
  box-sizing: border-box;
  vertical-align: middle;
  left: 50%;
  top: 50%;
  border-radius: 200px; }

._hTaller {
  position: relative;
  display: inline-block;
  background: #FF7664;
  opacity: 1;
  box-sizing: border-box;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden; }

._shrineFaded {
  position: relative;
  display: inline-block;
  background: #FE9132;
  opacity: 0.8;
  box-sizing: border-box; }

._hTallerInner {
  position: relative;
  background: #F75845;
  box-sizing: border-box;
  vertical-align: middle;
  left: 50%;
  top: 50%;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden; }

._hStronger {
  position: relative;
  display: inline-block;
  background: #D05083;
  opacity: 1;
  box-sizing: border-box;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden; }

._hStrongerInner {
  position: relative;
  background: #AD4D8D;
  box-sizing: border-box;
  vertical-align: middle;
  left: 50%;
  top: 50%;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden; }

._hSharper {
  position: relative;
  display: inline-block;
  background: #BFC201;
  opacity: 1;
  box-sizing: border-box;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden; }

._hSharperInner {
  position: relative;
  background: #A4A106;
  box-sizing: border-box;
  vertical-align: middle;
  left: 50%;
  top: 50%;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden; }

._hBlankTile {
  position: relative;
  display: inline-block;
  background: white;
  opacity: 0;
  box-sizing: border-box; }

._hGrass {
  position: relative;
  display: inline-block;
  background: #FFFFFF;
  opacity: 0.2;
  box-sizing: border-box; }

._hGrassDark {
  position: relative;
  display: inline-block;
  background: #BBD6E7;
  opacity: 0.2;
  box-sizing: border-box;
  text-align: center; }

._hGrassInner {
  position: relative;
  background: #BBD6E7;
  box-sizing: border-box;
  vertical-align: middle;
  left: 50%;
  top: 50%; }

._hGrassInnerDark {
  position: relative;
  background: #FFFFFF;
  box-sizing: border-box;
  vertical-align: middle;
  left: 50%;
  top: 50%; }

.pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("../img/pattern/sos1.png");
  background-repeat: repeat;
  opacity: 0; }

.innerPattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("../img/pattern/sos1.png");
  background-repeat: repeat;
  opacity: 0; }

.skillsBar {
  position: fixed;
  top: 0px;
  height: 10px;
  width: 100%;
  font-size: 0px;
  z-index: 15; }

.skill {
  position: relative;
  height: 100%;
  display: inline-block; }

.taller {
  background: #F75845;
  display: inline-block; }

.stronger {
  background: #AD4D8D;
  display: inline-block; }

.sharper {
  background: #A4A106;
  display: inline-block; }

.healthBar {
  position: fixed;
  width: 150%;
  bottom: 0px;
  height: 100%;
  z-index: 5;
  left: -25%;
  background: rgba(187, 214, 231, 0.6);
  opacity: 0.8;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
  transform: translate3d(0, 0, 0); }

.health {
  position: absolute;
  height: 100%;
  width: 150%;
  left: -25%;
  background-image: url("../img/pattern/sosbackup.png");
  background-repeat: repeat;
  opacity: 1; }

.healthother {
  position: absolute;
  height: 100%;
  width: 100%;
  background-image: url("../img/pattern/sosflipbackup.png");
  background-repeat: repeat;
  opacity: 0.6; }

.homescreen {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #546E7A; }

.patternOther {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("../img/pattern/sos1.png");
  background-repeat: repeat;
  opacity: 0.6; }

.homeContent {
  position: relative;
  width: 100%;
  margin: 0 auto;
  padding: 10%;
  text-align: center; }

.btn {
  position: relative;
  text-align: center;
  font-size: 20px;
  line-height: 25px;
  width: 250px;
  text-transform: uppercase;
  font-weight: bold;
  margin: 15px 0px;
  background: none;
  border: 3px solid white;
  padding: 10px;
  font-style: italic;
  color: white;
  box-shadow: 5px 5px rgba(68, 68, 68, 0.7); }

.btnOther {
  position: relative;
  text-align: center;
  font-size: 20px;
  line-height: 25px;
  width: 250px;
  text-transform: uppercase;
  font-weight: bold;
  margin: 15px 0px;
  background: none;
  border: 3px solid white;
  padding: 10px;
  font-style: italic;
  color: white;
  box-shadow: 5px 5px rgba(68, 68, 68, 0.7); }

.footer {
  position: relative;
  color: white;
  opacity: 0.6;
  padding-top: 20px; }

.start {
  background: rgba(255, 118, 100, 0.3);
  border-color: #F75845; }

.join {
  background: rgba(208, 80, 131, 0.3);
  border-color: #AD4D8D; }

.startDemo {
  background: rgba(255, 118, 100, 0.3);
  border-color: #F75845; }

.joinDemo {
  background: rgba(208, 80, 131, 0.3);
  border-color: #AD4D8D; }

.execute {
  background: rgba(254, 145, 50, 0.3);
  border-color: #FCB634; }

.tallerClan {
  background: rgba(255, 118, 100, 0.3);
  border-color: #F75845;
  text-align: left; }

.strongerClan {
  background: rgba(208, 80, 131, 0.3);
  border-color: #AD4D8D;
  text-align: left; }

.sharperClan {
  background: rgba(191, 194, 1, 0.3);
  border-color: #A4A106;
  text-align: left; }

.aptClan {
  background: rgba(254, 145, 50, 0.3);
  border-color: #FCB634;
  text-align: left; }

.btn:active {
  -webkit-transform: scale(1.05); }

.inputContainer {
  position: relative;
  margin-top: 10px;
  width: 250px;
  height: 50px; }

.inputBox {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 50px;
  text-align: center;
  line-height: 40px;
  color: white;
  font-size: 20px;
  border: 3px solid #bbd6e7;
  box-shadow: none;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.5);
  border-radius: none;
  color: white;
  font-weight: bold;
  font-style: italic;
  box-shadow: 5px 5px #444444;
  float: left;
  margin-right: 16.5px; }

.inputBox:focus {
  border: 3px solid #bbd6e7;
  background: rgba(255, 255, 255, 0.5);
  outline: 0; }

.startplay {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  color: white; }

.tile {
  opacity: 0.7; }

.depth_1 {
  -webkit-filter: drop-shadow(0 0 0.9px rgba(0, 0, 0, 0.12)) drop-shadow(0 0 0.6px rgba(0, 0, 0, 0.24));
  filter: drop-shadow(0 0 0.9px rgba(0, 0, 0, 0.12)) drop-shadow(0 0 0.6px rgba(0, 0, 0, 0.24)); }

.depth_2 {
  -webkit-filter: drop-shadow(0px 0px 1.8px rgba(0, 0, 0, 0.16)) drop-shadow(0 0 1.8px rgba(0, 0, 0, 0.23));
  filter: drop-shadow(0px 0px 1.8px rgba(0, 0, 0, 0.16)) drop-shadow(0 0 1.8px rgba(0, 0, 0, 0.23)); }

.depth_3 {
  -webkit-filter: drop-shadow(0px 0px 6px rgba(0, 0, 0, 0.19)) drop-shadow(0 0 1.8px rgba(0, 0, 0, 0.23));
  filter: drop-shadow(0px 0px 6px rgba(0, 0, 0, 0.19)) drop-shadow(0 0 1.8px rgba(0, 0, 0, 0.23)); }

.depth_4 {
  -webkit-filter: drop-shadow(0px 0px 8.4px rgba(0, 0, 0, 0.25)) drop-shadow(0 0 3px rgba(0, 0, 0, 0.22));
  filter: drop-shadow(0px 0px 8.4px rgba(0, 0, 0, 0.25)) drop-shadow(0 0 3px rgba(0, 0, 0, 0.22)); }

.depth_5 {
  -webkit-filter: drop-shadow(0px 0px 11.4px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 3.6px rgba(0, 0, 0, 0.22));
  filter: drop-shadow(0px 0px 11.4px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 3.6px rgba(0, 0, 0, 0.22)); }

.navScreen {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #546E7A; }

.navScreen:after {
  content: '';
  width: 100%;
  height: 100%;
  background-image: url("../img/pattern/sos1.png");
  background-repeat: repeat;
  opacity: 0.6;
  top: 0px;
  right: 0px;
  position: absolute;
  display: inline-block; }

.navScreenInner {
  position: relative;
  width: 250px;
  margin: 0 auto;
  text-align: center;
  z-index: 5; }

.navScreenInnerFull {
  position: absolute;
  height: 100%;
  width: 100%;
  text-align: center;
  z-index: 5; }

.logo {
  position: relative;
  width: 80%;
  margin-top: 20%; }

.header {
  position: relative;
  text-transform: uppercase;
  font-size: 30px;
  font-weight: bold;
  text-transform: italic;
  color: white;
  font-style: italic;
  text-align: center;
  margin-top: 30px;
  margin-bottom: 30px; }

.headerSmall {
  position: relative;
  text-transform: uppercase;
  font-size: 20px;
  font-weight: bold;
  text-transform: italic;
  color: white;
  font-style: italic;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 10px; }

.shadow {
  text-shadow: #444444 5px 5px; }

.shadowSmall {
  text-shadow: #444444 3px 3px; }

.subHeader {
  position: relative;
  color: white;
  opacity: 0.8;
  padding: 5px 10px;
  font-style: italic; }

.glaxo {
  background: rgba(255, 118, 100, 0.3);
  border-color: #F75845; }

.smith {
  background: rgba(208, 80, 131, 0.3);
  border-color: #AD4D8D; }

.kline {
  background: rgba(191, 194, 1, 0.3);
  border-color: #A4A106; }

.stark {
  background: rgba(254, 145, 50, 0.3);
  border-color: #FCB634; }

.white {
  background: rgba(255, 255, 255, 0.3);
  border-color: #BBD6E7; }

.level {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: -1; }

.full {
  width: 100% !important; }

.mid {
  width: 65% !important; }

.less {
  width: 34% !important; }

.tallLevel {
  background: rgba(255, 118, 100, 0.6); }

.strongLevel {
  background: rgba(208, 80, 131, 0.6); }

.sharpLevel {
  background: rgba(191, 194, 1, 0.6); }

.home {
  display: none; }

.demoHome {
  display: block; }

.clanSelect {
  display: none; }

.glaxoScreen {
  display: none; }

.smithScreen {
  display: none; }

.klineScreen {
  display: none; }

.starkScreen {
  display: none; }

.hostDesc {
  margin-top: 10px; }

.inputHidden {
  opacity: 0.3; }

.twoButton {
  position: relative;
  width: 250px;
  display: inline-block; }

.smallLeft {
  position: relative;
  display: inline-block;
  float: left;
  width: 116.75px; }

.smallRight {
  width: 116.75px;
  float: right;
  position: relative;
  display: inline-block; }

.noTopMargin {
  margin-top: 0 !important; }

.noBottomMargin {
  margin-bottom: 0 !important; }

.noRightMargin {
  margin-right: 0 !important; }

.noLeftMargin {
  margin-left: 0 !important; }

.equalMargin {
  margin: 10px 0px !important; }

.noMargin {
  margin: 0px !important; }

.hostScreen {
  display: none;
  overflow-y: scroll; }

.lower {
  text-transform: lowercase; }

.joinScreen {
  display: none;
  overflow-y: scroll; }

.topHalf {
  position: absolute;
  width: 100%;
  height: 50%;
  vertical-align: middle; }

.bottomHalf {
  position: absolute;
  width: 100%;
  top: 50%;
  height: 50%; }

.alignBottom {
  position: absolute !important;
  bottom: 0px; }

.fullWidthText {
  position: absolute;
  width: 100%;
  padding: 30px 10% !important;
  margin-bottom: 30px !important; }

.alignNo {
  line-height: 0px;
  font-size: 150px;
  margin-top: 90px !important; }

.middleLine {
  position: absolute;
  width: 100%;
  top: 50%;
  height: 4px;
  margin-top: -2px;
  background: #FFFFFF; }

.tapArea {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(187, 214, 231, 0.2);
  opacity: 0.001; }

.alignScreen {
  display: none; }

.loadingScreen {
  display: none; }

.loadingText {
  position: absolute;
  line-height: 200px;
  width: 100%;
  top: 50%;
  text-align: center;
  color: white;
  font-style: italic;
  margin-top: -100px !important; }

.doneBuild {
  position: absolute;
  bottom: 15px;
  left: 50%;
  width: 116.75px !important;
  z-index: 50;
  margin-left: -58.375px !important;
  color: #FE9132;
  background: rgba(254, 145, 50, 0.6);
  border-color: #FE9132;
  box-shadow: 5px 5px rgba(68, 68, 68, 0.3) !important;
  text-shadow: #fcb634 3px 3px !important; }

@keyframes infinite-spinning {
  from {
    -webkit-transform: rotate(0deg); }
  to {
    -webkit-transform: rotate(360deg); } }
@-webkit-keyframes infinite-spinning {
  from {
    -webkit-transform: rotate(0deg); }
  to {
    -webkit-transform: rotate(360deg); } }
.scale1_1 {
  -webkit-transform: scale(1.1);
  -webkit-transition: all 0.05s ease-out; }

.scale0_75 {
  -webkit-transform: scale(0.75);
  -webkit-transition: all 0.2s ease-in; }

.scale0_50 {
  -webkit-transform: scale(0.5);
  -webkit-transition: all 0.2s ease-in; }

.scale0_0 {
  -webkit-transform: scale(0);
  -webkit-transition: all 0.2s ease-in; }

#canvas {
  position: absolute !important; }

/*@keyframes level2 {
  from {
    -webkit-transform: scale(1.1);
  }
  to {
    -webkit-transform: scale(0.75);
  }
}

@-webkit-keyframes level2 {
  from {
    -webkit-transform: scale(1.1);
  }
  to {
    -webkit-transform: scale(0.75);
  }
}

//level1 Animation

@keyframes level1 {
  from {
    -webkit-transform: scale(1.1);
  }
  to {
    -webkit-transform: scale(0.5);
  }
}

@-webkit-keyframes level1 {
  from {
    -webkit-transform: scale(1.1);
  }
  to {
    -webkit-transform: scale(0.5);
  }
}
*/
/*animation-name: bounce;
animation-duration: 4s;
animation-iteration-count: 10;
animation-direction: alternate;
animation-timing-function: linear;
animation-fill-mode: forwards;
animation-delay: 3s;*/

/*# sourceMappingURL=screen.cs.map */
