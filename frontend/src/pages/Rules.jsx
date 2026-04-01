import { useEffect, useState } from 'react';
import { rulesApi } from '../services/api';

export default function Rules() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await rulesApi.getRules();
      setRules(response.data);
    } catch (error) {
      console.error('[v0] Rules load error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Rules</h1>
          <p className="text-neutral-400 mt-1">Firewall and threat detection policies</p>
        </div>
        <button className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition">
          + New Rule
        </button>
      </div>

      <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-700/50 border-b border-neutral-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Priority</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {rules.length > 0 ? (
              rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-neutral-700/50 transition">
                  <td className="px-6 py-4 text-white font-medium">{rule.name}</td>
                  <td className="px-6 py-4 text-neutral-300 text-sm">{rule.rule_type}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs font-semibold rounded">
                      {rule.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {rule.enabled ? (
                      <span className="text-success text-sm font-semibold">✓ Enabled</span>
                    ) : (
                      <span className="text-neutral-400 text-sm">Disabled</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:text-blue-400 text-sm transition">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-neutral-400">
                  No rules configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Default Rules Section */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Default Security Rules</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded">
            <div>
              <p className="text-white font-medium">Block Malicious IPs</p>
              <p className="text-xs text-neutral-400">Blocks known malicious IP addresses</p>
            </div>
            <span className="text-success text-sm">✓ Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded">
            <div>
              <p className="text-white font-medium">DPI Pattern Matching</p>
              <p className="text-xs text-neutral-400">Deep packet inspection for threat detection</p>
            </div>
            <span className="text-success text-sm">✓ Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded">
            <div>
              <p className="text-white font-medium">Anomaly Detection</p>
              <p className="text-xs text-neutral-400">AI-powered anomaly detection engine</p>
            </div>
            <span className="text-success text-sm">✓ Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
