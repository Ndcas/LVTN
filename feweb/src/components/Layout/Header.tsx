interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle && <span className="header-breadcrumb">{subtitle}</span>}
        </div>
      </div>

      <div className="header-right">
        {action && (
          <button className="btn btn-primary" onClick={action.onClick} style={{ marginRight: '16px' }}>
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
}
