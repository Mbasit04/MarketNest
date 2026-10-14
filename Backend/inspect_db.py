import sqlite3
c = sqlite3.connect(r'D:\MarketNest\Backend\marketnest.db')
print('TABLES:')
for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
    print(' -', r[0])
print('\nMIGRATION HISTORY:')
for r in c.execute('SELECT MigrationId FROM __EFMigrationsHistory'):
    print(' -', r[0])
print('\nROW COUNTS:')
for t in ('Users','Shops','Categories','Products','Carts','CartItems','CommissionSettings'):
    n = c.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0]
    print(f' {t}: {n}')
