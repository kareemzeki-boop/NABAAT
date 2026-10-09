import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ErrorBoundary } from '@/components/error-boundary';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { launchConfig } from './config/launchConfig';
import { categories, products, type Product } from './data/catalog';

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const descriptions: Record<string, string> = {
  '/': 'Meet Nabaat, a plant and flower business preparing to launch in Abu Dhabi. Explore sample plants and practical care guidance.',
  '/shop': 'Browse Nabaat’s illustrative sample plant collection by type and care needs. Catalog items are examples, not live stock.',
  '/find-your-plant': 'Answer a few questions about your light, space and routine to explore plant suggestions from Nabaat’s sample catalog.',
  '/plant-care': 'Practical, cautious plant care notes for indoor spaces, air-conditioning and Abu Dhabi’s changing seasons.',
  '/our-story': 'Learn about Nabaat, a new plant and flower business preparing to launch in Abu Dhabi.',
  '/contact': 'Send a local prototype enquiry to explore a future conversation with Nabaat. No message is sent.',
};
const titles: Record<string, string> = {
  '/': 'Nabaat Plants & Flowers | Abu Dhabi',
  '/shop': 'Sample Plant Collection | Nabaat Abu Dhabi',
  '/find-your-plant': 'Find a Plant for Your Space | Nabaat',
  '/plant-care': 'Plant Care Notes for Abu Dhabi | Nabaat',
  '/our-story': 'Our Story | Nabaat Plants & Flowers',
  '/contact': 'Enquiries | Nabaat Plants & Flowers',
  '/404': 'Page Not Found | Nabaat',
};

function PageMeta({ path, productName }: { path: string; productName?: string }) {
  const canonicalPath = path.startsWith('/plant/') ? path : path;
  const title = productName ? `${productName} — Sample Plant | Nabaat` : (titles[canonicalPath] ?? titles['/404']);
  const description = productName
    ? `Sample plant profile for ${productName}. Review example care notes and enquire about a future offering from Nabaat.`
    : (descriptions[canonicalPath] ?? 'Nabaat is preparing to launch in Abu Dhabi. See practical plant guidance and illustrative sample content.');
  useEffect(() => {
    document.title = title;
    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!desc) { desc = document.createElement('meta'); desc.name = 'description'; document.head.appendChild(desc); }
    desc.content = description;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = description;
    const twTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twTitle) twTitle.content = title;
    const twDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    if (twDesc) twDesc.content = description;
  }, [title, description]);
  return null;
}

const navItems = [
  ['Shop', '/shop'], ['Find your plant', '/find-your-plant'],
  ['Plant care', '/plant-care'], ['Our story', '/our-story'], ['Contact', '/contact'],
] as const;

function BotanicalMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 42 48" fill="none" aria-hidden="true">
    <path d="M21 42V22m0 11C12 33 7 27 7 18c8 0 14 4 14 13Zm0-8c0-10 6-16 15-16 0 9-5 16-15 16Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 42c-2-4-6-6-11-6m11 6c2-4 6-6 11-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>;
}

function Brand() {
  return <Link href="/" className="brand" data-testid="link-home-brand" aria-label="Nabaat home">
    <BotanicalMark className="brand-mark"/>
    <span className="brand-type"><span className="brand-en">NABAAT</span><span className="brand-ar" lang="ar" dir="rtl">نبات</span></span>
  </Link>;
}

function Header() {
  const [path] = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return <>
    <div className="announcement" data-testid="status-launch">{launchConfig.status} · Sample catalog only</div>
    <header className="header">
      <div className="container nav-row">
        <Brand/>
        <nav className={`nav-links${open ? ' open' : ''}`} aria-label="Main navigation" data-testid="nav-main">
          {navItems.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={path === href ? 'page' : undefined} data-testid={`link-nav-${href.slice(1)}`}>{label}</Link>)}
        </nav>
        <div className="nav-actions">
          <Link href="/contact" className="button button-small" data-testid="link-nav-enquire">Enquire <ArrowRight size={14}/></Link>
          <button type="button" className="menu-toggle" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} onClick={() => setOpen(!open)} data-testid="button-menu-toggle">{open ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
      </div>
    </header>
  </>;
}

