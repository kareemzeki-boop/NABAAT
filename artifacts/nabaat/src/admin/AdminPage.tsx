import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  ImagePlus,
  Leaf,
  LogOut,
  Mail,
  PackagePlus,
  Search,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import type { Product } from "../data/catalog";
import { apiUrl, resolveImage } from "../data/api";
import { defaultSiteContent, type SiteContent } from "../data/siteContent";

type ProductRecord = Product & { published: boolean; sortOrder: number };
type Enquiry = {
  id: string;
  name: string;
  email: string;
  topic: string;
  sampleSlug: string | null;
  message: string;
  status: "new" | "in_progress" | "waiting" | "resolved" | "archived";
  adminNote: string | null;
  followUpAt: string | null;
  createdAt: string;
};
type Section = "overview" | "products" | "content" | "enquiries";

const sectionItems: { id: Section; label: string; icon: typeof Leaf }[] = [
  { id: "overview", label: "Overview", icon: Sprout },
  { id: "products", label: "Products", icon: PackagePlus },
  { id: "content", label: "Website content", icon: FileText },
  { id: "enquiries", label: "Enquiries", icon: Mail },
];

const contentFields: {
  key: keyof SiteContent;
  label: string;
  hint: string;
  multiline?: boolean;
}[] = [
  {
    key: "announcement",
    label: "Announcement bar",
    hint: "The short line above the main navigation.",
  },
  {
    key: "heroEyebrow",
    label: "Homepage eyebrow",
    hint: "Small introductory label above the main headline.",
  },
  {
    key: "heroTitleMain",
    label: "Homepage headline",
    hint: "First part of the homepage heading.",
  },
  {
    key: "heroTitleEmphasis",
    label: "Headline emphasis",
    hint: "Italic leaf-green phrase in the homepage heading.",
  },
  {
    key: "heroDescription",
    label: "Homepage introduction",
    hint: "Short description beside the hero image.",
    multiline: true,
  },
  {
    key: "homeCtaLabel",
    label: "Homepage button",
    hint: "Label for the primary sample-catalog button.",
  },
  {
    key: "footerIntro",
    label: "Footer introduction",
    hint: "Short brand line shown in the footer.",
    multiline: true,
  },
  {
    key: "footerNote",
    label: "Footer launch note",
    hint: "The launch and sample-catalog note in the footer.",
    multiline: true,
  },
  {
    key: "contactTitle",
    label: "Enquiry page headline",
    hint: "Main heading on the public enquiry page.",
  },
  {
    key: "contactIntro",
    label: "Enquiry page introduction",
    hint: "Opening copy above the enquiry form.",
    multiline: true,
  },
  {
    key: "contactAside",
    label: "Enquiry contact note",
    hint: "Note above the email, phone and social links.",
    multiline: true,
  },
  {
    key: "email",
    label: "Public email",
    hint: "Shown on the enquiry page. Leave blank to display ‘To be confirmed’.",
  },
  {
    key: "phone",
    label: "Public phone",
    hint: "Shown on the enquiry page. Leave blank to hide it.",
  },
  {
    key: "openingHours",
    label: "Opening hours",
    hint: "Leave blank to display ‘To be confirmed’.",
  },
  {
    key: "deliveryArea",
    label: "Delivery area",
    hint: "Leave blank to display ‘To be confirmed’.",
  },
  {
    key: "instagram",
    label: "Instagram URL",
    hint: "Use a full https:// URL; leave blank to hide.",
  },
  {
    key: "tiktok",
    label: "TikTok URL",
    hint: "Use a full https:// URL; leave blank to hide.",
  },
  {
    key: "storyTitle",
    label: "Our story headline",
    hint: "Main heading on the Our Story page.",
  },
  {
    key: "storyIntro",
    label: "Our story introduction",
    hint: "Opening line on the Our Story page.",
    multiline: true,
  },
];

const emptyProduct = (): ProductRecord => ({
  slug: "",
  name: "",
  latin: "",
  description: "",
  categories: [],
  image: "",
  alt: "",
  light: "Bright indirect",
  watering: "",
  setting: "Indoor",
  maintenance: "Easy",
  goal: "Greenery",
  size: ["Small", "Medium", "Large"],
  warning: "",
  care: "",
  published: true,
  sortOrder: 100,
});

