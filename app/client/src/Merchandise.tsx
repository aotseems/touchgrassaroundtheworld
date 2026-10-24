import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "./components/Icon";
import "./Merchandise.css";

export interface MerchandiseOption {
  name: string; // e.g. "Size", "Color", "Edition", "Strap"
  values: string[];
  colorCodes?: Record<string, string>; // hex code map for color swatches
}

export interface MerchandiseItem {
  id: string;
  name: string;
  category: "all" | "apparel" | "gear" | "accessories" | "field-kit";
  categoryLabel: string;
  price: number;
  description: string;
  rating: number;
  tags: string[];
  imageUrl: string; // online link
  localImage?: string; // local image asset
  options: MerchandiseOption[];
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  cartId: string;
  item: MerchandiseItem;
  selectedOptions: Record<string, string>;
  quantity: number;
  activeImage: string;
  unitPrice: number;
}

export interface OrderReceipt {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
}

// Sample Catalog with both local images and online URL links
const MERCHANDISE_CATALOG: MerchandiseItem[] = [
  {
    id: "tee-touch-grass",
    name: "Touch Grass Heavyweight Tee",
    category: "apparel",
    categoryLabel: "Apparel",
    price: 34.0,
    description:
      "100% GOTS-certified organic cotton heavyweight shirt. Screen printed with eco-friendly water-based ink featuring the Touch Grass mountain crest.",
    rating: 4.9,
    tags: ["organic", "cotton", "t-shirt", "apparel", "clothing"],
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    localImage: "/merchandise/tee.svg",
    options: [
      {
        name: "Size",
        values: ["S", "M", "L", "XL", "2XL"],
      },
      {
        name: "Color",
        values: ["Forest Olive", "Deep Obsidian", "Earth Cream", "Alpine Navy"],
        colorCodes: {
          "Forest Olive": "#2e3d2f",
          "Deep Obsidian": "#1b1e1c",
          "Earth Cream": "#e4dfcf",
          "Alpine Navy": "#253444",
        },
      },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: "cap-field-club",
    name: "Field Explorer Embroidered Cap",
    category: "apparel",
    categoryLabel: "Apparel",
    price: 28.0,
    description:
      "6-panel washed cotton twill cap featuring custom high-density embroidered clover badge and antique brass buckle closure.",
    rating: 4.8,
    tags: ["hat", "cap", "headwear", "accessories"],
    imageUrl:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
    localImage: "/merchandise/cap.svg",
    options: [
      {
        name: "Color",
        values: ["Olive Forest", "Dark Walnut", "Stone Dust"],
        colorCodes: {
          "Olive Forest": "#3b4a39",
          "Dark Walnut": "#4a382c",
          "Stone Dust": "#7c8075",
        },
      },
      {
        name: "Fit",
        values: ["Adjustable Brass Clasp", "Fitted Flex"],
      },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: "flask-trail-32",
    name: "Alpine Insulated Trail Flask (32oz)",
    category: "gear",
    categoryLabel: "Trail Gear",
    price: 38.0,
    description:
      "Double-wall vacuum insulated stainless steel canteen. Keeps alpine spring water ice-cold for 24 hours. Leak-proof steel loop lid.",
    rating: 5.0,
    tags: ["flask", "water bottle", "hydration", "stainless", "gear"],
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    localImage: "/merchandise/bottle.svg",
    options: [
      {
        name: "Size",
        values: ["20 oz (590ml)", "32 oz (946ml)"],
      },
      {
        name: "Color",
        values: ["Pine Glaze", "Desert Sand", "Matte Obsidian"],
        colorCodes: {
          "Pine Glaze": "#2f4233",
          "Desert Sand": "#c2a988",
          "Matte Obsidian": "#1e241f",
        },
      },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: "journal-botanical-3pk",
    name: "Botanical Field Note Journal (3-Pack)",
    category: "field-kit",
    categoryLabel: "Field Kit",
    price: 18.0,
    description:
      "Weatherproof stone paper journals for sketching wild flora, recording coordinates, and logging field notes in rain, snow, or mist.",
    rating: 4.9,
    tags: ["notebook", "journal", "stationery", "paper", "field guide"],
    imageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    localImage: "/merchandise/journal.svg",
    options: [
      {
        name: "Edition",
        values: ["Waterproof Stone Paper", "Hardcover Botanical", "Pocket Dot Grid"],
      },
    ],
    inStock: true,
  },
  {
    id: "tote-canvas-heavy",
    name: "Wilderness Heavy Canvas Tote",
    category: "accessories",
    categoryLabel: "Accessories",
    price: 26.0,
    description:
      "Rugged 16oz duck canvas tote with reinforced cross-stitching. Built to carry picnic blankets, foraging finds, and botanical books.",
    rating: 4.7,
    tags: ["tote", "bag", "canvas", "accessories"],
    imageUrl:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    localImage: "/merchandise/tote.svg",
    options: [
      {
        name: "Color",
        values: ["Natural Raw Canvas", "Forest Moss", "Dusk Charcoal"],
        colorCodes: {
          "Natural Raw Canvas": "#c9bfa7",
          "Forest Moss": "#384734",
          "Dusk Charcoal": "#262a26",
        },
      },
      {
        name: "Strap",
        values: ["Standard Shoulder", "Long Crossbody"],
      },
    ],
    inStock: true,
  },
  {
    id: "pin-grass-badge",
    name: "Certified Grass Toucher Enamel Pin",
    category: "accessories",
    categoryLabel: "Accessories",
    price: 12.0,
    description:
      "Solid brass hard enamel collector pin. Showcase your outdoor adventures on your backpack, field jacket, or camera strap.",
    rating: 4.9,
    tags: ["pin", "enamel", "badge", "collector", "gift"],
    imageUrl:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
    localImage: "/merchandise/pin-badge.svg",
    options: [
      {
        name: "Finish",
        values: ["Polished Gold", "Antique Bronze", "Matte Black Nickel"],
        colorCodes: {
          "Polished Gold": "#d4af37",
          "Antique Bronze": "#8c6747",
          "Matte Black Nickel": "#292929",
        },
      },
    ],
    inStock: true,
  },
  {
    id: "socks-merino-trail",
    name: "Trailside Merino Wool Hiking Socks",
    category: "apparel",
    categoryLabel: "Apparel",
    price: 22.0,
    description:
      "Extra-fine merino wool blend with arch compression and cushioned sole for moisture regulation and blister prevention.",
    rating: 4.8,
    tags: ["socks", "wool", "merino", "hiking", "apparel"],
    imageUrl:
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=800&q=80",
    localImage: "/merchandise/tee.svg",
    options: [
      {
        name: "Size",
        values: ["S (35-38)", "M (39-42)", "L (43-46)"],
      },
      {
        name: "Color",
        values: ["Sage Green", "Charcoal Heather", "Oatmeal"],
        colorCodes: {
          "Sage Green": "#607357",
          "Charcoal Heather": "#474d47",
          "Oatmeal": "#c4bba7",
        },
      },
    ],
    inStock: true,
  },
  {
    id: "bandana-block-print",
    name: "Sun & Storm Trail Bandana",
    category: "accessories",
    categoryLabel: "Accessories",
    price: 16.0,
    description:
      "Hand block-printed 100% organic cotton bandana. Versatile sun shelter, neck gaiter, camera wipe, or trail marker.",
    rating: 4.6,
    tags: ["bandana", "cotton", "accessories", "gear"],
    imageUrl:
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80",
    localImage: "/merchandise/tote.svg",
    options: [
      {
        name: "Color",
        values: ["Moss Green", "Ochre Gold", "Mountain Indigo"],
        colorCodes: {
          "Moss Green": "#445c43",
          "Ochre Gold": "#b8860b",
          "Mountain Indigo": "#283a4d",
        },
      },
    ],
    inStock: true,
  },
];

const LOCAL_STORAGE_CART_KEY = "touch_grass_merchandise_cart";

export default function Merchandise() {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  
  // Image Mode Preference: "prefer-local" | "prefer-url"
  const [globalImagePref, setGlobalImagePref] = useState<"local" | "url">("local");
  // Per-item override toggles
  const [itemImageOverrides, setItemImageOverrides] = useState<Record<string, "local" | "url">>({});

  // Selected options per item: { [itemId]: { [optionName]: selectedValue } }
  const [itemSelections, setItemSelections] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    MERCHANDISE_CATALOG.forEach((item) => {
      initial[item.id] = {};
      item.options.forEach((opt) => {
        initial[item.id][opt.name] = opt.values[0] || "";
      });
    });
    return initial;
  });

  // Cart State with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage", e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<OrderReceipt | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Checkout Form fields
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");

  useEffect(() => {
    if (!isCartOpen && !isCheckoutOpen && !orderReceipt) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCartOpen, isCheckoutOpen, orderReceipt]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("Failed to persist cart", e);
    }
  }, [cart]);

  // Show Toast Helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Image source resolver
  const getActiveImageForItem = (item: MerchandiseItem) => {
    const override = itemImageOverrides[item.id];
    const mode = override || globalImagePref;
    if (mode === "local" && item.localImage) {
      return item.localImage;
    }
    return item.imageUrl;
  };

  const toggleItemImage = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemImageOverrides((prev) => {
      const current = prev[itemId] || globalImagePref;
      return {
        ...prev,
        [itemId]: current === "local" ? "url" : "local",
      };
    });
  };

  // Option selection handler
  const handleOptionChange = (itemId: string, optionName: string, value: string) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [optionName]: value,
      },
    }));
  };

  // Add to cart handler
  const handleAddToCart = (item: MerchandiseItem, openDrawer = false) => {
    const selectedOptions = itemSelections[item.id] || {};
    // Create unique key for cart item based on chosen options
    const optionKey = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
    const cartId = `${item.id}-${optionKey}`;
    const activeImage = getActiveImageForItem(item);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) => ci.cartId === cartId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartId,
          item,
          selectedOptions: { ...selectedOptions },
          quantity: 1,
          activeImage,
          unitPrice: item.price,
        };
        return [...prevCart, newItem];
      }
    });

    const optionsSummary = Object.values(selectedOptions).join(", ");
    showToast(`Added ${item.name} (${optionsSummary}) to cart!`);

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((ci) => {
          if (ci.cartId === cartId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.cartId !== cartId));
  };

  const handleApplyCoupon = () => {
    const cleaned = couponCode.trim().toUpperCase();
    if (cleaned === "TOUCHGRASS10" || cleaned === "OUTSIDE10") {
      setDiscountPercent(10);
      showToast("10% Trail Explorer discount applied!");
    } else if (cleaned === "GRASS100" || cleaned === "FREE") {
      setDiscountPercent(100);
      showToast("100% Trail Pass VIP discount applied!");
    } else {
      showToast("Invalid code. Try code: TOUCHGRASS10");
    }
  };

  // Calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const shipping = 0; // Free Eco Delivery
  const total = Math.max(0, subtotal - discountAmount + shipping);

  // Autofill demo address
  const handleAutofillDemo = () => {
    setCheckoutName("Alex Meadow");
    setCheckoutEmail("alex@touchgrass.club");
    setCheckoutAddress("404 Pine Trail Way, Dolomites Mountain Base, Italy");
  };

  // Instant Success Payment (No Credit Card Needed)
  const handleProcessPayment = () => {
    if (!checkoutName || !checkoutEmail || !checkoutAddress) {
      alert("Please enter customer name, email, and shipping address (or click Autofill Demo).");
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      const receipt: OrderReceipt = {
        orderId: `TG-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        items: [...cart],
        subtotal,
        shipping,
        discount: discountAmount,
        total,
        customerName: checkoutName,
        customerEmail: checkoutEmail,
        shippingAddress: checkoutAddress,
        paymentMethod: "Touch Grass Trail Pass (100% Free Demo Checkout - No Card Required)",
      };

      setOrderReceipt(receipt);
      setIsProcessingPayment(false);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setCart([]); // Clear cart
      localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
    }, 1200);
  };

  // Filtered and Sorted Catalog
  const filteredItems = useMemo(() => {
    return MERCHANDISE_CATALOG.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = item.categoryLabel.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTag && !matchesCategory) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      // default: featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="merch-container">
      {/* Header Banner */}
      <section className="merch-header">
        <div className="merch-header-copy">
          <div className="merch-eyebrow">
            <span className="live-dot" /> OFFICIAL OUTDOOR OUTFITTER
          </div>
          <h1>
            Touch Grass <em>Goods.</em>
          </h1>
          <p>
            Field-tested trail apparel, insulated canteens, weatherproof journals, and
            botanical gear. Designed for curious hikers, grass wanderers, and weekend explorers.
          </p>
        </div>

        <div className="merch-header-actions">
          {/* Image source switch */}
          <div className="image-mode-toggle" title="Toggle between local SVG illustrations and online link images">
            <button
              type="button"
              className={`image-mode-btn ${globalImagePref === "local" ? "active" : ""}`}
              onClick={() => setGlobalImagePref("local")}
            >
              📁 Local Assets
            </button>
            <button
              type="button"
              className={`image-mode-btn ${globalImagePref === "url" ? "active" : ""}`}
              onClick={() => setGlobalImagePref("url")}
            >
              🌐 Link URLs
            </button>
          </div>

          {/* Cart Trigger */}
          <button
            className="merch-cart-btn"
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open shopping cart with ${cartCount} items`}
          >
            <Icon name="shopping-bag" size={17} />
            <span>Bag</span>
            <span className="merch-cart-badge">{cartCount}</span>
          </button>
        </div>
      </section>

      {/* Search and Filters Toolbar */}
      <section className="merch-toolbar">
        <div className="merch-search-row">
          <div className="merch-search-box">
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Search merchandise by name, tags, or options (e.g. shirt, flask, journal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="merch-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <Icon name="x" size={12} />
              </button>
            )}
          </div>

          <select
            className="merch-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
          >
            <option value="featured">Featured Collection</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Alphabetical (A - Z)</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div className="merch-categories">
          {[
            { id: "all", label: "All Goods" },
            { id: "apparel", label: "Apparel & Shirts" },
            { id: "gear", label: "Trail Gear & Flasks" },
            { id: "accessories", label: "Accessories & Bags" },
            { id: "field-kit", label: "Field Stationery" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-chip ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="merch-count-notice">
          Showing {filteredItems.length} outdoor field product{filteredItems.length === 1 ? "" : "s"}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </section>

      {/* Merchandise Grid */}
      <section className="merch-grid">
        {filteredItems.length === 0 ? (
          <div className="cart-empty-state" style={{ gridColumn: "1 / -1", padding: "80px 20px" }}>
            <div className="cart-empty-icon">
              <Icon name="search" size={24} />
            </div>
            <h3>No merchandise found</h3>
            <p>Try searching for another product name or reset your category filter.</p>
            <button
              type="button"
              className="merch-btn-cart"
              style={{ width: "auto", padding: "10px 20px" }}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Show all items
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const activeImg = getActiveImageForItem(item);
            const isLocal = activeImg.startsWith("/merchandise") || activeImg.startsWith("/");
            const currentSelections = itemSelections[item.id] || {};

            return (
              <article className="merch-card" key={item.id}>
                {/* Media Area */}
                <div className="merch-card-media">
                  <img
                    src={activeImg}
                    alt={item.name}
                    className="merch-card-img"
                    loading="lazy"
                    onError={(e) => {
                      // Graceful fallback to local SVG if online URL fails
                      if (item.localImage && (e.currentTarget.src !== item.localImage)) {
                        e.currentTarget.src = item.localImage;
                      }
                    }}
                  />

                  {/* Badge showing whether local or URL link */}
                  <span className={`merch-source-tag ${isLocal ? "local" : ""}`}>
                    {isLocal ? "📁 Local SVG" : "🌐 Web Link"}
                  </span>

                  {/* Toggle button to switch between Local and URL image */}
                  <button
                    type="button"
                    className="merch-toggle-img-btn"
                    title={`Switch image to ${isLocal ? "online link" : "local image"}`}
                    onClick={(e) => toggleItemImage(item.id, e)}
                  >
                    ⇄ {isLocal ? "Link URL" : "Local SVG"}
                  </button>

                  <span className="merch-category-pill">{item.categoryLabel}</span>
                </div>

                {/* Body Details */}
                <div className="merch-card-body">
                  <div className="merch-card-title-row">
                    <h3 className="merch-card-title">{item.name}</h3>
                    <span className="merch-card-price">${item.price.toFixed(2)}</span>
                  </div>

                  <p className="merch-card-desc">{item.description}</p>

                  {/* Options: Sizes, Colors, Editions */}
                  <div className="merch-options-block">
                    {item.options.map((option) => {
                      const selectedVal = currentSelections[option.name] || option.values[0];

                      return (
                        <div className="merch-option-group" key={option.name}>
                          <div className="merch-option-label">
                            <span>{option.name}</span>
                            <span>{selectedVal}</span>
                          </div>

                          {/* Color Swatches */}
                          {option.colorCodes ? (
                            <div className="merch-color-list" role="radiogroup" aria-label={`Select ${option.name}`}>
                              {option.values.map((val) => {
                                const hex = option.colorCodes?.[val] || "#444";
                                const isActive = selectedVal === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    className={`merch-color-swatch ${isActive ? "active" : ""}`}
                                    style={{ backgroundColor: hex }}
                                    title={`${option.name}: ${val}`}
                                    aria-label={val}
                                    onClick={() => handleOptionChange(item.id, option.name, val)}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            /* Size / Variant Pills */
                            <div className="merch-size-list" role="radiogroup" aria-label={`Select ${option.name}`}>
                              {option.values.map((val) => {
                                const isActive = selectedVal === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    className={`merch-size-btn ${isActive ? "active" : ""}`}
                                    onClick={() => handleOptionChange(item.id, option.name, val)}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="merch-card-actions">
                    <button
                      type="button"
                      className="merch-btn-cart"
                      onClick={() => handleAddToCart(item, false)}
                    >
                      <Icon name="shopping-bag" size={14} /> Add to Cart
                    </button>
                    <button
                      type="button"
                      className="merch-btn-buy"
                      onClick={() => handleAddToCart(item, true)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Cart Drawer */}
      {isCartOpen && (
        createPortal(
        <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <div className="cart-drawer-title">
                <Icon name="shopping-bag" size={20} />
                <h2>Your Field Bag</h2>
                <span className="merch-cart-badge">{cartCount}</span>
              </div>
              <button
                type="button"
                className="cart-close-btn"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="cart-items-list">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-icon">
                    <Icon name="shopping-bag" size={26} />
                  </div>
                  <h3>Your bag is empty</h3>
                  <p>Pick outdoor tees, trail bottles, and journals to prepare for the wild.</p>
                  <button
                    type="button"
                    className="merch-btn-buy"
                    onClick={() => setIsCartOpen(false)}
                    style={{ width: "auto", padding: "10px 24px" }}
                  >
                    Explore Merchandise
                  </button>
                </div>
              ) : (
                cart.map((cartItem) => (
                  <div className="cart-item-row" key={cartItem.cartId}>
                    <img
                      src={cartItem.activeImage}
                      alt={cartItem.item.name}
                      className="cart-item-thumb"
                    />
                    <div className="cart-item-details">
                      <div className="cart-item-top">
                        <h4 className="cart-item-name">{cartItem.item.name}</h4>
                        <button
                          type="button"
                          className="cart-item-delete"
                          onClick={() => handleRemoveFromCart(cartItem.cartId)}
                          aria-label="Remove item"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>

                      {/* Display Selected Options */}
                      <div className="cart-item-options">
                        {Object.entries(cartItem.selectedOptions).map(([key, val], idx) => (
                          <span key={key}>
                            {idx > 0 && " • "}
                            {key}: {val}
                          </span>
                        ))}
                      </div>

                      <div className="cart-item-bottom">
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => handleUpdateQuantity(cartItem.cartId, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Icon name="minus" size={11} />
                          </button>
                          <span className="cart-qty-num">{cartItem.quantity}</span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => handleUpdateQuantity(cartItem.cartId, 1)}
                            aria-label="Increase quantity"
                          >
                            <Icon name="plus" size={11} />
                          </button>
                        </div>

                        <span className="cart-item-price">
                          ${(cartItem.unitPrice * cartItem.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                {/* Coupon Code Input */}
                <div className="cart-coupon-row">
                  <input
                    type="text"
                    className="cart-coupon-input"
                    placeholder="Promo code (e.g. TOUCHGRASS10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="button"
                    className="cart-coupon-btn"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </button>
                </div>

                {/* Summary Table */}
                <div className="cart-summary-table">
                  <div className="cart-summary-line">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="cart-summary-line" style={{ color: "var(--green)" }}>
                      <span>Discount ({discountPercent}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="cart-summary-line">
                    <span>Eco Trail Delivery</span>
                    <span>Free</span>
                  </div>

                  <div className="cart-summary-line total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="cart-checkout-btn"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Checkout (${total.toFixed(2)}) <Icon name="arrow" size={15} />
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body,
        )
      )}

      {/* Checkout Modal (Success payment only without needing credit card) */}
      {isCheckoutOpen && (
        createPortal(
        <div className="checkout-modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <h3>Trail Express Checkout</h3>
              <button
                type="button"
                className="cart-close-btn"
                onClick={() => setIsCheckoutOpen(false)}
                aria-label="Close checkout"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div className="checkout-modal-body">
              {/* Autofill Demo button */}
              <button
                type="button"
                className="checkout-autofill-btn"
                onClick={handleAutofillDemo}
              >
                ⚡ Autofill Demo Information
              </button>

              <div className="checkout-form-grid">
                <div className="checkout-field">
                  <label htmlFor="chk-name">Your Full Name</label>
                  <input
                    id="chk-name"
                    type="text"
                    placeholder="e.g. Alex Meadow"
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="chk-email">Email Address</label>
                  <input
                    id="chk-email"
                    type="email"
                    placeholder="alex@touchgrass.club"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout-form-grid full">
                <div className="checkout-field">
                  <label htmlFor="chk-address">Shipping / Trail Camp Address</label>
                  <input
                    id="chk-address"
                    type="text"
                    placeholder="Street, City, Postal Code, Country"
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* No Credit Card Payment Notice & Method */}
              <div className="payment-demo-box">
                <div className="payment-demo-header">
                  <Icon name="check-circle" size={18} />
                  <span>Instant Payment (No Credit Card Required)</span>
                </div>
                <p>
                  Payment processing is currently in <strong>Demo / Field Pass mode</strong>. No credit card,
                  billing info, or wire transfer is required. Your order will be confirmed immediately!
                </p>
                <div className="payment-demo-pill">
                  ✓ 100% Free Demo Checkout Active
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="receipt-items-list" style={{ marginTop: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600" }}>
                  Items in this order:
                </span>
                {cart.map((ci) => (
                  <div key={ci.cartId} className="receipt-item-row">
                    <span>
                      {ci.quantity}x {ci.item.name}
                      <span className="receipt-item-options">
                        {" (" + Object.values(ci.selectedOptions).join(", ") + ")"}
                      </span>
                    </span>
                    <span>${(ci.unitPrice * ci.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="receipt-total-row">
                  <span>Grand Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="checkout-modal-footer">
              <button
                type="button"
                className="checkout-btn-cancel"
                onClick={() => setIsCheckoutOpen(false)}
                disabled={isProcessingPayment}
              >
                Back to Bag
              </button>
              <button
                type="button"
                className="checkout-btn-pay"
                onClick={handleProcessPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>Processing Order...</>
                ) : (
                  <>
                    <Icon name="check" size={16} /> Pay & Complete Order (${total.toFixed(2)})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body,
        )
      )}

      {/* Order Confirmation / Success Receipt Modal */}
      {orderReceipt && (
        createPortal(
        <div className="checkout-modal-backdrop" onClick={() => setOrderReceipt(null)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-success-card">
              <div className="order-success-icon">
                <Icon name="check-circle" size={38} />
              </div>
              <h2>Payment Successful!</h2>
              <p>
                Thank you for supporting <em>Touch Grass Around The World</em>! Your order has been placed and confirmed without any credit card needed.
              </p>

              <div className="order-receipt-box">
                <div className="receipt-meta-row">
                  <span>
                    Order ID: <strong>{orderReceipt.orderId}</strong>
                  </span>
                  <span>{orderReceipt.date}</span>
                </div>

                <div className="receipt-meta-row">
                  <span>
                    Recipient: <strong>{orderReceipt.customerName}</strong>
                  </span>
                  <span>{orderReceipt.customerEmail}</span>
                </div>

                <div className="receipt-meta-row">
                  <span>
                    Shipping To: <strong>{orderReceipt.shippingAddress}</strong>
                  </span>
                </div>

                <div className="receipt-items-list">
                  {orderReceipt.items.map((ci) => (
                    <div key={ci.cartId} className="receipt-item-row">
                      <div>
                        <span>
                          {ci.quantity}x {ci.item.name}
                        </span>
                        <div className="receipt-item-options">
                          {Object.entries(ci.selectedOptions)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" • ")}
                        </div>
                      </div>
                      <span>${(ci.unitPrice * ci.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="receipt-total-row">
                  <span>Total Amount Paid</span>
                  <span>${orderReceipt.total.toFixed(2)}</span>
                </div>

                <div style={{ fontSize: "10px", color: "var(--green)", marginTop: "4px" }}>
                  Payment Method: {orderReceipt.paymentMethod}
                </div>
              </div>

              <button
                type="button"
                className="order-success-done-btn"
                onClick={() => setOrderReceipt(null)}
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>,
        document.body,
        )
      )}

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="merch-toast">
          <Icon name="check-circle" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