function Footer() {
  return <footer className="footer">
    <div className="container footer-main">
      <div className="footer-brand"><Brand/><p>Plants and flowers, with clear guidance for the spaces and seasons we live in.</p></div>
      <div><h3>Explore</h3><div className="footer-links"><Link href="/shop">Sample collection</Link><Link href="/find-your-plant">Find your plant</Link><Link href="/plant-care">Plant care notes</Link><Link href="/our-story">Our story</Link></div></div>
      <div><h3>Before we open</h3><p className="footer-note">Nabaat is preparing to launch in Abu Dhabi. Catalog and plant information shown here are illustrative samples, not a live offer.</p><Link href="/contact" className="text-link">Make an enquiry <ArrowRight size={14}/></Link></div>
    </div>
    <div className="container footer-bottom"><span>© Nabaat · نبات</span><span>Preparing to launch · Abu Dhabi, UAE</span></div>
  </footer>;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="site-shell"><Header/>{children}<Footer/></div>;
}

function SectionIntro({ eyebrow, title, text, href, link }: { eyebrow: string; title: string; text?: string; href?: string; link?: string }) {
  return <div className="section-head"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{text && <p>{text}</p>}{href && <Link className="text-link" href={href}>{link ?? 'Explore'} <ArrowRight size={14}/></Link>}</div>;
}

function SampleFlag() { return <span className="sample-flag">Sample content</span>; }

function ProductCard({ product }: { product: Product }) {
  return <article className="product-card" data-testid={`card-product-${product.slug}`}>
    <Link href={`/plant/${product.slug}`} className="product-image-link" aria-label={`View sample ${product.name} profile`} data-testid={`link-product-${product.slug}`}>
      <img className="product-image" src={product.image} alt={product.alt} width="700" height="740" loading="lazy"/>
      <SampleFlag/>
    </Link>
    <div className="product-meta">
      <div className="care-tags"><span>{product.setting}</span><span>{product.light}</span></div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className="product-care">{product.care}</p>
      <div className="product-actions"><Link className="text-link" href={`/plant/${product.slug}`}>Sample details <ArrowRight size={13}/></Link><Link className="button button-small" href={`/contact?product=${product.slug}`} data-testid={`link-enquire-${product.slug}`}>Enquire</Link></div>
    </div>
  </article>;
}

