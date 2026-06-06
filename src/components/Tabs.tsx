import type { ReactNode } from "react";

export function Tabs<T extends string>({
  value,
  tabs,
  onChange,
}: {
  value: T;
  tabs: Array<{ id: T; label: ReactNode }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button className={tab.id === value ? "active" : ""} key={tab.id} onClick={() => onChange(tab.id)} role="tab" type="button">
          {tab.label}
        </button>
      ))}
    </div>
  );
}
