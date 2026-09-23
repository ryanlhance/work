/* Portfolio contents. Edit here; index.html and app.js stay content-free.
   status: "live" -> clickable.  status: "soon" -> quiet placeholder.
   frame: "phone" -> shot captured at device size, rendered in a device frame.
   frameBg -> the backdrop behind a framed phone, drawn from the app itself. */
window.WORK = {
  // bump when screenshots are recaptured so browsers stop serving the old ones
  shotsVersion: 3,
  title: "Ryan Hance's AI Builds",
  askLabel: "Ask Me About",
  topics: [
    { title: "Self-Determination Theory", points: [
      "Competence",
      "Autonomy",
      "Relatedness"
    ] },
    { title: "Your AI Project Needs You to be its CEO", points: [
      "Vision",
      "Development",
      "Prioritization"
    ] },
    { title: "LLMs as Coachable Employees", points: [
      "Expectations",
      "Boundaries",
      "Freedom with Correction"
    ] },
    { title: "AI for Improved Communication", points: [
      "Attention Span is Short, We Need Visuals",
      "See Patterns Easier",
      "Anyone Can Communicate to Anyone"
    ] },
    { title: "Measuring the Value of AI", points: [
      "Time Saved over Employee Average Lifetime minus Build Effort",
      "Build Time vs Potential Time Savings",
      "Internal Net Promoter Score Correlation to Employee Retention"
    ] }
  ],
  cards: [
    {
      title: "Front Office",
      blurb: "Experience how I use data visualization to make decisions in my fantasy hockey league.",
      tag: "Data Visualization for Decision Making",
      href: "front-office/",
      shot: "shots/frontoffice.png",
      status: "live"
    },
    {
      title: "Draft Room",
      blurb: "Decide my final pick in a fantasy hockey draft.",
      tag: "Data Visualization for Decision Making",
      href: "draft-room/",
      shot: "shots/draftroom.png",
      status: "live"
    },
    {
      title: "Skill Map",
      blurb: "Explore an interactive data visualization of my skills in context.",
      tag: "Creatively Presenting Information",
      href: "skill-map/",
      shot: "shots/constellation.png",
      status: "live"
    },
    {
      title: "TIFF Fit Map",
      blurb: "Click through the job description for this role to see my relevant experience in context.",
      tag: "Creatively Presenting Information",
      href: "fit-map/",
      shot: "shots/fitmap.png",
      status: "live"
    },
    {
      title: "Record Collection",
      blurb: "Flip through my record shelf by genre or get inspired by the randomizer at the top.",
      tag: "Apps for Extremely Niche Needs",
      href: "record-collection/",
      shot: "shots/records.png",
      frame: "phone",
      frameBg: "#d9c5a3",
      status: "live"
    },
    {
      title: "Feels Like",
      blurb: "Test my very first app, used for clothing decisions in the complex weather of North Georgia.",
      tag: "Apps for Extremely Niche Needs",
      href: "feels-like/",
      shot: "shots/feelslike.png",
      frame: "phone",
      frameBg: "#cfe0ee",
      status: "live"
    },
    {
      title: "TIFF Sample Project",
      blurb: "Follow the process from use case to output from my live case study.",
      tag: "Improving Standard Communication with Visuals",
      href: "workshop/",
      shot: "shots/workshop.png",
      status: "live"
    },
    {
      title: "League Manager Hub",
      blurb: "Consider how an information hub for fantasy hockey reflects a business wiki.",
      tag: "Improving Standard Communication with Visuals",
      href: "league/",
      shot: "shots/managerhub.png",
      status: "live"
    },
    {
      title: "Agentic Personas",
      blurb: "Ask a large scale farming operator anything.",
      tag: "Information Architecture for Human-like Outputs",
      href: "personas/",
      shot: "shots/personas.png",
      status: "live"
    },
    {
      title: "Career Knowledge Architecture",
      blurb: "Learn how I structure inputs to create dynamic and informed outputs.",
      tag: "Information Architecture for Human-like Outputs",
      href: "", shot: "", status: "soon"
    }
  ]
};