const categoryImages = [
  'linear-gradient(145deg,#465c49,#b0aa8b)',
  'linear-gradient(145deg,#7c7457,#d6b992)',
  'linear-gradient(145deg,#787b5a,#c98e75)',
  'linear-gradient(145deg,#667257,#c4b38d)',
];
function Home() {
  return <><PageMeta path="/"/><Shell>
    <main>
      <section className="container hero">
        <div className="hero-copy">
          <div className="eyebrow">A new plant shop for Abu Dhabi</div>
          <h1>Make room for <em>growing things.</em></h1>
          <p>Nabaat is getting ready to open. We’re putting together a thoughtful selection of plants and flowers, with practical advice to help you choose well.</p>
          <div className="hero-actions"><Link href="/shop" className="button" data-testid="link-hero-samples">Explore sample plants <ArrowRight size={15}/></Link><Link href="/find-your-plant" className="button button-outline" data-testid="link-hero-finder">Find your plant</Link></div>
          <div className="hero-note">ABU DHABI, UAE · PREPARING TO LAUNCH</div>
        </div>
        <div className="hero-image-wrap">
          <img className="hero-image" src={publicAsset('images/nabaat-hero.jpg')} alt="Botanical corner with leafy plants, a clay pot and warm natural light" width="1200" height="900" fetchPriority="high"/>
          <div className="image-note">A little more green<strong>For the everyday.</strong></div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <SectionIntro eyebrow="Start with a feeling" title="Find your kind of green" text="A few ways into the collection. These categories are a preview, not a live inventory." href="/shop" link="View all samples"/>
          <div className="category-grid">
            {['Indoor plants','Outdoor plants','Flowering plants','Fruit trees'].map((name,i) => <Link key={name} className="category-card" href={`/shop?category=${encodeURIComponent(['Indoor','Outdoor','Flowering','Fruit Trees'][i])}`} style={{'--cat-bg':categoryImages[i]} as CSSProperties} data-testid={`link-category-${i}`}><span className="category-index">0{i+1} / SAMPLE</span><strong>{name}</strong><span>Explore illustrative picks <ArrowRight size={12}/></span></Link>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionIntro eyebrow="A first look" title="A few plants to consider" text="Example plants and care notes to help you imagine the collection. No stock or prices are confirmed." href="/shop" link="Browse sample catalog"/>
          <div className="product-grid">{products.slice(0,3).map(item => <ProductCard key={item.slug} product={item}/>)}</div>
        </div>
      </section>

      <section className="section guidance">
        <div className="container guidance-layout">
          <div className="guidance-copy">
            <div className="eyebrow">A good place to begin</div><h2 className="section-title">The right plant starts with your space.</h2>
            <p>Think about the light your room actually gets, the space you can give a plant, and the care that fits your week. We’ll help you narrow it down—not promise a perfect match.</p>
            <Link className="button" href="/find-your-plant" data-testid="link-home-finder">Try the plant finder <ArrowRight size={14}/></Link>
          </div>
          <div className="guidance-steps">
            {[['01','Notice the light','Bright window, filtered light or a shadier corner?'],['02','Choose your pace','Some plants need more regular attention than others.'],['03','Make space','Consider mature size, airflow and where a pot can drain.']].map(([n,t,b])=><div className="guidance-step" key={n}><span className="step-num">{n}</span><div><strong>{t}</strong><span>{b}</span></div></div>)}
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container care-panel">
          <img className="care-panel-image" src={publicAsset('images/sample-palm.jpg')} alt="Sample leafy palm in a pale pot beside a softly lit wall" width="900" height="700" loading="lazy"/>
          <div className="care-panel-copy"><div className="eyebrow">Useful, not fussy</div><h2 className="section-title">Care advice that starts with observation.</h2><p>Watering needs change with light, pot size and the season. Start by checking the soil and how your plant responds, rather than following a rigid calendar.</p><Link href="/plant-care" className="text-link" data-testid="link-home-care">Read the care notes <ArrowRight size={14}/></Link></div>
        </div>
      </section>

      <section className="story-strip">
        <div className="container story-inner">
          <BotanicalMark className="story-mark"/>
          <div><div className="story-kicker">A new beginning in Abu Dhabi</div><h2>We’re building Nabaat with care, curiosity and room to grow.</h2></div>
          <Link className="text-link" href="/our-story" data-testid="link-home-story">A little about us <ArrowRight size={14}/></Link>
        </div>
      </section>

      <section className="cta-band"><div className="container"><div className="eyebrow" style={{justifyContent:'center'}}>Stay in the loop</div><h2>Have a plant in mind?</h2><p>Tell us what you’re looking for. This prototype keeps your enquiry on your device and does not send it.</p><Link href="/contact" className="button" data-testid="link-home-enquiry">Make an enquiry <ArrowRight size={14}/></Link></div></section>
    </main>
  </Shell></>;
}

function Shop() {
  const [active, setActive] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('category');
    return requested && categories.includes(requested) ? requested : 'All samples';
  });
  const [sort, setSort] = useState('featured');
  const available = active === 'All samples' ? products : products.filter(p => p.categories.includes(active));
  const shown = [...available].sort((a,b) => sort === 'az' ? a.name.localeCompare(b.name) : sort === 'za' ? b.name.localeCompare(a.name) : 0);
  return <><PageMeta path="/shop"/><Shell><main className="container">
    <div className="page-intro"><div className="eyebrow">The sample collection</div><h1>Plants for different ways of living.</h1><p>Browse illustrative examples by type. Each item and image is sample content, not confirmed stock or a current offer. Prices and availability are not confirmed.</p></div>
    <div className="sample-banner" role="note" data-testid="status-sample-catalog"><strong>Sample catalog only.</strong> These examples help preview Nabaat’s future range; they do not indicate availability. Any future prices would be in AED and require confirmation.</div>
    <div className="shop-layout">
      <aside className="filter-panel"><h2>Browse by</h2><div className="filter-list" role="group" aria-label="Filter sample plants">{['All samples',...categories].map(label=><button className={`filter-button${active===label?' active':''}`} type="button" key={label} aria-pressed={active===label} onClick={()=>setActive(label)} data-testid={`button-filter-${label.toLowerCase().replaceAll(' ','-')}`}>{label}</button>)}</div></aside>
      <section aria-label={`${active} sample plants`}>
        <div className="shop-tools"><span data-testid="text-product-count">{shown.length} sample {shown.length===1?'example':'examples'}</span><label>Sort <select aria-label="Sort sample plants" value={sort} onChange={e=>setSort(e.target.value)} data-testid="select-sort"><option value="featured">Suggested order</option><option value="az">Name A–Z</option><option value="za">Name Z–A</option></select></label></div>
        {shown.length ? <div className="product-grid shop-grid">{shown.map(p=><ProductCard key={p.slug} product={p}/>)}</div> : <div className="status-message" data-testid="status-no-products">There are no accessory examples in this preview yet. The sample catalog is still being shaped.</div>}
      </section>
    </div>
  </main></Shell></>;
}

