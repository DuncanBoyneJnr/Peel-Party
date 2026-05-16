export interface ShopNavLink {
  id: string;
  label: string;
  href: string;
}

export interface ShopNavSection {
  id: string;
  title: string;
  links: ShopNavLink[];
}

export const defaultShopNavSections: ShopNavSection[] = [
  {
    id: "stickers-vinyl",
    title: "Stickers & Vinyl",
    links: [
      { id: "stickers", label: "Stickers", href: "/shop/stickers" },
      { id: "vinyl", label: "Vinyl", href: "/shop/vinyl" },
    ],
  },
  {
    id: "clothing",
    title: "Clothing",
    links: [
      { id: "tshirts", label: "T-Shirts", href: "/shop/tshirts" },
      { id: "hoodies", label: "Hoodies", href: "/shop/hoodies" },
      { id: "polos", label: "Polo Shirts", href: "/shop/polos" },
      { id: "hats", label: "Hats", href: "/shop/hats" },
    ],
  },
  {
    id: "gifts-decor",
    title: "Gifts & Decor",
    links: [
      { id: "mugs", label: "Mugs", href: "/shop/mugs" },
      { id: "keyrings", label: "Keyrings", href: "/shop/keyrings" },
      { id: "coasters", label: "Coasters", href: "/shop/coasters" },
      { id: "magnets", label: "Magnets", href: "/shop/magnets" },
      { id: "bookmarks", label: "Bookmarks", href: "/shop/bookmarks" },
      { id: "personalised-glasses", label: "Personalised Glasses", href: "/shop/personalised-glasses" },
      { id: "bows", label: "Bows", href: "/shop/bows" },
      { id: "cake-toppers", label: "Cake Toppers", href: "/shop/cake-toppers" },
      { id: "party-favours", label: "Party Favours", href: "/shop/party-favours" },
    ],
  },
];
