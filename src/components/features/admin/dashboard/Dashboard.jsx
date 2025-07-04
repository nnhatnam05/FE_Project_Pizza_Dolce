import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell
} from 'recharts';
import './Dashboard.css';

const stats = [
  { label: 'Visitors', value: '2,110', icon: '👥' },
  { label: 'Earnings', value: '$8.2M', icon: '💰' },
  { label: 'Orders', value: '1,124', icon: '🛒' },
];

const netProfit = {
  value: '$25,049',
  change: '+4.33%',
  chart: [
    { name: 'Jan', value: 20 },
    { name: 'Feb', value: 22 },
    { name: 'Mar', value: 25 },
    { name: 'Apr', value: 23 },
    { name: 'May', value: 27 },
    { name: 'Jun', value: 25 },
  ],
};

const revenuePerVisitor = {
  value: '$63.02',
  change: '-1.02%',
  chart: [
    { name: 'Jan', value: 60 },
    { name: 'Feb', value: 62 },
    { name: 'Mar', value: 65 },
    { name: 'Apr', value: 63 },
    { name: 'May', value: 66 },
    { name: 'Jun', value: 63 },
  ],
};

const revenueGenerated = [
  { name: 'Jan', lastYear: 4000, thisYear: 2400, lastMonth: 2400 },
  { name: 'Feb', lastYear: 3000, thisYear: 1398, lastMonth: 2210 },
  { name: 'Mar', lastYear: 2000, thisYear: 9800, lastMonth: 2290 },
  { name: 'Apr', lastYear: 2780, thisYear: 3908, lastMonth: 2000 },
  { name: 'May', lastYear: 1890, thisYear: 4800, lastMonth: 2181 },
  { name: 'Jun', lastYear: 2390, thisYear: 3800, lastMonth: 2500 },
];

const topProducts = [
  { name: 'Shanty Cotton Seat', vendors: ['A', 'B', 'C'], margin: '$981.00', sold: '29,536', stock: 'In Stock', stockColor: 'green' },
  { name: 'Practical Soft Couch', vendors: ['D', 'E'], margin: '$199.00', sold: '27,000', stock: 'In Stock', stockColor: 'green' },
  { name: 'Rustic Rubber Chair', vendors: ['F'], margin: '$899.00', sold: '21,778', stock: 'Low Stock', stockColor: 'orange' },
  { name: 'Ergonomic Frozen Bacon', vendors: ['G', 'H'], margin: '$923.00', sold: '20,272', stock: 'In Stock', stockColor: 'green' },
  { name: 'Unbranded Metal Sofa', vendors: ['I'], margin: '$119.00', sold: '17,334', stock: 'In Stock', stockColor: 'green' },
  { name: 'Intelligent Soft Sofa', vendors: ['J'], margin: '$599.00', sold: '13,744', stock: 'Low Stock', stockColor: 'orange' },
];

const marketShare = [
  { name: 'Alligator', value: 29.7, color: '#2ecc7a' },
  { name: 'CheckMark', value: 31.9, color: '#4f8cff' },
  { name: 'Stripes', value: 23, color: '#f7b731' },
  { name: 'Head & Mead', value: 14.4, color: '#e17055' },
];

const worldClients = [
  { country: 'Japan', value: 44 },
  { country: 'Greenland', value: 41 },
  { country: 'India', value: 28 },
  { country: 'Egypt', value: 21 },
  { country: 'Mexico', value: 18 },
  { country: 'Angola', value: 16 },
  { country: 'Canada', value: 11 },
  { country: 'France', value: 10 },
];

const recentActivities = [
  { text: 'An item was sold', time: '2h ago' },
  { text: 'Product out on the Amazon Market', time: '5m ago' },
  { text: 'You responded to a support ticket from Jonah Simson', time: '1h ago' },
  { text: 'Sale on the summer collection has started', time: '2h ago' },
  { text: 'A distributor sold an item', time: '2h ago' },
];