function PlantDetail() {
  const params = useParams<{slug:string}>();
  const item = products.find(p=>p.slug===params.slug);
  const [size,setSize] = useState('');
  useEffect(()=>setSize(item?.size[0] ?? ''),[item?.slug]);
  if (!item) return <NotFoundPage/>;
  return <><PageMeta path={`/plant/${item.slug}`} productName={item.name}/><Shell><main className="container">
    <div className="detail-layout">
      <div><img className="detail-image" src={item.image} alt={item.alt} width="900" height="980" fetchPriority="high"/></div>
      <div className="detail-aside"><SampleFlag/><h1>{item.name}</h1><div className="care-tags"><span>{item.latin}</span><span>{item.setting}</span></div>
        <p className="lead">{item.description} This is an illustrative sample profile, not an offer of live stock.</p>
        <div className="detail-sample-note" data-testid="status-product-sample"><strong>Sample content only.</strong> Plant, image, care details and size options are examples. Availability and prices are not confirmed.</div>
        <h2 style={{font:'500 19px var(--app-font-serif)',margin:'23px 0 0'}}>Example size options</h2>
        <div className="size-choices" role="group" aria-label="Illustrative size options">{item.size.map(s=><button key={s} className={`size-choice${size===s?' active':''}`} type="button" aria-pressed={size===s} onClick={()=>setSize(s)} data-testid={`button-size-${s.toLowerCase()}`}>{s}</button>)}</div>
        <div className="detail-facts">
          {[['Light',item.light],['Watering',item.watering],['Setting',item.setting],['Maintenance',item.maintenance],['Care notes',item.care],['Please note',item.warning]].map(([label,value])=><div className="fact" key={label}><strong>{label}</strong><span>{value}</span></div>)}
        </div>
        <div style={{marginTop:25}}><Link href={`/contact?product=${item.slug}`} className="button" data-testid={`link-detail-enquire-${item.slug}`}>Enquire about this sample <ArrowRight size={15}/></Link></div>
      </div>
    </div>
  </main></Shell></>;
}

