import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

plt.rcParams['font.family'] = ['STHeiti', 'PingFang HK', 'Arial Unicode MS', 'DejaVu Sans']

fig, ax = plt.subplots(figsize=(12, 9))
ax.set_xlim(0, 12)
ax.set_ylim(0, 9)
ax.axis('off')
fig.patch.set_facecolor('#f8f9fa')

def box(ax, x, y, w, h, label, sub='', color='#4A90D9', fs=11):
    rect = FancyBboxPatch((x, y), w, h,
                          boxstyle="round,pad=0.1,rounding_size=0.2",
                          facecolor=color, edgecolor='white', linewidth=2.5, zorder=3)
    ax.add_patch(rect)
    cy = y + h / 2
    if sub:
        ax.text(x+w/2, cy+0.18, label, ha='center', va='center', fontsize=fs, fontweight='bold', color='white', zorder=4)
        ax.text(x+w/2, cy-0.22, sub, ha='center', va='center', fontsize=8.5, color='white', alpha=0.85, zorder=4)
    else:
        ax.text(x+w/2, cy, label, ha='center', va='center', fontsize=fs, fontweight='bold', color='white', zorder=4)

def arr(ax, x1, y1, x2, y2, label='', c='#888'):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=c, lw=2), zorder=5)
    if label:
        mx, my = (x1+x2)/2, (y1+y2)/2
        ax.text(mx+0.1, my, label, fontsize=8, color=c)

# 标题
ax.text(6, 8.65, 'Cosmos 区块链 — 技术架构', ha='center', fontsize=15, fontweight='bold', color='#1a1a2e')

# 前端
box(ax, 1.0, 7.0, 10.0, 1.1, 'React 浏览器前端', 'Vite + TypeScript  :5173', '#1d4ed8', fs=12)

# 后端 API
box(ax, 1.0, 5.2, 10.0, 1.1, 'Node.js REST API', 'Express  :3000  |  /blocks  /txs  /accounts  /mine', '#16a34a', fs=12)

# 核心三块
box(ax, 1.0, 3.3, 3.1, 1.2, '区块链核心', '区块 / 交易 / 内存池', '#d97706')
box(ax, 4.5, 3.3, 3.1, 1.2, '账户 & 代币', 'auth / bank / miner', '#7c3aed')
box(ax, 8.0, 3.3, 3.0, 1.2, '密码学', 'secp256k1 / bech32', '#be185d')

# 存储
box(ax, 3.5, 1.4, 5.0, 1.1, '状态存储', 'state.js  +  data/chain.json', '#374151')

# 箭头
arr(ax, 6.0, 7.0, 6.0, 6.3, '', '#1d4ed8')
arr(ax, 6.0, 5.2, 6.0, 4.5, '', '#16a34a')
arr(ax, 2.55, 3.3, 2.55, 2.5, '', '#d97706')
arr(ax, 6.0,  3.3, 6.0,  2.5, '', '#7c3aed')
arr(ax, 9.5,  3.3, 7.8,  2.5, '', '#be185d')

# 标注
ax.text(6.15, 6.6, 'HTTP / fetch', fontsize=8, color='#1d4ed8')
ax.text(6.15, 4.8, '调用', fontsize=8, color='#16a34a')

plt.tight_layout(pad=0.5)
plt.savefig('/Users/zyh/Desktop/zuoye/blockchain/architecture.png',
            dpi=150, bbox_inches='tight', facecolor='#f8f9fa')
print("saved")
