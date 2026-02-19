const StatCard = ({ title, value, color, icon }) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      valueBg: 'bg-green-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      valueBg: 'bg-blue-600',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      valueBg: 'bg-yellow-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      valueBg: 'bg-red-600',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text} mb-1`}>
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>
        {icon && (
          <div className={`${colors.iconBg} p-3 rounded-lg`}>
            <div className={colors.iconText}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