type Answers = { setting:string; light:string; time:string; space:string; goal:string };
const initialAnswers: Answers = {setting:'',light:'',time:'',space:'',goal:''};
function Finder() {
  const [answers,setAnswers] = useState<Answers>(initialAnswers);
  const done = Object.values(answers).every(Boolean);
  const matches = done ? products.filter(p => {
    const settingMatch = answers.setting==='Either' || p.setting===answers.setting;
    const lightMatch = answers.light==='Any' || (answers.light==='Bright' ? ['Bright indirect','Bright light','Direct sun'].includes(p.light) : ['Bright indirect','Low to medium'].includes(p.light));
    const timeMatch = answers.time==='Flexible' || (answers.time==='Less time' ? p.maintenance==='Easy' : true);
    const spaceMatch = answers.space==='Compact' ? !p.size.includes('Large') : true;
    const goalMatch = answers.goal==='Gifts' ? p.categories.includes('Gifts and Accessories') : answers.goal==='Greenery' ? p.goal==='Greenery' : answers.goal==='Flowers' ? p.goal==='Flowers' : p.goal==='Fruit tree';
    return settingMatch && lightMatch && timeMatch && spaceMatch && goalMatch;
  }) : [];
  const choices: [keyof Answers,string,string[]][] = [
    ['setting','Where will it live?',['Indoor','Outdoor','Either']],
    ['light','What is the light like?',['Bright','Lower light','Any']],
    ['time','How much care time suits you?',['Less time','I can check often','Flexible']],
    ['space','How much room do you have?',['Compact','Room to grow']],
    ['goal','What are you hoping for?',['Flowers','Greenery','Fruit tree','Gifts']],
  ];
  function setAnswer(key:keyof Answers,value:string) { setAnswers(prev=>({...prev,[key]:value})); }
  function reset() { setAnswers(initialAnswers); }
  return <><PageMeta path="/find-your-plant"/><Shell><main className="container">
    <div className="page-intro"><div className="eyebrow">A few thoughtful questions</div><h1>Find a plant to explore.</h1><p>Tell us about your space and routine. The suggestions come from illustrative sample entries and are a starting point—not a guarantee of suitability, growth or availability.</p></div>
    <div className="finder-wrap">
      <div className="finder-form" data-testid="form-plant-finder">
        {choices.map(([key,label,opts],i)=><fieldset className="question" key={key}><legend><span className="step-num">0{i+1} </span>{label}</legend><div className="choice-row">{opts.map(opt=><button type="button" className="choice" key={opt} aria-pressed={answers[key]===opt} onClick={()=>setAnswer(key,opt)} data-testid={`button-finder-${key}-${opt.toLowerCase().replaceAll(' ','-')}`}>{opt}</button>)}</div></fieldset>)}
        <button type="button" className="button button-outline button-small" onClick={reset} data-testid="button-finder-reset">Start again</button>
      </div>
      <section className="finder-results" aria-live="polite" data-testid="status-finder-results">
        {!done ? <><div className="eyebrow">Your starting point</div><h2>First, tell us a little.</h2><p>Complete each prompt to see sample plants that broadly fit your answers.</p></> :
          <><div className="eyebrow">Suggestions, not guarantees</div><h2>{matches.length ? 'Worth a closer look' : 'No close sample matches'}</h2><p>{matches.length ? 'These examples broadly match the choices you made. Check each plant’s needs carefully and consider your specific conditions.' : 'Try changing one of your choices, or browse the full sample catalog. A specialist can help assess a specific space later.'}</p>
            {matches.length ? <div className="result-list">{matches.map(p=><article className="result-card" key={p.slug}><img src={p.image} alt={p.alt} width="180" height="180" loading="lazy"/><div><SampleFlag/><h3>{p.name}</h3><p>{p.description}</p><Link href={`/plant/${p.slug}`} className="text-link">Sample details <ArrowRight size={13}/></Link></div></article>)}</div> : <Link href="/shop" className="button button-outline" data-testid="link-finder-shop">Browse sample plants</Link>}
          </>}
      </section>
    </div>
  </main></Shell></>;
}

