
import React from 'react';
import { Trophy, Award, TrendingUp, Printer, Calendar } from 'lucide-react';
import { Team, Match, LeagueSettings } from '../types';
import { calculateStandings, getTopScorers } from '../store';

interface StandingsPageProps {
  data: { teams: Team[]; matches: Match[]; settings: LeagueSettings };
}

const StandingsPage: React.FC<StandingsPageProps> = ({ data }) => {
  const standings = calculateStandings(data.teams, data.matches, data.settings);
  const scorers = getTopScorers(data.teams, data.matches);

  const printStandings = () => {
    const printSection = document.getElementById('print-section');
    if (!printSection) return;
    printSection.innerHTML = `
      <div style="display: flex; margin-bottom: 20px; align-items: stretch;">
        <div style="border: 2px solid black; flex: 1; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; text-transform: uppercase;">Bảng Xếp Hạng</div>
      </div>
      <div style="text-align: center; margin-bottom: 20px; font-size: 14px;">Ngày: ................................................................................</div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: black; color: white;">
            <th style="border: 1px solid black; padding: 8px;">STT</th>
            <th style="border: 1px solid black; padding: 8px;">Đội</th>
            <th style="border: 1px solid black; padding: 8px;">Thắng</th>
            <th style="border: 1px solid black; padding: 8px;">Hòa</th>
            <th style="border: 1px solid black; padding: 8px;">Thua</th>
            <th style="border: 1px solid black; padding: 8px;">Hiệu Số</th>
            <th style="border: 1px solid black; padding: 8px;">Hạng</th>
          </tr>
        </thead>
        <tbody>
          ${standings.map((s, idx) => `
            <tr>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${idx + 1}</td>
              <td style="border: 1px solid black; padding: 8px;">${s.teamName}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${s.won}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${s.drawn}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${s.lost}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${s.goalDifference}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${s.rank}</td>
            </tr>
          `).join('')}
          ${Array(Math.max(0, 5 - standings.length)).fill(0).map(() => `
            <tr style="height: 35px;"><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td></tr>
          `).join('')}
        </tbody>
      </table>
    `;
    window.print();
  };

  const printScorers = () => {
    const printSection = document.getElementById('print-section');
    if (!printSection) return;
    printSection.innerHTML = `
      <div style="display: flex; margin-bottom: 20px; align-items: stretch;">
        <div style="border: 2px solid black; flex: 1; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; text-transform: uppercase;">Danh Sách Các Cầu Thủ Ghi Bàn</div>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: black; color: white;">
            <th style="border: 1px solid black; padding: 8px;">STT</th>
            <th style="border: 1px solid black; padding: 8px;">Cầu Thủ</th>
            <th style="border: 1px solid black; padding: 8px;">Đội</th>
            <th style="border: 1px solid black; padding: 8px;">Loại Cầu Thủ</th>
            <th style="border: 1px solid black; padding: 8px;">Số Bàn Thắng</th>
          </tr>
        </thead>
        <tbody>
          ${scorers.map((s, idx) => `
            <tr>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${idx + 1}</td>
              <td style="border: 1px solid black; padding: 8px;">${s.player.name}</td>
              <td style="border: 1px solid black; padding: 8px;">${s.teamName}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${s.player.type}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${s.goals}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    window.print();
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex justify-between items-end">
        <div><h2 className="text-3xl font-black flex items-center gap-3"><Trophy className="w-10 h-10 text-amber-500" /> Bảng Xếp Hạng 2026</h2><p className="text-slate-500">Cách tính điểm - Thắng: {data.settings.pointsWin}, Hòa: {data.settings.pointsDraw}, Thua: {data.settings.pointsLoss}</p></div>
        <div className="flex gap-3">
          <button onClick={printStandings} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg"><Printer className="w-5 h-5" />In bảng xếp hạng</button>
          <button onClick={printScorers} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"><Printer className="w-5 h-5" />In danh sách cầu thủ ghi bàn</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-12">
        <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 text-center w-20">STT</th>
                <th className="px-6 py-5">Đội Bóng</th>
                <th className="px-6 py-5 text-center">Thắng</th>
                <th className="px-6 py-5 text-center">Hòa</th>
                <th className="px-6 py-5 text-center">Thua</th>
                <th className="px-6 py-5 text-center">Hiệu Số</th>
                <th className="px-6 py-5 text-center bg-emerald-600">Hạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {standings.map((s, idx) => (
                <tr key={s.teamId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-4 font-black text-slate-900">{s.teamName}</td>
                  <td className="px-6 py-4 text-center font-bold">{s.won}</td>
                  <td className="px-6 py-4 text-center font-bold">{s.drawn}</td>
                  <td className="px-6 py-4 text-center font-bold">{s.lost}</td>
                  <td className="px-6 py-4 text-center font-bold">{s.goalDifference}</td>
                  <td className="px-6 py-4 text-center bg-emerald-50"><span className="text-lg font-black text-emerald-700">{s.rank}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-3xl border p-8 shadow-sm">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Award className="w-6 h-6 text-emerald-500" /> Cầu Thủ Ghi Bàn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scorers.slice(0, 6).map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div><p className="font-bold">{s.player.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.teamName}</p></div>
                <div className="text-2xl font-black text-emerald-600">{s.goals}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandingsPage;
