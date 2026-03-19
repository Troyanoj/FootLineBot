export default function Home() {
  return (
    <main className="container">
      <h1>FootLineBot</h1>
      <p>LINE Messaging Bot for Amateur Football Group Management</p>
      
      <div className="info">
        <h2>Getting Started</h2>
        <ol>
          <li>Copy <code>.env.example</code> to <code>.env</code> and fill in your LINE credentials</li>
          <li>Run <code>npm install</code> to install dependencies</li>
          <li>Run <code>npm run db:generate</code> to generate Prisma client</li>
          <li>Run <code>npm run db:push</code> to create database tables</li>
          <li>Run <code>npm run dev</code> to start the development server</li>
        </ol>
      </div>

      <div className="endpoints">
        <h2>API Endpoints</h2>
        <ul>
          <li><code>POST /api/line/callback</code> - LINE webhook callback</li>
          <li><code>GET/POST /api/groups</code> - List/Create groups</li>
          <li><code>GET/PUT/DELETE /api/groups/[id]</code> - Get/Update/Delete group</li>
          <li><code>GET/POST /api/events</code> - List/Create events</li>
          <li><code>GET/PUT/DELETE /api/events/[id]</code> - Get/Update/Delete event</li>
          <li><code>POST /api/events/[id]/register</code> - Register for event</li>
          <li><code>POST /api/events/[id]/lineup</code> - Generate lineup</li>
          <li><code>GET /api/users/me</code> - Get current user</li>
        </ul>
      </div>
    </main>
  );
}
