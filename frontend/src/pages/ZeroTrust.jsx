export default function ZeroTrust() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Zero Trust Network Access</h1>
        <p className="text-neutral-400 mt-1">Device trust and user behavioral analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Active Sessions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded">
              <div>
                <p className="text-white font-medium">john.doe@company.com</p>
                <p className="text-xs text-neutral-400">192.168.1.100 · MacBook Pro</p>
              </div>
              <span className="px-3 py-1 bg-success/20 text-success text-xs font-semibold rounded">
                Trusted
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded">
              <div>
                <p className="text-white font-medium">jane.smith@company.com</p>
                <p className="text-xs text-neutral-400">10.0.0.50 · Windows 11</p>
              </div>
              <span className="px-3 py-1 bg-warning/20 text-warning text-xs font-semibold rounded">
                At Risk
              </span>
            </div>
          </div>
        </div>

        {/* Device Trust Scores */}
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Device Trust Scores</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-300">CORP-LAPTOP-001</span>
                <span className="text-sm text-white font-semibold">92%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-300">HOME-DESKTOP-02</span>
                <span className="text-sm text-white font-semibold">65%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-300">MOBILE-IPHONE-03</span>
                <span className="text-sm text-white font-semibold">78%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Policies */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Active Policies</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded">
            <div>
              <p className="text-white font-medium">Corporate Network Access</p>
              <p className="text-xs text-neutral-400">Trust score required: 80% · Behavioral analysis enabled</p>
            </div>
            <span className="px-3 py-1 bg-success/20 text-success text-xs font-semibold rounded">Enabled</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded">
            <div>
              <p className="text-white font-medium">Sensitive Data Access</p>
              <p className="text-xs text-neutral-400">Trust score required: 95% · MFA required</p>
            </div>
            <span className="px-3 py-1 bg-success/20 text-success text-xs font-semibold rounded">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
