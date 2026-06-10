'use client';

import React from 'react';

export default function GlossaryCards() {
  const cards = [
    {
      title: '■ +/- (プラスマイナス) 〜チームへの「影響力」(勝利への流れ)〜',
      color: '#38d9a9',
      desc: '【どんな指標？】コートに立っている間に、「チーム全体のスコアがどれだけ動いたか」を表します。',
      point: '【ここがポイント！】ディフェンスやスペース作りなど「記録に残らないすべての貢献」が反映されます。得点が少なくてもこの数字が高い選手は、「その子がいるとなぜかチームが良い流れになる」という勝利を引き寄せる力を持っています。'
    },
    {
      title: '■ FP (ファンタジー・ポイント) 〜貢献の「量」(見えないエナジー)〜',
      color: '#f7a84f',
      desc: '【どんな指標？】得点・リバウンド・アシスト・守備など、試合中の「あらゆる貢献」を1つにまとめた総合評価スコアです。(NBA公式採用)',
      point: '【ここがポイント！】得点(1点)より、アシスト(1.5点)やリバウンド(1.2点)、スティール等の守備(3点)といった「味方を活かす・体を張るプレー」が高く評価されます。泥臭くチームを支える「本当のMVP(縁の下の力持ち)」が一目で分かります。'
    },
    {
      title: '■ EFF (エフィシエンシー/効率性) 〜プレーの「質」(正確性と安定感)〜',
      color: '#4f8ef7',
      desc: '【どんな指標？】得点やリバウンド等の「良いプレー」から、シュートミスやターンオーバー等の「マイナス」を引いて計算する、プレーの正確性を表す指標です。',
      point: '【ここがポイント！】FPが「量」なら、EFFは「無駄のなさ」を評価します。無理なシュートを打たず、ミスを少なく抑える「チームに安定感をもたらす、賢く堅実な選手」の数字が高くなります。'
    },
    {
      title: '■ USG% (ユーセージ率/攻撃占有率) 〜攻撃の「責任」(チームでの役割)〜',
      color: '#f0d34f',
      desc: '【どんな指標？】コートにいる間、「チームの攻撃の何%をその選手が引き受けたか(シュートやミスでプレーを終えた割合)」を表します。',
      point: '【ここがポイント！】この数字が高いほど、ボールを託される「オフェンスの中心(エースや司令塔)」であることを意味します。能力の良し悪しではなく、「どれだけ攻撃の責任を背負って戦っているか」という役割の大きさが分かります。'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
      {cards.map((c, i) => (
        <div key={i} className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${c.color}` }}>
          <div style={{ color: c.color, fontWeight: 700, fontSize: '13px', marginBottom: '12px', lineHeight: 1.4 }}>
            {c.title}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text)', marginBottom: '8px', lineHeight: 1.5 }}>
            {c.desc}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
            {c.point}
          </div>
        </div>
      ))}
    </div>
  );
}
