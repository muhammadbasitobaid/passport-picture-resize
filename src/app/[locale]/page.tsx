import { getTranslations } from "next-intl/server";

const HomePage = async () => {
  const t = await getTranslations("home");

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="font-mono text-4xl leading-tight font-extrabold tracking-tighter md:text-5xl">
        {t("title")}
      </h1>
      <p className="text-muted-foreground max-w-2xl md:text-lg">
        {t("subtitle")}
      </p>
    </main>
  );
};

export default HomePage;
