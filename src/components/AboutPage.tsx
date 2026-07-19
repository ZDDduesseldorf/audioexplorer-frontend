const references = {
  hsd: {
    label: "Prof. Dr. Florian Huber",
    url: "https://medien.hs-duesseldorf.de/personen/huber",
  },
  oxford: {
    label: "Disa Sauter – Associate Professor of Social Psychology",
    url: "https://www.psy.ox.ac.uk/people/disa-sauter",
  },
  militaru: {
    label: "About Elisabeta Militaru",
    url: "https://www.elisamilitaru.com/about",
  },
};

export function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-page__content">
        <section
          className="about-card about-card--left"
          aria-labelledby="students-heading"
        >
          <div className="about-card__body">
            <h1 id="students-heading" className="about-card__title-left">
              Students at Düsseldorf
              <br />
              University of Applied Sciences
            </h1>

            <div className="about-card__text-left">
              <p>
                The Audioexplorer website, which you are currently visiting, was
                implemented and developed by a group of students as part of the
                module of the same name.
              </p>

              <p>
                The module was launched in the summer semester of 2026 by
                Professor Florian Huber, Ph.D. Since September 2021, he has
                served as a professor of Data Science and Visual Analytics at
                the Center for Digitalization and Digitality and in the
                Department of Media at Düsseldorf University of Applied Sciences
                (1).
              </p>

              <p>
                His research and teaching focus on data science methods. In
                particular, his work centers on machine learning and visual
                analysis techniques that can be used to examine and present
                large and complex datasets in an understandable way (1).
              </p>

              <p>
                The goal of the module was to design and subsequently develop a
                website that displays various audio samples on an explorable
                map. The website was intended for researchers at the University
                of Oxford and was designed to help them categorize, label, and
                explore the displayed audio samples.
              </p>

              <p>
                To provide these functions, the students were divided into four
                working groups: Team 1 – Backend &amp; Data Preparation, Team 2
                – Frontend Visualization, Team 3 – Frontend UX/UI, and Team 4 –
                Data Pipeline &amp; Project Structure.
              </p>

              <p>
                Within one semester, the students developed an initial
                prototype, which can be viewed on this website. The audio
                samples can be explored interactively on the map. Relevant
                information is displayed for each sample, and the corresponding
                audio files can be played directly.
              </p>

              <p>
                Samples that have not yet been assigned can be categorized
                within the application. Various filter functions allow users to
                narrow down the displayed dataset and show only selected samples
                on the map.
              </p>
            </div>
          </div>

          <footer className="about-card__references-left">
            <h2 className="about-card__references-title-left">References</h2>

            <p>
              (1) Hochschule Düsseldorf (2025).{" "}
              <cite>{references.hsd.label}</cite>. Faculty of Media. Available
              at:{" "}
              <a href={references.hsd.url} target="_blank" rel="noreferrer">
                {references.hsd.url}
              </a>{" "}
              (Accessed: 18 July 2026).
            </p>
          </footer>
        </section>

        <section
          className="about-card about-card--right"
          aria-labelledby="scientists-heading"
        >
          <div className="about-card__body">
            <h2 id="scientists-heading" className="about-card__title-right">
              Scientists at Oxford University
            </h2>

            <div className="about-card__text-right">
              <p>
                The research partners and primary audience of the Audioexplorer
                website were scientists studying human emotions and nonverbal
                vocal behaviour.
              </p>

              <p>
                The project was developed in collaboration with researchers from
                the research group led by Disa Sauter, Associate Professor of
                Social Psychology at the Department of Experimental Psychology
                at the University of Oxford.
              </p>

              <p>
                Her research focuses on the relationship between emotions and
                behaviour, with particular emphasis on nonverbal vocal
                expressions such as laughter, crying, and sighing. Her group
                uses empirical and computational methods to investigate how
                emotions are expressed and perceived in different contexts and
                cultures (2).
              </p>

              <p>
                Throughout the development process, the students primarily
                communicated with researcher Elisabeta Militaru. Her work
                combines emotion science, environmental psychology, and digital
                research methods (3).
              </p>

              <p>
                She investigates how physical environments influence emotional
                experiences, behaviour, and a person&apos;s sense of self. By
                combining large-scale datasets, deep-learning methods, and field
                studies, she examines how people experience different
                environments and express emotions in relation to their
                surroundings (3).
              </p>

              <p>
                The researchers required a digital tool that would allow them to
                explore, play, label, and categorize collections of human vocal
                audio samples. Based on their requirements and feedback, the
                Audioexplorer website was designed to make complex audio
                datasets easier to access and examine.
              </p>

              <p>
                The interactive map, audio player, categorization tools, and
                filtering functions support researchers in identifying patterns
                within the dataset and assigning relevant labels to previously
                uncategorized samples.
              </p>

              <p>
                The ongoing exchange with the research partners helped ensure
                that the application was developed according to the practical
                needs of its intended users.
              </p>
            </div>
          </div>

          <footer className="about-card__references-right">
            <h2 className="about-card__references-title-right">References</h2>

            <p>
              (2) University of Oxford (n.d.).{" "}
              <cite>{references.oxford.label}</cite>. Department of Experimental
              Psychology. Available at:{" "}
              <a href={references.oxford.url} target="_blank" rel="noreferrer">
                {references.oxford.url}
              </a>{" "}
              (Accessed: 18 July 2026).
            </p>

            <p>
              (3) Militaru, E. (n.d.). <cite>{references.militaru.label}</cite>.
              Available at:{" "}
              <a
                href={references.militaru.url}
                target="_blank"
                rel="noreferrer"
              >
                {references.militaru.url}
              </a>{" "}
              (Accessed: 18 July 2026).
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
