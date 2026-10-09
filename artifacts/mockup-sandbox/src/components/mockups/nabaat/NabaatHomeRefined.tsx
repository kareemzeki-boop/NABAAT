import { useState, type CSSProperties, type FormEvent } from "react";

type Plant = {
  name: string;
  latin: string;
  image: string;
  setting: string;
  light: string;
  description: string;
  category: string;
};

const plants: Plant[] = [
  {
    name: "Monstera",
    latin: "Monstera deliciosa",
    image: "/__mockup/images/nabaat-home-refined-monstera.jpg",
    setting: "Indoor",
    light: "Bright, filtered light",
    description: "Broad, characterful leaves for a bright room with space to grow.",
    category: "Indoor",
  },
  {
    name: "Jasmine",
    latin: "Jasminum sambac",
    image: "/__mockup/images/nabaat-home-refined-jasmine.jpg",
    setting: "Outdoor",
    light: "A sunny, sheltered spot",
    description: "A flowering choice for a bright balcony or protected outdoor area.",
    category: "Flowering",
  },
  {
    name: "Citrus tree",
    latin: "Citrus species",
    image: "/__mockup/images/nabaat-home-refined-citrus.jpg",
    setting: "Outdoor",
    light: "Full sun",
    description: "A fruit-tree possibility for a sunny spot and attentive care.",
    category: "Outdoor, Fruit trees",
  },
];

const categories = [
  { name: "Indoor plants", category: "Indoor", image: plants[0].image, count: "01" },
  { name: "Outdoor plants", category: "Outdoor", image: plants[2].image, count: "02" },
  { name: "Flowering plants", category: "Flowering", image: plants[1].image, count: "03" },
  { name: "Fruit trees", category: "Outdoor", image: plants[2].image, count: "04" },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="nh-arrow">
      {diagonal ? (
        <path d="M5.5 14.5 14 6m0 0H6m8 0v8" />
      ) : (
        <path d="M3.5 10h12m-5-5 5 5-5 5" />
      )}
    </svg>
  );
}

function SproutMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 42 48" fill="none" aria-hidden="true">
      <path d="M21 42V22m0 11C12 33 7 27 7 18c8 0 14 4 14 13Zm0-8c0-10 6-16 15-16 0 9-5 16-15 16Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 42c-2-4-6-6-11-6m11 6c2-4 6-6 11-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function NabaatHomeRefined() {
  const [activeCategory, setActiveCategory] = useState("All samples");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);

  const shownPlants =
    activeCategory === "All samples"
      ? plants
      : plants.filter((plant) => plant.category.split(", ").includes(activeCategory));

  function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnquirySent(true);
  }

  return (
    <div className="nabaat-home-refined">
      <style>{`
        .nabaat-home-refined {
          --nh-page: #f4f1e8;
          --nh-paper: #fbf9f3;
          --nh-ink: #293b31;
          --nh-leaf: #4c6752;
          --nh-moss: #85876a;
          --nh-clay: #b9765c;
          --nh-line: #d9d4c7;
          --nh-soft: #e6e8de;
          min-height: 100dvh;
          color: var(--nh-ink);
          background: var(--nh-page);
          font-family: "Avenir Next", "Trebuchet MS", sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .nabaat-home-refined * { box-sizing: border-box; }
        .nabaat-home-refined img { display: block; width: 100%; }
        .nabaat-home-refined a { color: inherit; text-decoration: none; }
        .nabaat-home-refined button, .nabaat-home-refined input, .nabaat-home-refined textarea { font: inherit; }
        .nh-container { width: min(1340px, calc(100% - 88px)); margin-inline: auto; }
        .nh-announcement {
          min-height: 34px; display: flex; align-items: center; justify-content: center;
          padding: 6px 18px; background: var(--nh-ink); color: #f2eddf; text-align: center;
          font-size: 10px; font-weight: 600; letter-spacing: .15em; text-transform: uppercase;
        }
        .nh-header {
          position: sticky; top: 0; z-index: 20; background: rgba(244,241,232,.94);
          border-bottom: 1px solid var(--nh-line); backdrop-filter: blur(14px);
        }
        .nh-nav { min-height: 82px; display: flex; align-items: center; justify-content: space-between; gap: 30px; }
        .nh-brand { display: inline-flex; align-items: center; gap: 10px; flex: 0 0 auto; }
        .nh-brand-mark { width: 31px; height: 37px; color: var(--nh-leaf); }
        .nh-brand-type { display: flex; flex-direction: column; gap: 3px; line-height: 1; }
        .nh-brand-en { font: 600 17px/1 Georgia, "Times New Roman", serif; letter-spacing: .12em; }
        .nh-brand-ar { color: var(--nh-moss); text-align: left; font: 500 11px/1 "Trebuchet MS", sans-serif; }
        .nh-links { display: flex; align-items: center; justify-content: center; gap: clamp(20px, 3vw, 42px); margin-left: auto; }
        .nh-links a { position: relative; color: #586358; font-size: 12px; transition: color .2s ease; }
        .nh-links a::after { content: ""; position: absolute; left: 0; right: 100%; bottom: -7px; height: 1px; background: var(--nh-clay); transition: right .22s ease; }
        .nh-links a:hover { color: var(--nh-ink); }
        .nh-links a:hover::after { right: 0; }
        .nh-nav-actions { display: flex; align-items: center; gap: 14px; }
        .nh-button {
          min-height: 45px; display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          padding: 0 19px; border: 1px solid var(--nh-leaf); border-radius: 2px; background: var(--nh-leaf);
          color: #f8f5ed; cursor: pointer; font-size: 11px; font-weight: 650; letter-spacing: .045em;
          transition: background .2s ease, transform .2s ease, border-color .2s ease;
        }
        .nabaat-home-refined a.nh-button { color: #f8f5ed; }
        .nh-button:hover { background: var(--nh-ink); border-color: var(--nh-ink); transform: translateY(-1px); }
        .nh-button .nh-arrow { width: 15px; height: 15px; }
        .nh-arrow { width: 16px; height: 16px; flex: 0 0 auto; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
        .nh-menu-toggle { display: none; width: 42px; height: 42px; border: 1px solid var(--nh-line); background: transparent; color: var(--nh-ink); cursor: pointer; }
        .nh-hero { display: grid; grid-template-columns: .9fr 1.1fr; align-items: center; gap: clamp(50px, 7vw, 105px); padding-block: 62px 93px; }
        .nh-hero-copy { position: relative; z-index: 1; padding: 0 0 3px 3.5%; }
        .nh-eyebrow { display: flex; align-items: center; gap: 10px; color: var(--nh-moss); font-size: 10px; font-weight: 700; letter-spacing: .17em; text-transform: uppercase; }
        .nh-eyebrow::before { content: ""; width: 25px; height: 1px; background: var(--nh-clay); }
        .nh-hero h1 { max-width: 610px; margin: 23px 0 22px; color: var(--nh-ink); font: 500 clamp(58px, 6.25vw, 88px)/.99 Georgia, "Times New Roman", serif; letter-spacing: -.055em; }
        .nh-hero h1 em { color: var(--nh-leaf); font-weight: 500; }
        .nh-hero-copy > p { max-width: 440px; margin: 0; color: #626c60; font-size: 14px; line-height: 1.9; }
        .nh-hero-actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-top: 30px; }
        .nh-text-link { display: inline-flex; align-items: center; gap: 9px; padding: 6px 0; color: var(--nh-leaf); font-size: 11px; font-weight: 650; letter-spacing: .025em; border-bottom: 1px solid #aab5a4; transition: gap .2s ease; }
        .nh-text-link:hover { gap: 13px; }
        .nh-location { margin-top: 31px; color: #777968; font-size: 9px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
        .nh-hero-art { position: relative; height: clamp(440px, 42vw, 590px); }
        .nh-hero-photo { height: 100%; object-fit: cover; object-position: 60% 50%; border-radius: 2px 170px 2px 2px; }
        .nh-photo-index { position: absolute; top: 19px; right: 20px; display: flex; align-items: center; gap: 8px; color: #f7f3e9; font-size: 9px; letter-spacing: .15em; text-shadow: 0 1px 9px #26372d; }
        .nh-photo-index::before { content: ""; width: 26px; height: 1px; background: currentColor; }
        .nh-image-note { position: absolute; bottom: 27px; left: -42px; width: 214px; padding: 17px 20px 18px; background: var(--nh-paper); box-shadow: 0 12px 34px rgba(47,52,40,.12); color: #777866; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }
        .nh-image-note strong { display: block; margin-top: 7px; color: var(--nh-ink); font: 500 21px/1.15 Georgia, "Times New Roman", serif; letter-spacing: -.02em; text-transform: none; }
        .nh-image-note span { display: block; margin-top: 5px; font-size: 10px; letter-spacing: .015em; text-transform: none; }
        .nh-category-section { padding: 0 0 91px; }
        .nh-section-heading { display: flex; justify-content: space-between; align-items: end; gap: 30px; margin-bottom: 25px; }
        .nh-section-heading h2 { margin: 10px 0 0; color: var(--nh-ink); font: 500 clamp(31px, 3.4vw, 45px)/1.08 Georgia, "Times New Roman", serif; letter-spacing: -.04em; }
        .nh-section-heading > p { max-width: 350px; margin: 0 0 2px; color: #70766a; font-size: 12px; line-height: 1.75; }
        .nh-category-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 13px; }
        .nh-category {
          position: relative; display: flex; flex-direction: column; justify-content: end; min-height: 220px;
          padding: 18px 19px; overflow: hidden; isolation: isolate; background: #596c54; color: white; text-align: left; cursor: pointer; border: 0;
        }
        .nh-category::before { content: ""; position: absolute; inset: 0; z-index: -2; background-image: var(--nh-cat-image); background-size: cover; background-position: center; transition: transform .45s ease; }
        .nh-category::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(0deg, rgba(29,43,34,.76), rgba(35,44,34,.02) 82%); }
        .nh-category:hover::before { transform: scale(1.04); }
        .nh-category[aria-pressed="true"] { outline: 2px solid var(--nh-clay); outline-offset: -2px; }
        .nh-category-index { margin-bottom: auto; font-size: 9px; letter-spacing: .16em; color: #eee2d1; }
        .nh-category-title { font: 500 23px/1.1 Georgia, "Times New Roman", serif; }
        .nh-category-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 9px; color: rgba(255,255,255,.88); font-size: 10px; }
        .nh-category-foot .nh-arrow { width: 14px; }
        .nh-featured { padding: 84px 0 97px; background: #eeece3; }
        .nh-featured-top { display: flex; align-items: end; justify-content: space-between; gap: 25px; margin-bottom: 28px; }
        .nh-featured-top h2 { max-width: 520px; margin: 11px 0 0; color: var(--nh-ink); font: 500 clamp(34px, 4vw, 51px)/1.08 Georgia, "Times New Roman", serif; letter-spacing: -.045em; }
        .nh-featured-top > p { max-width: 375px; margin: 0 0 4px; color: #697266; font-size: 12px; line-height: 1.75; }
        .nh-sample-note { display: flex; align-items: center; gap: 11px; margin-bottom: 25px; padding: 11px 14px; border-left: 2px solid var(--nh-clay); background: #e8e2d5; color: #6e695a; font-size: 10px; line-height: 1.5; }
        .nh-sample-note strong { flex: 0 0 auto; color: var(--nh-ink); font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }
        .nh-plants { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 25px; }
        .nh-plant-card { min-width: 0; }
        .nh-plant-image { position: relative; height: clamp(260px, 30vw, 390px); overflow: hidden; background: #dedacc; }
        .nh-plant-image img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }
        .nh-plant-card:hover .nh-plant-image img { transform: scale(1.035); }
        .nh-sample-label { position: absolute; top: 13px; left: 13px; padding: 6px 8px; background: rgba(251,249,243,.92); color: #716a59; border: 1px solid rgba(203,189,167,.8); font-size: 8px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
        .nh-plant-meta { padding: 16px 1px 0; }
        .nh-plant-tags { display: flex; gap: 8px; color: #777965; font-size: 9px; letter-spacing: .06em; }
        .nh-plant-tags span + span::before { content: "·"; margin-right: 8px; color: var(--nh-clay); }
        .nh-plant-meta h3 { margin: 8px 0 6px; color: var(--nh-ink); font: 500 25px/1.05 Georgia, "Times New Roman", serif; }
        .nh-plant-latin { margin: 0 0 10px; color: #858270; font: italic 11px Georgia, "Times New Roman", serif; }
        .nh-plant-meta > p:not(.nh-plant-latin) { min-height: 39px; margin: 0; color: #677064; font-size: 11px; line-height: 1.65; }
        .nh-plant-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 11px; border-top: 1px solid #d7d4c8; color: #777968; font-size: 9px; letter-spacing: .05em; }
        .nh-plant-foot a { display: inline-flex; align-items: center; gap: 7px; color: var(--nh-leaf); font-size: 10px; font-weight: 650; }
        .nh-plant-foot .nh-arrow { width: 13px; }
        .nh-guidance { padding-block: 88px; background: var(--nh-soft); }
        .nh-guidance-layout { display: grid; grid-template-columns: .95fr 1.05fr; align-items: center; gap: 9%; }
        .nh-guidance-copy { max-width: 490px; }
        .nh-guidance-copy h2 { margin: 13px 0 16px; color: var(--nh-ink); font: 500 clamp(37px, 4vw, 52px)/1.06 Georgia, "Times New Roman", serif; letter-spacing: -.045em; }
        .nh-guidance-copy p { margin: 0 0 25px; color: #626d61; font-size: 12px; line-height: 1.85; }
        .nh-steps { border-top: 1px solid #c9cec1; }
        .nh-step { display: grid; grid-template-columns: 38px 1fr; gap: 15px; align-items: start; padding: 17px 0; border-bottom: 1px solid #c9cec1; }
        .nh-step-number { padding-top: 1px; color: var(--nh-clay); font: 500 17px Georgia, "Times New Roman", serif; }
        .nh-step strong { display: block; margin-bottom: 4px; color: var(--nh-ink); font: 500 17px Georgia, "Times New Roman", serif; }
        .nh-step p { margin: 0; color: #697366; font-size: 10px; line-height: 1.6; }
        .nh-story { padding-block: 69px; background: var(--nh-ink); color: #f4eee2; }
        .nh-story-inner { display: grid; grid-template-columns: 73px 1fr auto; align-items: center; gap: 32px; }
        .nh-story-mark { width: 62px; height: 74px; color: #aab493; }
        .nh-story-kicker { margin-bottom: 11px; color: #b8c0a8; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; }
        .nh-story h2 { max-width: 680px; margin: 0; color: #f4eee2; font: 500 clamp(28px, 3.1vw, 39px)/1.2 Georgia, "Times New Roman", serif; letter-spacing: -.025em; }
        .nh-story .nh-text-link { color: #e2d8c1; border-color: #788270; white-space: nowrap; }
        .nh-footer { padding: 40px 0 20px; background: #e9e5da; border-top: 1px solid var(--nh-line); }
        .nh-footer-main { display: grid; grid-template-columns: 1.2fr .8fr 1fr; gap: 40px; padding-bottom: 30px; }
        .nh-footer-brand > p, .nh-footer-note { max-width: 270px; margin: 13px 0 0; color: #697065; font-size: 10px; line-height: 1.7; }
        .nh-footer h3 { margin: 4px 0 14px; color: #797a65; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; }
        .nh-footer-links { display: flex; flex-direction: column; align-items: start; gap: 8px; color: var(--nh-ink); font-size: 10px; }
        .nh-footer-links a:hover { color: var(--nh-clay); }
        .nh-footer-enquire { display: inline-flex; align-items: center; gap: 7px; margin-top: 12px; color: var(--nh-leaf); font-size: 10px; font-weight: 650; }
        .nh-footer-bottom { display: flex; justify-content: space-between; gap: 20px; padding-top: 14px; border-top: 1px solid var(--nh-line); color: #77796d; font-size: 9px; letter-spacing: .04em; }
        .nh-modal-backdrop { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 20px; background: rgba(26,39,31,.55); }
        .nh-modal { position: relative; width: min(520px, 100%); padding: clamp(27px, 5vw, 44px); background: var(--nh-paper); box-shadow: 0 22px 80px rgba(23,34,27,.22); }
        .nh-modal-close { position: absolute; top: 15px; right: 15px; width: 34px; height: 34px; border: 1px solid var(--nh-line); background: transparent; color: var(--nh-ink); font-size: 21px; cursor: pointer; }
        .nh-modal h2 { margin: 13px 0 9px; color: var(--nh-ink); font: 500 37px/1.05 Georgia, "Times New Roman", serif; letter-spacing: -.04em; }
        .nh-modal-intro { margin: 0 0 21px; color: #687166; font-size: 11px; line-height: 1.7; }
        .nh-form { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
        .nh-form label { display: flex; flex-direction: column; gap: 6px; color: #48584b; font-size: 10px; font-weight: 650; }
        .nh-form label.nh-full { grid-column: 1 / -1; }
        .nh-form input, .nh-form textarea { width: 100%; min-height: 40px; border: 1px solid var(--nh-line); border-radius: 0; padding: 10px; background: #fffdf7; color: var(--nh-ink); font-size: 11px; }
        .nh-form textarea { min-height: 85px; resize: vertical; }
        .nh-form .nh-button { grid-column: 1 / -1; justify-self: start; margin-top: 3px; }
        .nh-success { padding: 19px; border-left: 2px solid var(--nh-leaf); background: #e8ece2; color: var(--nh-ink); font-size: 12px; line-height: 1.7; }
        .nh-success strong { display: block; margin-bottom: 4px; font: 500 22px Georgia, "Times New Roman", serif; }
        .nh-modal-foot { margin: 13px 0 0; color: #858270; font-size: 9px; line-height: 1.6; }
        @media (max-width: 900px) {
          .nh-container { width: min(100% - 52px, 760px); }
          .nh-links { gap: 17px; }
          .nh-links a { font-size: 11px; }
          .nh-hero { gap: 45px; padding-block: 50px 75px; }
          .nh-hero-art { height: 440px; }
          .nh-category { min-height: 180px; padding: 14px; }
          .nh-category-title { font-size: 19px; }
          .nh-story-inner { grid-template-columns: 56px 1fr; gap: 20px; }
          .nh-story .nh-text-link { grid-column: 2; justify-self: start; }
        }
        @media (max-width: 680px) {
          .nh-container { width: calc(100% - 36px); }
          .nh-nav { min-height: 68px; }
          .nh-menu-toggle { display: grid; place-items: center; }
          .nh-menu-toggle span { font-size: 0; }
          .nh-menu-toggle::before { content: "☰"; font-size: 17px; }
          .nh-menu-toggle[aria-expanded="true"]::before { content: "×"; font-size: 24px; line-height: 1; }
          .nh-nav-actions > .nh-button { display: none; }
          .nh-links { display: none; position: absolute; top: 100%; left: 0; right: 0; padding: 8px 20px 18px; background: var(--nh-page); border-bottom: 1px solid var(--nh-line); flex-direction: column; align-items: stretch; gap: 0; }
          .nh-links.nh-open { display: flex; }
          .nh-links a { padding: 13px 4px; border-bottom: 1px solid var(--nh-line); font-size: 13px; }
          .nh-links a::after { display: none; }
          .nh-hero { grid-template-columns: 1fr; gap: 32px; padding-block: 43px 56px; }
          .nh-hero-copy { padding: 0; }
          .nh-hero h1 { max-width: 540px; margin: 18px 0; font-size: clamp(49px, 13vw, 68px); }
          .nh-hero-copy > p { font-size: 13px; }
          .nh-hero-art { height: min(90vw, 410px); margin-left: 12px; }
          .nh-hero-photo { border-top-right-radius: 112px; }
          .nh-image-note { left: -12px; bottom: 16px; width: 195px; }
          .nh-category-section { padding-bottom: 58px; }
          .nh-section-heading, .nh-featured-top { align-items: start; flex-direction: column; gap: 11px; }
          .nh-section-heading h2 { font-size: 36px; }
          .nh-category-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 9px; }
          .nh-category { min-height: 170px; padding: 12px; }
          .nh-category-title { font-size: 18px; }
          .nh-featured { padding: 57px 0 65px; }
          .nh-featured-top h2 { font-size: 38px; }
          .nh-sample-note { align-items: start; flex-direction: column; gap: 3px; }
          .nh-plants { grid-template-columns: 1fr 1fr; gap: 22px 12px; }
          .nh-plant-image { height: auto; aspect-ratio: .91; }
          .nh-plant-meta h3 { font-size: 21px; }
          .nh-plant-meta > p:not(.nh-plant-latin) { min-height: 54px; font-size: 10px; }
          .nh-plant-foot { align-items: start; flex-direction: column; gap: 8px; }
          .nh-guidance { padding-block: 62px; }
          .nh-guidance-layout { grid-template-columns: 1fr; gap: 28px; }
          .nh-guidance-copy h2 { font-size: 41px; }
          .nh-story { padding-block: 49px; }
          .nh-story-inner { grid-template-columns: 42px 1fr; gap: 14px; }
          .nh-story-mark { width: 41px; height: 53px; }
          .nh-story h2 { font-size: 27px; }
          .nh-footer-main { grid-template-columns: 1fr 1fr; gap: 25px 17px; }
          .nh-footer-brand { grid-column: 1 / -1; }
          .nh-footer-bottom { flex-direction: column; gap: 7px; }
        }
        @media (max-width: 400px) {
          .nh-container { width: calc(100% - 28px); }
          .nh-hero-actions { align-items: flex-start; flex-direction: column; gap: 13px; }
          .nh-plants { grid-template-columns: 1fr; }
          .nh-plant-image { aspect-ratio: 1.1; }
          .nh-plant-meta > p:not(.nh-plant-latin) { min-height: 0; }
          .nh-form { grid-template-columns: 1fr; }
          .nh-form label.nh-full, .nh-form .nh-button { grid-column: auto; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nabaat-home-refined *, .nabaat-home-refined *::before, .nabaat-home-refined *::after { transition-duration: .01ms !important; }
        }
      `}</style>

      <div className="nh-announcement">Preparing to launch in Abu Dhabi <span aria-hidden="true">&nbsp;·&nbsp;</span> Sample collection only</div>
      <header className="nh-header">
        <div className="nh-container nh-nav">
          <a className="nh-brand" href="#top" aria-label="Nabaat home">
            <SproutMark className="nh-brand-mark" />
            <span className="nh-brand-type">
              <span className="nh-brand-en">NABAAT</span>
              <span className="nh-brand-ar" lang="ar" dir="rtl">نبات</span>
            </span>
          </a>
          <nav className={`nh-links${mobileMenuOpen ? " nh-open" : ""}`} aria-label="Main navigation">
            <a href="#collection" onClick={() => setMobileMenuOpen(false)}>The collection</a>
            <a href="#finder" onClick={() => setMobileMenuOpen(false)}>Find your plant</a>
            <a href="#care" onClick={() => setMobileMenuOpen(false)}>Plant care</a>
            <a href="#story" onClick={() => setMobileMenuOpen(false)}>Our story</a>
          </nav>
          <div className="nh-nav-actions">
            <button className="nh-button" type="button" onClick={() => setEnquiryOpen(true)}>Make an enquiry <Arrow /></button>
            <button className="nh-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><span>Menu</span></button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="nh-container nh-hero">
          <div className="nh-hero-copy">
            <div className="nh-eyebrow">A new plant shop for Abu Dhabi</div>
            <h1>Make room for <em>growing things.</em></h1>
            <p>Nabaat is getting ready to open. We’re bringing together a thoughtful selection of plants and flowers, with practical guidance for the spaces and seasons we live in.</p>
            <div className="nh-hero-actions">
              <a className="nh-button" href="#collection">Explore sample plants <Arrow /></a>
              <a className="nh-text-link" href="#finder">Find your kind of green <Arrow diagonal /></a>
            </div>
            <div className="nh-location">Abu Dhabi, UAE <span aria-hidden="true">·</span> Preparing to launch</div>
          </div>
          <div className="nh-hero-art">
            <img className="nh-hero-photo" src="/__mockup/images/nabaat-home-refined-hero.jpg" alt="A sunlit Abu Dhabi home corner with a sculptural palm and leafy plants" />
            <div className="nh-photo-index">Nabaat, in the making</div>
            <div className="nh-image-note">A little more green<strong>For the everyday.</strong><span>Thoughtful plants, useful advice.</span></div>
          </div>
        </section>

        <section className="nh-container nh-category-section" id="collection">
          <div className="nh-section-heading">
            <div><div className="nh-eyebrow">Start with a feeling</div><h2>Find your kind of green.</h2></div>
            <p>Consider these sample categories a first look at what we’re shaping. Nothing here represents live stock or confirmed availability.</p>
          </div>
          <div className="nh-category-grid">
            {categories.map((category) => (
              <button
                className="nh-category"
                key={category.name}
                type="button"
                aria-pressed={activeCategory === category.category}
                onClick={() => { setActiveCategory(category.category); document.getElementById("sample-plants")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{ "--nh-cat-image": `linear-gradient(0deg, rgba(29,43,34,.15), rgba(29,43,34,.1)), url("${category.image}")` } as CSSProperties}
              >
                <span className="nh-category-index">{category.count} / SAMPLE</span>
                <span className="nh-category-title">{category.name}</span>
                <span className="nh-category-foot"><span>Explore illustrative picks</span><Arrow /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="nh-featured" id="sample-plants">
          <div className="nh-container">
            <div className="nh-featured-top">
              <div><div className="nh-eyebrow">A first look</div><h2>A few plants to consider.</h2></div>
              <p>Example plants and care notes to help you imagine the collection. All details are illustrative; availability and prices are not confirmed.</p>
            </div>
            <div className="nh-sample-note"><strong>Sample catalog only</strong><span>Plant names, photographs and guidance are examples, not a current offer.</span></div>
            <div className="nh-plants">
              {shownPlants.map((plant) => (
                <article className="nh-plant-card" key={plant.name}>
                  <div className="nh-plant-image">
                    <img src={plant.image} alt={`Illustrative sample ${plant.name.toLowerCase()} plant`} loading="lazy" />
                    <span className="nh-sample-label">Sample plant</span>
                  </div>
                  <div className="nh-plant-meta">
                    <div className="nh-plant-tags"><span>{plant.setting}</span><span>{plant.light}</span></div>
                    <h3>{plant.name}</h3>
                    <p className="nh-plant-latin">{plant.latin}</p>
                    <p>{plant.description}</p>
                    <div className="nh-plant-foot"><span>Care notes vary by space</span><a href="#care">Explore care notes <Arrow /></a></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="nh-guidance" id="finder">
          <div className="nh-container nh-guidance-layout">
            <div className="nh-guidance-copy">
              <div className="nh-eyebrow">A good place to begin</div>
              <h2>The right plant starts with your space.</h2>
              <p>Think about the light your room actually gets, the room you can give a plant, and the care that fits your week. We’ll help you narrow it down—not promise a perfect match.</p>
              <button className="nh-button" type="button" onClick={() => { setActiveCategory("Indoor"); document.getElementById("sample-plants")?.scrollIntoView({ behavior: "smooth" }); }}>Browse a few starting points <Arrow /></button>
            </div>
            <div className="nh-steps" id="care">
              <div className="nh-step"><span className="nh-step-number">01</span><div><strong>Notice the light</strong><p>Bright window, filtered light or a shadier corner?</p></div></div>
              <div className="nh-step"><span className="nh-step-number">02</span><div><strong>Choose your pace</strong><p>Some plants need more regular attention than others.</p></div></div>
              <div className="nh-step"><span className="nh-step-number">03</span><div><strong>Make space</strong><p>Consider mature size, airflow and where a pot can drain.</p></div></div>
            </div>
          </div>
        </section>

        <section className="nh-story" id="story">
          <div className="nh-container nh-story-inner">
            <SproutMark className="nh-story-mark" />
            <div><div className="nh-story-kicker">A new beginning in Abu Dhabi</div><h2>We’re building Nabaat with care, curiosity and room to grow.</h2></div>
            <a className="nh-text-link" href="#footer">A little about us <Arrow /></a>
          </div>
        </section>
      </main>

      <footer className="nh-footer" id="footer">
        <div className="nh-container">
          <div className="nh-footer-main">
            <div className="nh-footer-brand"><a className="nh-brand" href="#top"><SproutMark className="nh-brand-mark" /><span className="nh-brand-type"><span className="nh-brand-en">NABAAT</span><span className="nh-brand-ar" lang="ar" dir="rtl">نبات</span></span></a><p>Plants and flowers, with clear guidance for the spaces and seasons we live in.</p></div>
            <div><h3>Explore</h3><nav className="nh-footer-links"><a href="#collection">Sample collection</a><a href="#finder">Find your plant</a><a href="#care">Plant care notes</a><a href="#story">Our story</a></nav></div>
            <div><h3>Before we open</h3><p className="nh-footer-note">Nabaat is preparing to launch in Abu Dhabi. This prototype’s catalog is illustrative only.</p><button className="nh-footer-enquire" type="button" onClick={() => setEnquiryOpen(true)}>Make an enquiry <Arrow /></button></div>
          </div>
          <div className="nh-footer-bottom"><span>© Nabaat · نبات</span><span>Preparing to launch · Abu Dhabi, UAE</span></div>
        </div>
      </footer>

      {enquiryOpen && (
        <div className="nh-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEnquiryOpen(false); }}>
          <section className="nh-modal" role="dialog" aria-modal="true" aria-labelledby="nh-enquiry-title">
            <button className="nh-modal-close" type="button" aria-label="Close enquiry form" onClick={() => { setEnquiryOpen(false); setEnquirySent(false); }}>×</button>
            <div className="nh-eyebrow">A note to Nabaat</div>
            <h2 id="nh-enquiry-title">{enquirySent ? "Thank you for reaching out." : "What are you looking for?"}</h2>
            {enquirySent ? (
              <div className="nh-success" role="status"><strong>Your note is ready.</strong>This preview stores nothing and does not send messages. Nabaat is still preparing to launch.</div>
            ) : (
              <>
                <p className="nh-modal-intro">Share a little about what you have in mind. This local preview form does not send your message.</p>
                <form className="nh-form" onSubmit={submitEnquiry}>
                  <label>Name<input name="name" autoComplete="name" required minLength={2} /></label>
                  <label>Email<input name="email" type="email" autoComplete="email" required /></label>
                  <label className="nh-full">What are you interested in?<input name="interest" placeholder="A plant, flowers, care advice…" required /></label>
                  <label className="nh-full">A little more detail<textarea name="message" minLength={10} required /></label>
                  <button className="nh-button" type="submit">Prepare enquiry <Arrow /></button>
                </form>
                <p className="nh-modal-foot">Prototype only · No information is sent or saved.</p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
