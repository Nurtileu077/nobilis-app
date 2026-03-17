import React, { memo } from 'react';

const BottomNav = memo(({ navItems, currentView, onNavigate }) => {
  // Show max 5 items in bottom nav (most important ones)
  const priorityIds = ['dashboard', 'schedule', 'chat', 'students', 'analytics', 'tasks', 'leads'];
  const bottomItems = navItems
    .filter(item => priorityIds.includes(item.id))
    .slice(0, 5);

  // If less than 5, fill with first available
  if (bottomItems.length < 5) {
    const remaining = navItems.filter(item => !bottomItems.find(b => b.id === item.id));
    bottomItems.push(...remaining.slice(0, 5 - bottomItems.length));
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-1">
        {bottomItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all ${
                isActive
                  ? 'text-nobilis-green'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-nobilis-green/10 scale-110' : ''}`}>
                <item.icon />
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight truncate max-w-[60px] ${
                isActive ? 'font-semibold' : 'font-normal'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

export default BottomNav;
