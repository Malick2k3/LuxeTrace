interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {eyebrow ? (
        <p className="section-kicker">{eyebrow}</p>
      ) : null}
      <div className="space-y-3">
        <h1 className="max-w-4xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