const careSections = [
  {id:'watering',title:'Watering',body:<><p>There is no single watering schedule that suits every plant. Light, pot material, drainage, plant size and the season all affect how quickly a mix dries.</p><ul><li>Check the mix before watering rather than relying on a fixed weekly routine.</li><li>When watering, let excess drain away and empty standing water from the saucer.</li><li>Adjust gradually and watch for changes in the plant and soil.</li></ul></>},
  {id:'light',title:'Light',body:<><p>Light changes across a room and throughout the day. A bright window can suit one plant while being too intense for another, especially in strong afternoon sun.</p><ul><li>Notice direct sun, filtered light and shade at the plant’s actual position.</li><li>Introduce plants to a brighter spot gradually and observe their response.</li><li>Turn pots occasionally if growth leans consistently toward the light.</li></ul></>},
  {id:'potting',title:'Pots & drainage',body:<><p>Choose a pot with drainage holes and a mix suited to the plant. Decorative outer pots can hold excess water, so check after watering.</p><ul><li>A pot that is much larger than the root ball can stay wet for longer.</li><li>Repot when roots or the mix suggest it is needed, not just because a calendar says so.</li><li>Use clean tools and handle roots gently.</li></ul></>},
  {id:'problems',title:'Common changes',body:<><p>Yellowing, drooping or leaf marks can have several causes. Look at recent changes in light, watering, temperature and airflow before making adjustments.</p><ul><li>Check the soil moisture and drainage first.</li><li>Inspect both sides of leaves and stems for pests.</li><li>Change one factor at a time; avoid treating without identifying a likely cause.</li></ul><div className="care-callout">A plant’s symptoms are not a diagnosis. For persistent or spreading problems, seek advice from a knowledgeable local plant professional.</div></>},
  {id:'ac',title:'Indoors & air-conditioning',body:<><p>Air-conditioning can create cooler, drier or more variable conditions near vents. Indoor spaces may also have less natural light than they seem.</p><ul><li>Avoid placing foliage directly in the path of cold or dry airflow.</li><li>Check soil more often after changing a plant’s position or room conditions.</li><li>Do not mist as a substitute for understanding the plant’s needs.</li></ul></>},
  {id:'uae',title:'UAE climate & seasons',body:<><p>Abu Dhabi’s outdoor heat, sun and humidity vary through the year. A sheltered balcony and a fully exposed terrace can be very different environments.</p><ul><li>Protect recently moved plants while they adjust to outdoor light and heat.</li><li>Check containers more closely during hot, dry periods; avoid leaving roots in water.</li><li>Follow local seasonal conditions rather than assuming a generic calendar applies.</li></ul><div className="care-callout">These notes are general guidance, not climate-specific guarantees. Microclimates vary by building, exposure and season.</div></>},
  {id:'beginners',title:'Beginner picks',body:<><p>For a first plant, consider a sample entry labelled easy-care, then still check whether its light and space needs suit your home. “Easy” does not mean no care.</p><ul><li>Start with one plant and learn how it responds in your particular space.</li><li>Read the sample profile’s cautions, especially around pets and placement.</li><li>Choose a healthy-looking plant when the business is able to confirm live offerings.</li></ul></>},
];
function PlantCare() {
  return <><PageMeta path="/plant-care"/><Shell><main className="container">
    <div className="page-intro"><div className="eyebrow">Care notes</div><h1>Start by noticing.</h1><p className="care-intro">Plant care is less about a rigid routine and more about the conditions around each plant. These practical notes are general guidance; individual needs vary.</p></div>
    <div className="care-content">
      <nav className="care-index" aria-label="Plant care topics">{careSections.map(s=><a href={`#${s.id}`} key={s.id} data-testid={`link-care-${s.id}`}>{s.title}</a>)}</nav>
      {careSections.map(s=><section className="care-section" id={s.id} key={s.id}><h2>{s.title}</h2><div>{s.body}</div></section>)}
    </div>
  </main></Shell></>;
}

