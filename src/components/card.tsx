import { type ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <article
      className={`rounded-2xl border border-zinc-200/70 bg-white p-6 ${className ?? ""}`}
    >
      {title ? (
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          {title}
        </h2>
      ) : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </article>
  );
}
