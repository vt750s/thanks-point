# 感謝ポイントシステム

## はじめに

Hyperledger Composerを用いたシンプルなポイントシステムのサンプルです。
本サンプルで定義されるエンティティは以下です。

* Participant
  * Company
  * Employee

* Asset
  * Candy

* Transaction
  * Thanks
  * Exchange

## コンセプト

Employee同士で感謝をトランザクションThanksとしてやり取りします。<BR>
Thanksでは行為の発生元/発生先の他に、やり取りするポイントとメッセージを必要とします。<BR>
人にあげられるポイントと、人からもらったポイントは区別され、両者が循環することはありません。<BR>
メッセージに感謝の心がこもっていない場合、トランザクションは成立しません。