function OurStory() {
  return <><PageMeta path="/our-story"/><Shell><main className="container">
    <div className="page-intro"><div className="eyebrow">A work in progress</div><h1>Meet Nabaat.</h1><p>A new plant and flower business preparing to launch in Abu Dhabi.</p></div>
    <div className="story-layout">
    <div className="story-art"><img src={publicAsset('images/nabaat-hero.jpg')} alt="A thoughtful arrangement of green plants and a clay pot in a warm, sunlit room" width="900" height="900" loading="lazy"/></div>
      <div className="story-copy">
        <SampleFlag/>
        <h2>Not a finished story. A beginning.</h2>
        <p>Nabaat is being prepared as a place to explore plants and flowers with useful, straightforward guidance. We want the experience to help people think about what suits their space, the time they have and the conditions around them.</p>
        <p>We are still working toward launch. The sample plants and care notes on this site are here to show the direction of the project; they are not a record of live stock, confirmed services or a history of past operations.</p>
        <h2>Care before claims.</h2>
        <p>Plants are living things, and what works depends on the plant and its setting. Our aim is to share practical starting points, explain what is still uncertain and keep learning as Nabaat takes shape.</p>
        <div className="launch-label">Preparing to launch · Abu Dhabi, UAE</div>
        <p style={{marginTop:23}}><Link href="/contact" className="text-link" data-testid="link-story-contact">Ask us a question <ArrowRight size={14}/></Link></p>
      </div>
    </div>
  </main></Shell></>;
}

const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters.'),
  email: z.string().trim().email('Enter a valid email address.'),
  topic: z.string().min(1, 'Choose an enquiry category.'),
  sample: z.string(),
  message: z.string().trim().min(10, 'Add at least 10 characters.'),
});

type EnquiryValues = z.infer<typeof enquirySchema>;

