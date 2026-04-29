import { type ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <article
      className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ${className ?? ""}`}
    >
      {title ? <h2 className="font-semibold">{title}</h2> : null}
      <div className={title ? "mt-2" : ""}>{children}</div>
    </article>
  );
}
