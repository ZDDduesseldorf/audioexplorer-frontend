const loremIpsum =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-page-content">
        <h1 className="about-page__heading">ABOUT US</h1>

        <div className="about-page__grid">
          <article className="about-page__text-card about-page__text-card--orange">
            <p>{loremIpsum}</p>
            <p>{loremIpsum}</p>
          </article>

          <div className="about-page__right">
            <article className="about-page__text-card about-page__text-card--blue">
              <p>{loremIpsum}</p>
              <p>{loremIpsum}</p>
            </article>

            <div className="about-page__image-box">Image placeholder</div>
          </div>
        </div>
      </section>
    </main>
  );
}