import React from 'react';

export const CBCTemplate: React.FC = () => (
  <div className="bg-white p-6 border border-slate-300 w-full text-sm">
    <table className="w-full border-collapse border border-slate-400">
      <thead>
        <tr className="bg-slate-100">
          <th className="border border-slate-400 p-3 text-left">Term</th>
          <th className="border border-slate-400 p-3 text-left">Date</th>
          <th className="border border-slate-400 p-3 text-left">Subject</th>
          <th className="border border-slate-400 p-3 text-left">Class</th>
          <th className="border border-slate-400 p-3 text-left">Unit No</th>
          <th className="border border-slate-400 p-3 text-left">Lesson No</th>
          <th className="border border-slate-400 p-3 text-left">Duration</th>
          <th className="border border-slate-400 p-3 text-left">Class size</th>
        </tr>
      </thead>
      <tbody>
        <tr><td className="border border-slate-400 p-3">&nbsp;</td><td className="border border-slate-400 p-3">&nbsp;</td><td className="border border-slate-400 p-3">&nbsp;</td><td className="border border-slate-400 p-3">&nbsp;</td><td className="border border-slate-400 p-3">&nbsp;</td><td className="border border-slate-400 p-3">&nbsp;</td><td className="border border-slate-400 p-3">&nbsp;</td><td className="border border-slate-400 p-3">&nbsp;</td></tr>
      </tbody>
    </table>
    <div className="mt-4 space-y-2">
      <div className="border border-slate-400 p-2 font-bold">Type of Special Educational Needs:</div>
      <div className="border border-slate-400 p-2 font-bold">Unit Title:</div>
      <div className="border border-slate-400 p-2 font-bold">Key Unit Competence:</div>
      <div className="border border-slate-400 p-2 font-bold">Title of the lesson:</div>
      <div className="border border-slate-400 p-2 font-bold">Instructional Objective (SMART & 5-Model):</div>
      <div className="border border-slate-400 p-2 font-bold">Generic Competences:</div>
      <div className="border border-slate-400 p-2 font-bold">Cross-Cutting Issues:</div>
      <div className="border border-slate-400 p-2 font-bold">Learning Materials:</div>
      <div className="border border-slate-400 p-2 font-bold">References:</div>
    </div>
    <table className="w-full border-collapse border border-slate-400 mt-2">
        <thead>
            <tr className="bg-slate-100">
                <th className="border border-slate-400 p-2">Timing</th>
                <th className="border border-slate-400 p-2">Teacher's activities</th>
                <th className="border border-slate-400 p-2">Learner's activities</th>
                <th className="border border-slate-400 p-2">Generic competences</th>
            </tr>
        </thead>
        <tbody>
            <tr><td className="border border-slate-400 p-2 font-bold">Introduction</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
            <tr><td className="border border-slate-400 p-2 font-bold">Development</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
            <tr><td className="border border-slate-400 p-2 font-bold">Conclusion</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
        </tbody>
    </table>
    <h2 className="font-bold text-sm mt-2 mb-1 text-slate-800">Teacher Self-Evaluation</h2>
    <div className="border border-slate-400 p-2 h-16">&nbsp;</div>
  </div>
);

export const RLPTemplate: React.FC = () => (
  <div className="bg-white p-6 border border-slate-300 w-full text-sm">
    <h2 className="font-bold text-md mb-2 text-slate-800">A. GENERAL INFORMATION</h2>
    <div className="grid grid-cols-2 gap-0 border border-slate-400">
        <div className="border border-slate-400 p-2 font-medium">Class:</div>
        <div className="border border-slate-400 p-2 font-medium">Lesson:</div>
        <div className="border border-slate-400 p-2 font-medium">Period:</div>
        <div className="border border-slate-400 p-2 font-medium">Date:</div>
        <div className="border border-slate-400 p-2 col-span-2 font-medium">Teacher Name:</div>
    </div>
    <h2 className="font-bold text-md mt-4 mb-2 text-slate-800">B. IDENTIFIED GROUPS</h2>
    <table className="w-full border-collapse border border-slate-400">
        <thead><tr className="bg-slate-100"><th className="border border-slate-400 p-2 text-left">Groups</th><th className="border border-slate-400 p-2 text-left">Objectives</th></tr></thead>
        <tbody>
            <tr><td className="border border-slate-400 p-2 font-medium">Group 1</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
            <tr><td className="border border-slate-400 p-2 font-medium">Group 2</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
            <tr><td className="border border-slate-400 p-2 font-medium">Group 3</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
            <tr><td className="border border-slate-400 p-2 font-medium">Group 4</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
        </tbody>
    </table>
    <h2 className="font-bold text-md mt-4 mb-2 text-slate-800">C. IDENTIFIED PROBLEMS</h2>
    <table className="w-full border-collapse border border-slate-400">
        <thead><tr className="bg-slate-100"><th className="border border-slate-400 p-2 text-left">Problem</th><th className="border border-slate-400 p-2 text-left">Activity</th><th className="border border-slate-400 p-2 text-left">Methodology</th><th className="border border-slate-400 p-2 text-left">Aids</th></tr></thead>
        <tbody>
            <tr><td className="border border-slate-400 p-2">Group 1</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
            <tr><td className="border border-slate-400 p-2">Group 2</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
        </tbody>
    </table>
    <h2 className="font-bold text-md mt-4 mb-2 text-slate-800">D. CONSOLIDATION AND EXTENDED ACTIVITIES</h2>
    <table className="w-full border-collapse border border-slate-400">
        <thead><tr className="bg-slate-100"><th className="border border-slate-400 p-2 text-left">Category</th><th className="border border-slate-400 p-2 text-left">Activities</th><th className="border border-slate-400 p-2 text-left">Methodology</th><th className="border border-slate-400 p-2 text-left">Aids</th></tr></thead>
        <tbody>
            <tr><td className="border border-slate-400 p-2">Group 3</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
            <tr><td className="border border-slate-400 p-2">Group 4</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td><td className="border border-slate-400 p-2">&nbsp;</td></tr>
        </tbody>
    </table>
    <h2 className="font-bold text-md mt-4 mb-2 text-slate-800">E. TEACHER SELF-EVALUATION</h2>
    <div className="border border-slate-400 p-4 h-16">&nbsp;</div>
  </div>
);