export default function Dashboard() {
  return (
    <div className="dashboardRoot">
      <div className="dashboardGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'auto 1.2fr 1fr', height: '100%', width: '100%' }}>
        {/* Top row */}
        <div className="dashboardCard" style={{ gridColumn: '1/4', gridRow: '1/2'}}>
          <div style={{ fontSize: 14, color: '#888' }}>Sunday, Jun 22, 2025</div>
          <div style={{ fontWeight: 700, fontSize: 20, margin: '8px 0' }}>Good morning, Admin!</div>
          <hr style={{ margin: '8px 0' }} />
          <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>Updates from yesterday:</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 24 }}>{stat.icon}</div>
                <div style={{ fontWeight: 700 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <hr style={{ margin: '8px 0' }} />
          <div style={{ fontSize: 15, color: '#888' }}>You have 3 meetings today:</div>
          <div style={{ marginTop: 8 }}>
            <div className="chip">Collab with Trentin <span className="chipTime">1:30pm - 2:30pm</span></div>
            <div className="chip">Meeting about shipping <span className="chipTime">2:40pm - 3:30pm</span></div>
            <div className="chip">Greeting for marketing <span className="chipTime">4:00pm - 4:30pm</span></div>
            <div className="chip">Sales pipeline review <span className="chipTime">5:00pm - 5:30pm</span></div>
          </div>
          <button className="dashboardBtn">Open Schedule</button>
        </div>
        <div className="dashboardCard" style={{ gridColumn: '4/7', gridRow: '1/2'}}>
          <div style={{ fontSize: 14, color: '#888' }}>Monthly Net Profit</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{netProfit.value}</div>
          <div style={{ color: 'green', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>▲ {netProfit.change}</div>
          <div style={{ flex: 1, minHeight: 40 }}>
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={netProfit.chart}>
                <Line type="monotone" dataKey="value" stroke="#2ecc7a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboardCard" style={{ gridColumn: '7/10', gridRow: '1/2' }}>
          <div style={{ fontSize: 14, color: '#888' }}>Revenue per visitor</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{revenuePerVisitor.value}</div>
          <div style={{ color: 'orange', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>▼ {revenuePerVisitor.change}</div>
          <div style={{ flex: 1, minHeight: 40 }}>
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={revenuePerVisitor.chart}>
                <Line type="monotone" dataKey="value" stroke="#f7b731" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboardCard" style={{ gridColumn: '10/13', gridRow: '1/2'}}>
          <div style={{ width: '100%', marginTop: 16 }}>
            <img src="images/db_image.png" alt="promo" style={{ width: '100%', borderRadius: 8 }} />
          </div>
        </div>
        {/* Middle row */}
        <div className="dashboardCard" style={{ gridColumn: '1/7', gridRow: '2/3'}}>
          <div style={{ fontSize: 14, color: '#888' }}>Revenue Generated</div>
          <div style={{ flex: 1, minHeight: 60 }}>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={revenueGenerated} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis hide />
                <ReTooltip />
                <Legend />
                <Line type="monotone" dataKey="lastYear" stroke="#e17055" strokeWidth={2} />
                <Line type="monotone" dataKey="thisYear" stroke="#2ecc7a" strokeWidth={2} />
                <Line type="monotone" dataKey="lastMonth" stroke="#4f8cff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboardCard" style={{ gridColumn: '7/13', gridRow: '2/3', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 0}}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ flex: 1, fontWeight: 700, fontSize: 18 }}>Top products</div>
              {/* <input type="text" placeholder="Search" style={{ fontSize: 14, borderRadius: 4, border: '1px solid #eee', padding: '2px 8px' }} /> */}
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th>Product</th>
                    <th>Vendors</th>
                    <th>Margin</th>
                    <th>Sold</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.vendors.map((v, idx) => (
                        <span key={v} style={{ display: 'inline-block', background: '#e6f4ef', color: '#2ecc7a', borderRadius: '50%', width: 20, height: 20, lineHeight: '20px', textAlign: 'center', fontSize: 12, marginLeft: idx > 0 ? -4 : 0 }}>{v}</span>
                      ))}</td>
                      <td>{row.margin}</td>
                      <td>{row.sold}</td>
                      <td><span style={{ color: row.stockColor, fontWeight: 700 }}>{row.stock}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Showing 1-6 out of 12 items</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div style={{ fontSize: 14, color: '#888' }}>Market Share</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <PieChart width={70} height={70}>
                <Pie
                  data={marketShare}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={28}
                  fill="#2ecc7a"
                  label={false}
                >
                  {marketShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>$6,322.32</div>
                <div style={{ fontSize: 12, color: '#888' }}>Total transactions</div>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              {marketShare.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ width: 10, height: 10, background: item.color, borderRadius: '50%', display: 'inline-block', marginRight: 6 }}></span>
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <span style={{ fontWeight: 700 }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom row */}
        <div className="dashboardCard" style={{ gridColumn: '1/5', gridRow: '3/4'}}>
          <div style={{ fontSize: 14, color: '#888' }}>Most clients</div>
          <div style={{ width: '100%', height: 60, margin: '8px 0', background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart width={100} height={50} data={worldClients}>
              <XAxis dataKey="country" hide />
              <YAxis hide />
              <Bar dataKey="value" fill="#2ecc7a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>Our client number based on their primary location</div>
        </div>
        <div className="dashboardCard" style={{ gridColumn: '5/9', gridRow: '3/4'}}>
          <div style={{ fontSize: 14, color: '#888' }}>Storage Usage</div>
          <div style={{ width: '100%', marginTop: 8, background: '#f8fafc', borderRadius: 4, height: 16, position: 'relative' }}>
            <div style={{ width: '70%', height: '100%', background: '#2ecc7a', borderRadius: 4 }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
            <span>Bed</span>
            <span>Table</span>
            <span>Couch</span>
            <span>Unoccupied</span>
          </div>
        </div>
        <div className="dashboardCard" style={{ gridColumn: '9/13', gridRow: '3/4' }}>
          <div style={{ fontSize: 14, color: '#888' }}>Recent activities</div>
          <div style={{ marginTop: 8 }}>
            {recentActivities.map((item, idx) => (
              <div key={item.text} className="recent-activity-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#2ecc7a', marginRight: 8 }}>ℹ️</span>
                <span style={{ flex: 1 }}>{item.text}</span>
                <span style={{ fontSize: 12, color: '#888' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