function toLocalDatetime(value: string) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

async function request<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body instanceof Blob ? { "Content-Type": init.body.type } : {}),
      ...(init.body && !(init.body instanceof Blob)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error ?? `Request failed (${response.status})`);
  return result as T;
}

function SignIn({ onSignedIn }: { onSignedIn: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(apiUrl("admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Could not sign in.");
      onSignedIn(body.token);
      setPassword("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <a
          className="admin-brand"
          href={`${import.meta.env.BASE_URL}`}
          aria-label="Return to Nabaat"
        >
          <span className="admin-brand-mark">
            <Leaf size={22} />
          </span>
          <span>
            <strong>NABAAT</strong>
            <small>ADMIN WORKSPACE</small>
          </span>
        </a>
        <div className="admin-login-icon">
          <ShieldCheck size={23} />
        </div>
        <div className="admin-kicker">A quieter place to tend the details</div>
        <h1>Sign in.</h1>
        <p>
          Use the private admin password configured for Nabaat’s Railway
          service.
        </p>
        <form onSubmit={submit} className="admin-form">
          <label htmlFor="admin-password">Admin password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={16}
            autoFocus
          />
          {error && (
            <div className="admin-alert" role="alert">
              {error}
            </div>
          )}
          <button
            className="admin-primary"
            disabled={busy || password.length < 16}
          >
            {busy ? "Checking…" : "Open admin workspace"}
          </button>
        </form>
        <div className="admin-login-foot">
          <ShieldCheck size={14} /> Private access · Session expires after 12
          hours
        </div>
      </div>
    </main>
  );
}

function Notice({
  children,
  tone = "success",
}: {
  children: ReactNode;
  tone?: "success" | "error";
}) {
  return (
    <div
      className={`admin-notice ${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {tone === "success" && <Check size={15} />}
      {children}
    </div>
  );
}

function AdminWorkspace({
  token,
  onSignOut,
}: {
  token: string;
  onSignOut: () => void;
}) {
  const [section, setSection] = useState<Section>("overview");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiryTotal, setEnquiryTotal] = useState(0);
  const [allEnquiryCount, setAllEnquiryCount] = useState(0);
  const [newEnquiryCount, setNewEnquiryCount] = useState(0);
  const [enquiryStatus, setEnquiryStatus] = useState("");
  const [enquiryOffset, setEnquiryOffset] = useState(0);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState<ProductRecord>(emptyProduct());
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
    null,
  );

  async function loadWorkspace() {
    setLoading(true);
    setError("");
    try {
      const [productResult, contentResult] = await Promise.all([
        request<{ products: ProductRecord[] }>("admin/products", token),
        request<{ content: SiteContent }>("admin/content", token),
      ]);
      setProducts(
        productResult.products.map((item) => ({
          ...item,
          image: resolveImage(item.image),
        })),
      );
      setContent(contentResult.content);
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "The workspace could not be loaded.";
      if (message.includes("Sign in")) onSignOut();
      else setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkspace();
  }, [token]);

  async function loadEnquiryPage(
    query = search,
    status = enquiryStatus,
    offset = enquiryOffset,
  ) {
    setInboxLoading(true);
    const params = new URLSearchParams({
      q: query.trim(),
      status,
      limit: "50",
      offset: String(offset),
    });
    try {
      const result = await request<{
        enquiries: Enquiry[];
        total: number;
        allCount: number;
        newCount: number;
      }>(`admin/enquiries?${params.toString()}`, token);
      setEnquiries(result.enquiries);
      setEnquiryTotal(result.total);
      setAllEnquiryCount(result.allCount);
      setNewEnquiryCount(result.newCount);
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Could not load the enquiry inbox.";
      if (message.includes("Sign in")) onSignOut();
      else setError(message);
    } finally {
      setInboxLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEnquiryPage(search, enquiryStatus, enquiryOffset);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [token, search, enquiryStatus, enquiryOffset]);

  const selectedEnquiry =
    enquiries.find((item) => item.id === selectedEnquiryId) ?? null;
  const matchingEnquiries = enquiries;
  const totalPages = Math.max(1, Math.ceil(enquiryTotal / 50));
  const currentPage = Math.floor(enquiryOffset / 50) + 1;

  async function saveContent(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await request<{ content: SiteContent }>(
        "admin/content",
        token,
        { method: "PUT", body: JSON.stringify(content) },
      );
      setContent(result.content);
      setNotice("Website content saved. The public site will refresh shortly.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not save website content.",
      );
    } finally {
      setSaving(false);
    }
  }

  function startNewProduct() {
    setProduct(emptyProduct());
    setEditingSlug(null);
    setNotice("");
  }
  function editProduct(item: ProductRecord) {
    setProduct({
      ...item,
      categories: [...item.categories],
      size: [...item.size],
    });
    setEditingSlug(item.slug);
    setNotice("");
  }
  function updateProduct<K extends keyof ProductRecord>(
    key: K,
    value: ProductRecord[K],
  ) {
    setProduct((current) => ({ ...current, [key]: value }));
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Images must be 8 MB or smaller.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await request<{ url: string }>("admin/uploads", token, {
        method: "POST",
        body: file,
      });
      updateProduct("image", result.url);
      setNotice("Image uploaded. Save the product to publish it.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Image upload failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...product,
      slug:
        product.slug ||
        product.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      categories: product.categories.filter(Boolean),
      size: product.size.filter(Boolean),
    };
    try {
      const result = await request<{ product: ProductRecord }>(
        editingSlug
          ? `admin/products/${encodeURIComponent(editingSlug)}`
          : "admin/products",
        token,
        { method: editingSlug ? "PUT" : "POST", body: JSON.stringify(payload) },
      );
      setProduct(result.product);
      setEditingSlug(result.product.slug);
      setNotice("Product saved to the catalog.");
      await loadWorkspace();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not save product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEnquiry) return;
    setSaving(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const localDate = String(form.get("followUpAt") ?? "");
    const followUpAt = localDate ? new Date(localDate).toISOString() : null;
    try {
      await request(
        `admin/enquiries/${encodeURIComponent(selectedEnquiry.id)}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: form.get("status"),
            adminNote: form.get("adminNote"),
            followUpAt,
          }),
        },
      );
      setNotice("Follow-up details saved.");
      await loadEnquiryPage();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not update enquiry.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function refreshEnquiries() {
    await loadEnquiryPage(search, enquiryStatus, enquiryOffset);
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <a className="admin-brand" href={`${import.meta.env.BASE_URL}`}>
          <span className="admin-brand-mark">
            <Leaf size={22} />
          </span>
          <span>
            <strong>NABAAT</strong>
            <small>ADMIN WORKSPACE</small>
          </span>
        </a>
        <div className="admin-sidebar-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin sections">
          {sectionItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={section === id ? "active" : ""}
              onClick={() => {
                setSection(id);
                setError("");
                setNotice("");
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {id === "enquiries" && newEnquiryCount > 0 && (
                <i>{newEnquiryCount}</i>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a
            href="https://kareemzeki-boop.github.io/NABAAT/"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} /> View public site
          </a>
          <button type="button" onClick={onSignOut}>
            <LogOut size={15} /> Sign out
          </button>
          <div className="admin-secure-label">
            <ShieldCheck size={14} /> Private admin session
          </div>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-top-kicker">NABAAT · OPERATIONS</span>
            <h1>{sectionItems.find((item) => item.id === section)?.label}</h1>
          </div>
          <div className="admin-top-status">
            <span className="admin-status-dot" /> Connected to live workspace
          </div>
          <button
            type="button"
            className="admin-top-signout"
            onClick={onSignOut}
          >
            <LogOut size={15} /> Sign out
          </button>
        </header>
        <section className="admin-content">
          {error && <Notice tone="error">{error}</Notice>}
          {notice && <Notice>{notice}</Notice>}
          {loading ? (
            <div className="admin-loading">
              <span /> Gathering the latest details…
            </div>
          ) : (
            <>
              {section === "overview" && (
                <>
                  <div className="admin-welcome">
                    <div>
                      <div className="admin-kicker">
                        A clearer view of what needs attention
                      </div>
                      <h2>Good work grows from good notes.</h2>
                      <p>
                        Keep Nabaat’s sample collection, public details and
                        customer follow-up in one calm place.
                      </p>
                    </div>
                    <div className="admin-welcome-mark">
                      <Sprout size={54} strokeWidth={1.1} />
                    </div>
                  </div>
                  <div className="admin-stat-grid">
                    <button
                      type="button"
                      className="admin-stat-card"
                      onClick={() => setSection("products")}
                    >
                      <span className="admin-stat-icon">
                        <PackagePlus size={18} />
                      </span>
                      <strong>{products.length}</strong>
                      <span>Products in catalog</span>
                      <small>
                        {products.filter((item) => item.published).length}{" "}
                        visible on site
                      </small>
                    </button>
                    <button
                      type="button"
                      className="admin-stat-card"
                      onClick={() => setSection("enquiries")}
                    >
                      <span className="admin-stat-icon clay">
                        <Mail size={18} />
                      </span>
                      <strong>{newEnquiryCount}</strong>
                      <span>New enquiries</span>
                      <small>{allEnquiryCount} total records</small>
                    </button>
                    <button
                      type="button"
                      className="admin-stat-card"
                      onClick={() => setSection("content")}
                    >
                      <span className="admin-stat-icon olive">
                        <FileText size={18} />
                      </span>
                      <strong>Live</strong>
                      <span>Website content</span>
                      <small>Changes update the public pages</small>
                    </button>
                  </div>
                  <div className="admin-overview-columns">
                    <div className="admin-panel">
                      <div className="admin-panel-heading">
                        <div>
                          <span className="admin-kicker">FOLLOW-UP</span>
                          <h3>Recent enquiries</h3>
                        </div>
                        <button
                          type="button"
                          className="admin-text-button"
                          onClick={() => setSection("enquiries")}
                        >
                          Open inbox <ArrowLeft size={14} />
                        </button>
                      </div>
                      {enquiries.slice(0, 5).map((item) => (
                        <button
                          type="button"
                          className="admin-recent-row"
                          key={item.id}
                          onClick={() => {
                            setSelectedEnquiryId(item.id);
                            setSection("enquiries");
                          }}
                        >
                          <span className={`admin-status-pill ${item.status}`}>
                            {item.status.replace("_", " ")}
                          </span>
                          <span>
                            <strong>{item.name}</strong>
                            <small>
                              {item.topic} ·{" "}
                              {new Date(item.createdAt).toLocaleDateString()}
                            </small>
                          </span>
                          <ArrowLeft className="admin-row-arrow" size={14} />
                        </button>
                      ))}
                      {enquiries.length === 0 && (
                        <p className="admin-empty-inline">
                          No enquiries yet. New messages will appear here.
                        </p>
                      )}
                    </div>
                    <div className="admin-panel admin-shortcuts">
                      <span className="admin-kicker">QUICK CARE</span>
                      <h3>Small edits, in the right place.</h3>
                      <p>
                        Update your public launch details or tend the product
                        catalog whenever plans change.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSection("content")}
                      >
                        Edit website content <ArrowLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          startNewProduct();
                          setSection("products");
                        }}
                      >
                        Add a product <ArrowLeft size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
              {section === "content" && (
                <div className="admin-panel admin-editor-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-kicker">PUBLIC-FACING COPY</span>
                      <h3>Website content</h3>
                      <p>
                        Edit what visitors read on the homepage, our story, and
                        enquiry page.
                      </p>
                    </div>
                    <a
                      href="https://kareemzeki-boop.github.io/NABAAT/"
                      target="_blank"
                      rel="noreferrer"
                      className="admin-text-button"
                    >
                      Preview site <ExternalLink size={14} />
                    </a>
                  </div>
                  <form className="admin-content-form" onSubmit={saveContent}>
                    <div className="admin-fields-grid">
                      {contentFields.map(({ key, label, hint, multiline }) => (
                        <label className="admin-field" key={key}>
                          <span>{label}</span>
                          {multiline ? (
                            <textarea
                              rows={3}
                              value={content[key]}
                              onChange={(event) =>
                                setContent((current) => ({
                                  ...current,
                                  [key]: event.target.value,
                                }))
                              }
                            />
                          ) : (
                            <input
                              value={content[key]}
                              onChange={(event) =>
                                setContent((current) => ({
                                  ...current,
                                  [key]: event.target.value,
                                }))
                              }
                            />
                          )}
                          <small>{hint}</small>
                        </label>
                      ))}
                    </div>
                    <div className="admin-form-actions">
                      <span>Changes are saved to the live site database.</span>
                      <button className="admin-primary" disabled={saving}>
                        {saving ? "Saving…" : "Save website content"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {section === "products" && (
                <div className="admin-product-layout">
                  <div className="admin-panel admin-product-list">
                    <div className="admin-panel-heading">
                      <div>
                        <span className="admin-kicker">CATALOG</span>
                        <h3>Products</h3>
                      </div>
                      <button
                        type="button"
                        className="admin-primary small"
                        onClick={startNewProduct}
                      >
                        <PackagePlus size={15} /> Add product
                      </button>
                    </div>
                    <div className="admin-product-items">
                      {products.map((item) => (
                        <button
                          type="button"
                          className={`admin-product-row${editingSlug === item.slug ? " selected" : ""}`}
                          key={item.slug}
                          onClick={() => editProduct(item)}
                        >
                          <img src={item.image} alt="" />
                          <span>
                            <strong>{item.name}</strong>
                            <small>{item.latin || item.slug}</small>
                          </span>
                          <i
                            className={`admin-publish-dot${item.published ? " on" : ""}`}
                            title={
                              item.published
                                ? "Visible on website"
                                : "Hidden from website"
                            }
                          />
                        </button>
                      ))}
                      {products.length === 0 && (
                        <p className="admin-empty-inline">
                          No products yet. Add your first catalog entry.
                        </p>
                      )}
                    </div>
                    <p className="admin-muted-note">
                      Hidden products stay saved in your catalog and are not
                      shown publicly.
                    </p>
                  </div>
                  <div className="admin-panel admin-product-editor">
                    <div className="admin-panel-heading">
                      <div>
                        <span className="admin-kicker">
                          {editingSlug
                            ? "EDIT CATALOG ENTRY"
                            : "NEW CATALOG ENTRY"}
                        </span>
                        <h3>
                          {editingSlug
                            ? product.name || "Update product"
                            : "Add a product"}
                        </h3>
                        <p>
                          Product details feed the sample catalog and enquiry
                          form.
                        </p>
                      </div>
                    </div>
                    <form onSubmit={saveProduct} className="admin-product-form">
                      <div className="admin-image-upload">
                        <div className="admin-image-preview">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.alt || "Product preview"}
                            />
                          ) : (
                            <div>
                              <ImagePlus size={26} />
                              <span>Add a product image</span>
                            </div>
                          )}
                        </div>
                        <label className="admin-upload-button">
                          <ImagePlus size={15} />{" "}
                          {saving
                            ? "Working…"
                            : product.image
                              ? "Replace image"
                              : "Upload image"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={saving}
                            onChange={(event) => {
                              void uploadImage(event.target.files?.[0]);
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <span>JPEG, PNG or WebP · up to 8 MB</span>
                      </div>
                      <div className="admin-fields-grid two">
                        {[
                          {
                            key: "name",
                            label: "Display name",
                            placeholder: "Monstera",
                          },
                          {
                            key: "slug",
                            label: "Page address (slug)",
                            placeholder: "monstera-deliciosa",
                          },
                          {
                            key: "latin",
                            label: "Botanical name",
                            placeholder: "Monstera deliciosa",
                          },
                          {
                            key: "alt",
                            label: "Image description",
                            placeholder: "Monstera in a clay pot",
                          },
                          {
                            key: "description",
                            label: "Short description",
                            placeholder: "A brief introduction",
                          },
                          {
                            key: "categories",
                            label: "Categories (comma-separated)",
                            placeholder: "Indoor, Easy-Care",
                          },
                          {
                            key: "light",
                            label: "Light",
                            placeholder: "Bright indirect",
                          },
                          {
                            key: "watering",
                            label: "Watering guidance",
                            placeholder: "Check soil before watering",
                          },
                          {
                            key: "setting",
                            label: "Setting",
                            placeholder: "Indoor",
                          },
                          {
                            key: "maintenance",
                            label: "Care level",
                            placeholder: "Easy",
                          },
                          {
                            key: "goal",
                            label: "Plant goal",
                            placeholder: "Greenery",
                          },
                          {
                            key: "size",
                            label: "Sizes (comma-separated)",
                            placeholder: "Small, Medium, Large",
                          },
                          {
                            key: "care",
                            label: "Care notes",
                            placeholder: "Helpful care details",
                          },
                          {
                            key: "warning",
                            label: "Cautions",
                            placeholder: "Pet or handling notes",
                          },
                        ].map(({ key, label, placeholder }) => (
                          <label className="admin-field" key={key}>
                            <span>{label}</span>
                            {[
                              "description",
                              "watering",
                              "care",
                              "warning",
                            ].includes(key) ? (
                              <textarea
                                rows={2}
                                value={
                                  Array.isArray(
                                    product[key as keyof ProductRecord],
                                  )
                                    ? ""
                                    : String(
                                        product[key as keyof ProductRecord] ??
                                          "",
                                      )
                                }
                                placeholder={placeholder}
                                onChange={(event) =>
                                  updateProduct(
                                    key as keyof ProductRecord,
                                    event.target.value as never,
                                  )
                                }
                              />
                            ) : (
                              <input
                                value={
                                  key === "categories"
                                    ? product.categories.join(", ")
                                    : key === "size"
                                      ? product.size.join(", ")
                                      : String(
                                          product[key as keyof ProductRecord] ??
                                            "",
                                        )
                                }
                                placeholder={placeholder}
                                onChange={(event) => {
                                  const raw = event.target.value;
                                  if (key === "categories" || key === "size")
                                    updateProduct(
                                      key,
                                      raw
                                        .split(",")
                                        .map((part) => part.trim())
                                        .filter(Boolean) as never,
                                    );
                                  else
                                    updateProduct(
                                      key as keyof ProductRecord,
                                      raw as never,
                                    );
                                }}
                              />
                            )}
                          </label>
                        ))}
                      </div>
                      <div className="admin-product-options">
                        <label>
                          <input
                            type="checkbox"
                            checked={product.published}
                            onChange={(event) =>
                              updateProduct("published", event.target.checked)
                            }
                          />{" "}
                          Visible on the public website
                        </label>
                        <label>
                          Display order{" "}
                          <input
                            type="number"
                            min="0"
                            max="10000"
                            value={product.sortOrder}
                            onChange={(event) =>
                              updateProduct(
                                "sortOrder",
                                Number(event.target.value),
                              )
                            }
                          />
                        </label>
                      </div>
                      <div className="admin-form-actions">
                        <span>
                          {editingSlug
                            ? "Changes update the published catalog."
                            : "Add the entry when the details are ready."}
                        </span>
                        <button
                          className="admin-primary"
                          disabled={
                            saving || !product.name.trim() || !product.image
                          }
                        >
                          {saving
                            ? "Saving…"
                            : editingSlug
                              ? "Save product"
                              : "Add product"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {section === "enquiries" && (
                <div className="admin-panel admin-inbox-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-kicker">CUSTOMER FOLLOW-UP</span>
                      <h3>Enquiry inbox</h3>
                      <p>
                        Private details submitted by visitors. Notes are visible
                        only to signed-in admins.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-icon-button"
                      aria-label="Refresh inbox"
                      onClick={() => void refreshEnquiries()}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                  <div className="admin-inbox-layout">
                    <div className="admin-inbox-list">
                      <label className="admin-search">
                        <Search size={16} />
                        <input
                          value={search}
                          onChange={(event) => {
                            setSearch(event.target.value);
                            setEnquiryOffset(0);
                          }}
                          placeholder="Search all enquiries"
                        />
                      </label>
                      <label className="admin-status-filter">
                        <span>Show</span>
                        <select
                          value={enquiryStatus}
                          onChange={(event) => {
                            setEnquiryStatus(event.target.value);
                            setEnquiryOffset(0);
                          }}
                          aria-label="Filter enquiries by status"
                        >
                          <option value="">All statuses</option>
                          <option value="new">New</option>
                          <option value="in_progress">In progress</option>
                          <option value="waiting">Waiting for reply</option>
                          <option value="resolved">Resolved</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                      {inboxLoading && (
                        <p className="admin-empty-inline" role="status">
                          Searching the enquiry records…
                        </p>
                      )}
                      {!inboxLoading &&
                        matchingEnquiries.map((item) => (
                          <button
                            key={item.id}
                            className={`admin-enquiry-row${selectedEnquiryId === item.id ? " selected" : ""}`}
                            onClick={() => setSelectedEnquiryId(item.id)}
                            type="button"
                          >
                            <span
                              className={`admin-status-pill ${item.status}`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                            <strong>{item.name}</strong>
                            <small>{item.email}</small>
                            <p>{item.message}</p>
                            <time>
                              {new Date(item.createdAt).toLocaleString()}
                            </time>
                          </button>
                        ))}
                      {!inboxLoading && matchingEnquiries.length === 0 && (
                        <p className="admin-empty-inline">
                          No matching enquiries.
                        </p>
                      )}
                      <div className="admin-pagination">
                        <button
                          type="button"
                          disabled={enquiryOffset === 0 || inboxLoading}
                          onClick={() =>
                            setEnquiryOffset((offset) =>
                              Math.max(0, offset - 50),
                            )
                          }
                        >
                          Previous
                        </button>
                        <span aria-live="polite">
                          Page {currentPage} of {totalPages} · {enquiryTotal}{" "}
                          matches
                        </span>
                        <button
                          type="button"
                          disabled={currentPage >= totalPages || inboxLoading}
                          onClick={() =>
                            setEnquiryOffset((offset) => offset + 50)
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                    {selectedEnquiry ? (
                      <form
                        className="admin-enquiry-detail"
                        onSubmit={saveEnquiry}
                      >
                        <div className="admin-enquiry-detail-head">
                          <div>
                            <span className="admin-kicker">
                              {selectedEnquiry.topic}
                            </span>
                            <h4>{selectedEnquiry.name}</h4>
                            <a href={`mailto:${selectedEnquiry.email}`}>
                              {selectedEnquiry.email}
                            </a>
                          </div>
                          <a
                            className="admin-text-button"
                            href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent("Nabaat enquiry follow-up")}`}
                          >
                            <Mail size={15} /> Reply by email
                          </a>
                        </div>
                        <div className="admin-message-card">
                          <span>VISITOR MESSAGE</span>
                          <p>{selectedEnquiry.message}</p>
                          {selectedEnquiry.sampleSlug && (
                            <small>Product: {selectedEnquiry.sampleSlug}</small>
                          )}
                        </div>
                        <div className="admin-follow-fields">
                          <label className="admin-field">
                            <span>Follow-up status</span>
                            <select
                              name="status"
                              defaultValue={selectedEnquiry.status}
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In progress</option>
                              <option value="waiting">Waiting for reply</option>
                              <option value="resolved">Resolved</option>
                              <option value="archived">Archived</option>
                            </select>
                          </label>
                          <label className="admin-field">
                            <span>Follow-up date</span>
                            <input
                              type="datetime-local"
                              name="followUpAt"
                              defaultValue={
                                selectedEnquiry.followUpAt
                                  ? toLocalDatetime(selectedEnquiry.followUpAt)
                                  : ""
                              }
                            />
                          </label>
                          <label className="admin-field">
                            <span>Private follow-up notes</span>
                            <textarea
                              name="adminNote"
                              rows={5}
                              defaultValue={selectedEnquiry.adminNote ?? ""}
                              placeholder="Record who will reply, what was discussed, or what needs checking…"
                            />
                          </label>
                        </div>
                        <div className="admin-form-actions">
                          <span>
                            For your team only — not visible to the visitor.
                          </span>
                          <button className="admin-primary" disabled={saving}>
                            {saving ? "Saving…" : "Save follow-up"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="admin-inbox-empty">
                        <Mail size={24} />
                        <h4>Choose an enquiry</h4>
                        <p>
                          Select a message to review it and record your
                          follow-up.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  return token ? (
    <AdminWorkspace token={token} onSignOut={() => setToken(null)} />
  ) : (
    <SignIn onSignedIn={setToken} />
  );
}
