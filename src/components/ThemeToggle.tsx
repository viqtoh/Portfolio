interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button className="theme-toggle" type="button" onClick={onToggle} aria-label="Toggle theme">
      <span>{theme === 'dark' ? '☾' : '☀'}</span>
      {theme === 'dark' ? 'Dark' : 'Light'} mode
    </button>
  );
}