function Contact() {
  const query = new URLSearchParams(window.location.search);
  const selected = products.find(p=>p.slug===query.get('product'));
  const whatsappDigits = launchConfig.whatsapp?.replace(/\D/g, '') ?? '';
  const hasSocialLinks = Boolean(launchConfig.socialLinks.instagram || launchConfig.socialLinks.tiktok);
  const [status,setStatus] = useState<'idle'|'error'|'not-sent'>('idle');
  const form = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: '', email: '', topic: '', sample: selected?.slug ?? '', message: '' },
  });
  function submit(_values: EnquiryValues) {
    setStatus('not-sent');
  }
  return <><PageMeta path="/contact"/><Shell><main className="container">
    <div className="page-intro"><div className="eyebrow">A note to Nabaat</div><h1>What are you looking for?</h1><p>Tell us what you have in mind. This is a local prototype form only; submitting does not send your message.</p></div>
    <div className="form-wrap">
      <aside className="form-aside">
        <h2>Still getting ready.</h2>
        <p>Nabaat is preparing to launch in Abu Dhabi. Contact details, opening hours, delivery area and social links will be confirmed before launch.</p>
        <dl className="contact-confirmations" aria-label="Launch details">
          <div><dt>Email</dt><dd>{launchConfig.email ? <a href={`mailto:${launchConfig.email}`} dir="ltr">{launchConfig.email}</a> : 'To be confirmed'}</dd></div>
          <div><dt>Phone</dt><dd>{launchConfig.phone ? <a href={`tel:${launchConfig.phone}`} dir="ltr">{launchConfig.phone}</a> : 'To be confirmed'}</dd></div>
          <div><dt>Opening hours</dt><dd>{launchConfig.openingHours ?? 'To be confirmed'}</dd></div>
          <div><dt>Delivery area</dt><dd>{launchConfig.deliveryArea ?? 'To be confirmed'}</dd></div>
          <div><dt>Social links</dt><dd>{hasSocialLinks ? <>{launchConfig.socialLinks.instagram && <a href={launchConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}{launchConfig.socialLinks.tiktok && <a href={launchConfig.socialLinks.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>}</> : 'To be confirmed'}</dd></div>
        </dl>
        {whatsappDigits && <a className="button button-outline button-small" href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" data-testid="link-whatsapp">WhatsApp Nabaat <ArrowRight size={14}/></a>}
        <div className="prototype-note">The form below does not transmit or store your details. A WhatsApp link appears only after the founder confirms a number in the launch settings.</div>
      </aside>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(submit,()=>setStatus('error'))} noValidate data-testid="form-enquiry">
        <div className="form-grid">
          <FormField control={form.control} name="name" render={({field})=><FormItem className="field"><FormLabel>Your name</FormLabel><FormControl><input {...field} autoComplete="name" data-testid="input-name"/></FormControl><FormMessage className="field-error"/></FormItem>}/>
          <FormField control={form.control} name="email" render={({field})=><FormItem className="field"><FormLabel>Email address</FormLabel><FormControl><input {...field} type="email" autoComplete="email" data-testid="input-email"/></FormControl><FormMessage className="field-error"/></FormItem>}/>
          <FormField control={form.control} name="topic" render={({field})=><FormItem className="field"><FormLabel>What is your enquiry about?</FormLabel><FormControl><select {...field} data-testid="select-enquiry-category"><option value="">Choose a topic</option><option>Plant or flower</option><option>Care question</option><option>Gift idea</option><option>Something else</option></select></FormControl><FormMessage className="field-error"/></FormItem>}/>
          <FormField control={form.control} name="sample" render={({field})=><FormItem className="field"><FormLabel>Sample plant (optional)</FormLabel><FormControl><select {...field} data-testid="select-enquiry-product"><option value="">No specific sample</option>{products.map(p=><option key={p.slug} value={p.slug}>{p.name} · sample</option>)}</select></FormControl><FormMessage className="field-error"/></FormItem>}/>
          <FormField control={form.control} name="message" render={({field})=><FormItem className="field full"><FormLabel>Your message</FormLabel><FormControl><textarea {...field} placeholder="A little context helps us understand what you have in mind." data-testid="input-message"/></FormControl><FormMessage className="field-error"/></FormItem>}/>
        </div>
        {status==='error' && <div className="status-message error" role="alert" data-testid="status-form-error">Please complete each required field with a valid email and a message of at least 10 characters.</div>}
        {status==='not-sent' && <div className="status-message" role="status" data-testid="status-form-not-sent"><strong>Prototype only — your message was NOT sent.</strong> Nothing was transmitted or saved. Contact details will be added after founder confirmation.</div>}
        <div style={{marginTop:20}}><button className="button" type="submit" data-testid="button-submit-enquiry">Review enquiry <ArrowRight size={14}/></button></div>
      </form>
      </Form>
    </div>
  </main></Shell></>;
}

function NotFoundPage() {
  return <><PageMeta path="/404"/><Shell><main className="notfound"><div><div className="eyebrow" style={{justifyContent:'center'}}>A small detour</div><h1>Page not found.</h1><p>That page may have moved while Nabaat is still taking shape.</p><Link href="/" className="button" data-testid="link-notfound-home">Return home <ArrowRight size={14}/></Link></div></main></Shell></>;
}

function RoutedErrorBoundary({children}:{children:ReactNode}) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function Router() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={Home}/>
    <Route path="/shop" component={Shop}/>
    <Route path="/plant/:slug" component={PlantDetail}/>
    <Route path="/find-your-plant" component={Finder}/>
    <Route path="/plant-care" component={PlantCare}/>
    <Route path="/our-story" component={OurStory}/>
    <Route path="/contact" component={Contact}/>
    <Route component={NotFoundPage}/>
  </Switch></RoutedErrorBoundary>;
}
function App() {
  return <TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router/></WouterRouter><Toaster/></TooltipProvider>;
}
export default App;
