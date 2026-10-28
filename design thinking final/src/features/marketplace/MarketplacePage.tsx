import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { MarketplaceItem } from '../../types/database';
import { UserSession } from '../../components/AuthModal';
import { 
  Search, 
  Plus, 
  Heart, 
  MapPin, 
  Clock, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  ShoppingBag, 
  Receipt, 
  BookOpen, 
  Laptop, 
  Armchair, 
  Shirt, 
  Activity, 
  MoreHorizontal, 
  Check, 
  X, 
  Share2, 
  Tag,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface MarketplacePageProps {
  currentUser?: UserSession | null;
  onRequireAuth?: () => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ currentUser, onRequireAuth }) => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubnav, setActiveSubnav] = useState<'browse' | 'listings' | 'purchases'>('browse');

  // Filters for Browse Items
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['available', 'reserved', 'sold']);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc'>('latest');

  // Accordion collapses
  const [categoryOpen, setCategoryOpen] = useState<boolean>(true);
  const [statusOpen, setStatusOpen] = useState<boolean>(true);
  const [priceOpen, setPriceOpen] = useState<boolean>(true);

  // Wishlist state (local IDs)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Item detail modal / view
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [shareContactModal, setShareContactModal] = useState<boolean>(false);
  const [contactShared, setContactShared] = useState<boolean>(false);

  // Post new item modal
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('books');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newCondition, setNewCondition] = useState<'like_new' | 'good' | 'fair'>('good');
  const [newLocation, setNewLocation] = useState<string>('Academic Block');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');

  // Open modal or require authentication
  const handleOpenPostModal = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        alert('Please sign in to post an item on the marketplace.');
      }
      return;
    }
    setPostError(null);
    setPostSuccess(false);
    setIsPostModalOpen(true);
  };

  // Listings filter tabs
  const [listingsTab, setListingsTab] = useState<'all' | 'available' | 'reserved' | 'sold'>('all');
  // Purchases filter tabs
  const [purchasesTab, setPurchasesTab] = useState<'all' | 'active' | 'completed'>('all');

  // Fetch items from Supabase
  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching marketplace items:', error);
      } else if (data) {
        setItems(data as MarketplaceItem[]);
      }
    } catch (err) {
      console.error('Marketplace fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filtered browse items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'books' && item.category !== 'books') return false;
        if (selectedCategory === 'electronics' && item.category !== 'electronics') return false;
        if (selectedCategory === 'furniture' && item.category !== 'furniture') return false;
        if (selectedCategory === 'clothing' && item.category !== 'clothing') return false;
        if (selectedCategory === 'sports' && item.category !== 'sports') return false;
        if (selectedCategory === 'miscellaneous' && !['books', 'electronics', 'furniture', 'clothing', 'sports'].includes(item.category)) return false;
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(item.status)) {
        return false;
      }

      // Price filter
      const priceNum = item.price;
      if (minPrice && priceNum < parseFloat(minPrice)) return false;
      if (maxPrice && priceNum > parseFloat(maxPrice)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        const matchesLoc = (item.meeting_location || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLoc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [items, selectedCategory, selectedStatuses, minPrice, maxPrice, searchQuery, sortBy]);

  // User's own listings
  const myListings = useMemo(() => {
    if (!currentUser) return [];
    return items.filter(i => i.seller_id === currentUser.id);
  }, [items, currentUser]);

  // Wishlist toggle
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle status checkbox
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  };

  // Format currency
  const formatPrice = (price: number) => {
    return '₹' + Number(price).toLocaleString('en-IN');
  };

  // Mark item as sold
  const handleMarkAsSold = async (id: string) => {
    const itemToMark = items.find(i => i.id === id);
    if (!itemToMark) return;

    // Check authorization: Must be owner or Head Admin
    const isOwner = currentUser && (itemToMark.seller_id === currentUser.id);
    const isHeadAdmin = currentUser?.role === 'head_admin';
    if (!isOwner && !isHeadAdmin) {
      alert('You can only mark your own listings as sold.');
      return;
    }

    const { error } = await supabase
      .from('marketplace_items')
      .update({ status: 'sold' })
      .eq('id', id);

    if (!error) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'sold' } : item));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status: 'sold' } : null);
      }
    }
  };

  // Admin moderation: Delete or remove inappropriate listing
  const handleDeleteListing = async (id: string, title: string) => {
    const itemToDelete = items.find(i => i.id === id);
    const isOwner = currentUser && (itemToDelete?.seller_id === currentUser.id);
    const isHeadAdmin = currentUser?.role === 'head_admin';

    if (!isOwner && !isHeadAdmin) {
      alert('Only the owner or Head Administrator can remove this listing.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently remove "${title}" from the marketplace?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err: any) {
      console.error('Delete listing error:', err);
      alert(err.message || 'Failed to remove listing.');
    }
  };

  // Post listing submit
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    try {
      setIsSubmittingPost(true);
      setPostError(null);

      const parsedPrice = parseFloat(newPrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setPostError('Please enter a valid positive price greater than ₹0.');
        setIsSubmittingPost(false);
        return;
      }

      const newItem = {
        title: newTitle.trim(),
        category: newCategory,
        price: parsedPrice,
        condition: newCondition,
        meeting_location: newLocation,
        description: newDescription.trim() || 'No description provided.',
        photo_urls: [newPhotoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
        status: 'available',
        views_count: 1,
        seller_id: currentUser.id,
        seller_name: currentUser.name,
        seller_phone: currentUser.department || 'Student Seller',
      };

      const { data, error } = await supabase
        .from('marketplace_items')
        .insert([newItem])
        .select();

      if (error) {
        setPostError(error.message || 'Failed to list item on marketplace.');
      } else if (data && data.length > 0) {
        setItems(prev => [data[0] as MarketplaceItem, ...prev]);
        setPostSuccess(true);
        setTimeout(() => {
          setIsPostModalOpen(false);
          setPostSuccess(false);
          setNewTitle('');
          setNewPrice('');
          setNewDescription('');
        }, 1200);
      }
    } catch (err: any) {
      setPostError(err.message || 'Network error while publishing listing.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Static mock purchases matching screenshot
  const mockPurchases = [
    {
      id: 'purch-1',
      title: 'Study Lamp (Warm LED)',
      price: 450,
      status: 'active',
      location: 'Hostel Block C',
      date: '28 Sep 2026',
      photo: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'purch-2',
      title: 'Calculator (Casio FX-991)',
      price: 800,
      status: 'completed',
      location: 'Academic Block',
      date: '10 Sep 2026',
      photo: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'purch-3',
      title: 'Lab Coat',
      price: 600,
      status: 'completed',
      location: 'Main Campus Store',
      date: '25 Aug 2026',
      photo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const filteredPurchases = useMemo(() => {
    if (purchasesTab === 'all') return mockPurchases;
    return mockPurchases.filter(p => p.status === purchasesTab);
  }, [purchasesTab]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Marketplace Title */}
          <div>
            <h1 className="font-display text-3xl font-black text-charcoal tracking-tight uppercase">
              Marketplace
            </h1>
          </div>

          {/* Sub-Navigation Buttons */}
          <div className="space-y-1.5">
            <button
              onClick={() => { setActiveSubnav('browse'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                activeSubnav === 'browse'
                  ? 'bg-[#EAF4EE] text-[#155137] font-semibold'
                  : 'text-charcoal hover:bg-black/5'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Browse Items</span>
            </button>

            <button
              onClick={() => { setActiveSubnav('listings'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                activeSubnav === 'listings'
                  ? 'bg-[#EAF4EE] text-[#155137] font-semibold'
                  : 'text-charcoal hover:bg-black/5'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Listings</span>
            </button>

            <button
              onClick={() => { setActiveSubnav('purchases'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                activeSubnav === 'purchases'
                  ? 'bg-[#EAF4EE] text-[#155137] font-semibold'
                  : 'text-charcoal hover:bg-black/5'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>My Purchases</span>
            </button>
          </div>

          {/* Filters only show when activeSubnav is 'browse' */}
          {activeSubnav === 'browse' && (
            <div className="space-y-6 pt-2">
              
              {/* Category Filter */}
              <div className="border-t border-black/10 pt-4">
                <button
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="w-full flex items-center justify-between font-bold text-sm text-charcoal mb-2"
                >
                  <span>Category</span>
                  {categoryOpen ? <ChevronUp className="w-4 h-4 text-charcoal-muted" /> : <ChevronDown className="w-4 h-4 text-charcoal-muted" />}
                </button>

                {categoryOpen && (
                  <div className="space-y-1 mt-2">
                    {[
                      { id: 'all', label: 'All Categories', icon: Tag },
                      { id: 'books', label: 'Books & Study Material', icon: BookOpen },
                      { id: 'electronics', label: 'Electronics', icon: Laptop },
                      { id: 'furniture', label: 'Furniture & Room Essentials', icon: Armchair },
                      { id: 'clothing', label: 'Clothing & Accessories', icon: Shirt },
                      { id: 'sports', label: 'Sports & Fitness', icon: Activity },
                      { id: 'miscellaneous', label: 'Miscellaneous', icon: MoreHorizontal },
                    ].map(cat => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                            isSelected
                              ? 'bg-[#EAF4EE] text-[#155137] font-semibold'
                              : 'text-charcoal hover:bg-black/5'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Item Status Filter */}
              <div className="border-t border-black/10 pt-4">
                <button
                  onClick={() => setStatusOpen(!statusOpen)}
                  className="w-full flex items-center justify-between font-bold text-sm text-charcoal mb-2"
                >
                  <span>Item Status</span>
                  {statusOpen ? <ChevronUp className="w-4 h-4 text-charcoal-muted" /> : <ChevronDown className="w-4 h-4 text-charcoal-muted" />}
                </button>

                {statusOpen && (
                  <div className="space-y-2.5 mt-3 text-xs">
                    {[
                      { id: 'available', label: 'Available', count: items.filter(i => i.status === 'available').length || 42 },
                      { id: 'reserved', label: 'Reserved', count: items.filter(i => i.status === 'reserved').length || 8 },
                      { id: 'sold', label: 'Sold', count: items.filter(i => i.status === 'sold').length || 15 },
                    ].map(st => {
                      const checked = selectedStatuses.includes(st.id);
                      return (
                        <label
                          key={st.id}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleStatusFilter(st.id)}
                              className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest accent-[#155137]"
                            />
                            <span className="text-charcoal font-medium group-hover:text-forest transition-colors">
                              {st.label}
                            </span>
                          </div>
                          <span className="text-charcoal-muted font-mono text-[11px] bg-black/5 px-2 py-0.5 rounded-full">
                            {st.count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="border-t border-black/10 pt-4">
                <button
                  onClick={() => setPriceOpen(!priceOpen)}
                  className="w-full flex items-center justify-between font-bold text-sm text-charcoal mb-2"
                >
                  <span>Price Range</span>
                  {priceOpen ? <ChevronUp className="w-4 h-4 text-charcoal-muted" /> : <ChevronDown className="w-4 h-4 text-charcoal-muted" />}
                </button>

                {priceOpen && (
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs placeholder:text-charcoal-muted/60 focus:outline-none focus:border-forest"
                    />
                    <span className="text-charcoal-muted text-xs">-</span>
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs placeholder:text-charcoal-muted/60 focus:outline-none focus:border-forest"
                    />
                  </div>
                )}
              </div>

            </div>
          )}
        </aside>

        {/* ================= RIGHT MAIN CONTENT ================= */}
        <div className="lg:col-span-9 space-y-6">

          {/* VIEW 1: BROWSE ITEMS */}
          {activeSubnav === 'browse' && !selectedItem && (
            <div className="space-y-6">
              
              {/* Header Banner matching 6) Marketplace.jpeg top-left */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold tracking-widest text-[#155137] uppercase">
                      CAMPUS MARKETPLACE •
                    </span>
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl font-black text-charcoal tracking-tight">
                    Buy. <span className="text-[#3D775F]">Sell.</span> Share.
                  </h2>
                  <p className="text-sm text-charcoal-muted mt-1">
                    Give your unused items a new home within the campus community.
                  </p>
                </div>

                <button
                  onClick={handleOpenPostModal}
                  className="inline-flex items-center justify-center gap-2 bg-[#155137] hover:bg-[#103E2A] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post an Item</span>
                </button>
              </div>

              {/* Search & Sort Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for books, gadgets, furniture, etc..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm placeholder:text-charcoal-muted/70 focus:outline-none focus:border-forest shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="relative shrink-0 w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white border border-black/10 rounded-xl text-sm font-medium text-charcoal focus:outline-none focus:border-forest shadow-2xs cursor-pointer"
                  >
                    <option value="latest">Latest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none" />
                </div>
              </div>

              {/* 3-Column Product Cards Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-black/5 overflow-hidden animate-pulse h-80" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-black/5 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-charcoal-muted/50 mx-auto" />
                  <h3 className="font-bold text-lg text-charcoal">No items match your criteria</h3>
                  <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                    Try loosening your search keywords, price range, or categories to explore other available campus items.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems.map(item => {
                    const isWishlisted = wishlist.has(item.id);
                    const photo = item.photo_urls && item.photo_urls[0] 
                      ? item.photo_urls[0] 
                      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

                    return (
                      <div
                        key={item.id}
                        onClick={() => { setSelectedItem(item); setCurrentPhotoIndex(0); setContactShared(false); }}
                        className="group bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs hover:shadow-md hover:border-black/10 transition-all cursor-pointer flex flex-col"
                      >
                        {/* Image Container with Badges */}
                        <div className="relative aspect-4/3 w-full bg-[#EAE8E3] overflow-hidden">
                          <img
                            src={photo}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          />
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 left-3">
                            {item.status === 'available' && (
                              <span className="bg-[#E6F4EA] text-[#137333] text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-2xs">
                                Available
                              </span>
                            )}
                            {item.status === 'reserved' && (
                              <span className="bg-[#E8F0FE] text-[#1967D2] text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-2xs">
                                Reserved
                              </span>
                            )}
                            {item.status === 'sold' && (
                              <span className="bg-[#FCE8E6] text-[#C5221F] text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-2xs">
                                Sold
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => toggleWishlist(item.id, e)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-charcoal shadow-2xs transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-charcoal'}`} />
                          </button>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h3 className="font-bold text-sm text-charcoal line-clamp-2 group-hover:text-forest transition-colors">
                              {item.title}
                            </h3>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-black text-base text-charcoal">
                                {formatPrice(item.price)}
                              </span>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EDF5F0] text-[#155137] capitalize">
                                {item.condition.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs text-charcoal-muted">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-charcoal-muted/70" />
                              <span className="truncate">{item.meeting_location}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Clock className="w-3.5 h-3.5 text-charcoal-muted/70" />
                              <span>{formatRelativeTime(item.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: ITEM DETAILS VIEW (Matching 6) Marketplace.jpeg bottom-left) */}
          {activeSubnav === 'browse' && selectedItem && (
            <div className="space-y-6">
              
              {/* Breadcrumbs Navigation */}
              <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="hover:text-charcoal font-medium flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Marketplace</span>
                </button>
                <span>&gt;</span>
                <span className="capitalize">{selectedItem.category}</span>
                <span>&gt;</span>
                <span className="text-charcoal font-semibold">Item Details</span>
              </div>

              {/* Main Product Detail Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-2xs">
                
                {/* Image Gallery Column (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="relative aspect-4/3 w-full bg-[#EAE8E3] rounded-2xl overflow-hidden shadow-inner">
                    <img
                      src={
                        selectedItem.photo_urls && selectedItem.photo_urls[currentPhotoIndex]
                          ? selectedItem.photo_urls[currentPhotoIndex]
                          : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />

                    {selectedItem.photo_urls && selectedItem.photo_urls.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentPhotoIndex(prev => (prev > 0 ? prev - 1 : selectedItem.photo_urls.length - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPhotoIndex(prev => (prev < selectedItem.photo_urls.length - 1 ? prev + 1 : 0))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {selectedItem.photo_urls && selectedItem.photo_urls.length > 1 && (
                    <div className="grid grid-cols-3 gap-3">
                      {selectedItem.photo_urls.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            currentPhotoIndex === idx ? 'border-[#155137] scale-98' : 'border-transparent opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Specs and Description Column (4 cols) */}
                <div className="lg:col-span-4 space-y-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-bold text-xl sm:text-2xl text-charcoal">
                        {selectedItem.title}
                      </h2>
                      <button
                        onClick={(e) => toggleWishlist(selectedItem.id, e)}
                        className="p-2 rounded-full hover:bg-black/5 text-charcoal shrink-0"
                      >
                        <Heart className={`w-5 h-5 ${wishlist.has(selectedItem.id) ? 'fill-red-500 text-red-500' : 'text-charcoal'}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <span className="font-black text-2xl text-[#155137]">
                        {formatPrice(selectedItem.price)}
                      </span>
                      {selectedItem.status === 'available' && (
                        <span className="bg-[#E6F4EA] text-[#137333] text-xs font-semibold px-2.5 py-1 rounded-md">
                          Available
                        </span>
                      )}
                      {selectedItem.status === 'reserved' && (
                        <span className="bg-[#E8F0FE] text-[#1967D2] text-xs font-semibold px-2.5 py-1 rounded-md">
                          Reserved
                        </span>
                      )}
                      {selectedItem.status === 'sold' && (
                        <span className="bg-[#FCE8E6] text-[#C5221F] text-xs font-semibold px-2.5 py-1 rounded-md">
                          Sold
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-charcoal-muted border-y border-black/5 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-forest shrink-0" />
                      <span>{selectedItem.meeting_location}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Posted {formatRelativeTime(selectedItem.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 shrink-0" />
                        <span>{selectedItem.views_count || 56} views</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal mb-1.5">
                      Description
                    </h4>
                    <p className="text-sm text-charcoal-muted leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>

                  {/* Attributes Table */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 text-xs">
                    <div>
                      <span className="block text-charcoal-muted text-[11px]">Category</span>
                      <span className="font-semibold text-charcoal capitalize">{selectedItem.category}</span>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted text-[11px]">Condition</span>
                      <span className="font-semibold text-charcoal capitalize">{selectedItem.condition.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted text-[11px]">Meeting Location</span>
                      <span className="font-semibold text-charcoal">{selectedItem.meeting_location}</span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Contact Seller (3 cols) */}
                <div className="lg:col-span-3">
                  <div className="bg-[#FBF9F5] p-5 rounded-2xl border border-black/5 space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-charcoal">
                        Contact Seller
                      </h3>
                      <p className="font-semibold text-xs text-charcoal mt-2">
                        Interested in this item?
                      </p>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        Tap below to share your contact directly with the seller.
                      </p>
                    </div>

                    {contactShared ? (
                      <div className="bg-[#E6F4EA] border border-[#34A853]/20 rounded-xl p-3 text-center space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#137333]">
                          <Check className="w-4 h-4" />
                          <span>Contact Shared!</span>
                        </div>
                        <p className="text-[11px] text-[#137333]/80">
                          The seller has been notified and can call or message you.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            if (onRequireAuth) onRequireAuth();
                            else alert('Please sign in to contact the seller.');
                            return;
                          }
                          setShareContactModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#155137] hover:bg-[#103E2A] text-white py-3 rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Share Contact</span>
                      </button>
                    )}

                    <p className="text-[11px] text-charcoal-muted/80 leading-relaxed italic border-t border-black/5 pt-3">
                      Your phone number will be shared with the seller. You can then discuss directly about the item.
                    </p>

                    {/* Owner or Admin Moderation Controls */}
                    {(currentUser?.role === 'head_admin' || (currentUser && selectedItem.seller_id === currentUser.id)) && (
                      <div className="pt-3 border-t border-black/10 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
                          {currentUser?.role === 'head_admin' ? 'Head Admin Moderation' : 'Your Listing Controls'}
                        </span>
                        <div className="flex flex-col gap-2">
                          {selectedItem.status !== 'sold' && (
                            <button
                              onClick={() => handleMarkAsSold(selectedItem.id)}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                              Mark as Sold
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteListing(selectedItem.id, selectedItem.title)}
                            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                          >
                            {currentUser?.role === 'head_admin' ? 'Remove Listing (Admin Delete)' : 'Delete Listing'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 3: MY LISTINGS (Matching 6) Marketplace.jpeg top-right) */}
          {activeSubnav === 'listings' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-4xl font-black text-charcoal tracking-tight">
                    My Listings
                  </h2>
                  <p className="text-sm text-charcoal-muted mt-1">
                    Manage your posted items and update their status.
                  </p>
                </div>

                <button
                  onClick={handleOpenPostModal}
                  className="inline-flex items-center justify-center gap-2 bg-[#155137] hover:bg-[#103E2A] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post an Item</span>
                </button>
              </div>

              {!currentUser ? (
                <div className="bg-[#FAF8F5] border border-black/10 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EAF4EE] text-[#155137] flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-charcoal">Sign In Required</h4>
                  <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                    Please sign in with your student or campus account to view and manage your posted marketplace listings, update prices, or mark items as sold.
                  </p>
                  <button
                    onClick={onRequireAuth}
                    className="px-5 py-2.5 rounded-xl bg-[#155137] hover:bg-[#103E2A] text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    Sign In to View Listings
                  </button>
                </div>
              ) : myListings.length === 0 ? (
                <div className="bg-[#FAF8F5] border border-black/10 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-black/5 text-charcoal-muted flex items-center justify-center mx-auto">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-charcoal">No Listings Posted Yet</h4>
                  <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                    You haven't listed any items for sale under your student account yet.
                  </p>
                  <button
                    onClick={handleOpenPostModal}
                    className="px-5 py-2.5 rounded-xl bg-[#155137] hover:bg-[#103E2A] text-white font-semibold text-xs transition-colors shadow-2xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post an Item</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Status Tab Pills */}
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'all', label: 'All', count: myListings.length },
                      { id: 'available', label: 'Available', count: myListings.filter(i => i.status === 'available').length },
                      { id: 'reserved', label: 'Reserved', count: myListings.filter(i => i.status === 'reserved').length },
                      { id: 'sold', label: 'Sold', count: myListings.filter(i => i.status === 'sold').length },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setListingsTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          listingsTab === tab.id
                            ? 'bg-[#155137] text-white shadow-2xs'
                            : 'bg-black/5 hover:bg-black/10 text-charcoal'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${listingsTab === tab.id ? 'bg-white/20' : 'bg-black/5'}`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Listings Rows */}
                  <div className="space-y-4">
                    {myListings
                      .filter(i => listingsTab === 'all' || i.status === listingsTab)
                      .map(item => {
                        const photo = item.photo_urls && item.photo_urls[0] ? item.photo_urls[0] : '';
                        return (
                          <div
                            key={item.id}
                            className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={photo}
                                alt={item.title}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-gray-100 shrink-0"
                              />
                              <div className="space-y-1">
                                <h4 className="font-bold text-sm sm:text-base text-charcoal">
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-sm text-[#155137]">
                                    {formatPrice(item.price)}
                                  </span>
                                  {item.status === 'available' && (
                                    <span className="bg-[#E6F4EA] text-[#137333] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                      Available
                                    </span>
                                  )}
                                  {item.status === 'reserved' && (
                                    <span className="bg-[#E8F0FE] text-[#1967D2] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                      Reserved
                                    </span>
                                  )}
                                  {item.status === 'sold' && (
                                    <span className="bg-[#FCE8E6] text-[#C5221F] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                      Sold
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-charcoal-muted pt-1">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" />
                                    {item.views_count || 34}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {item.meeting_location}
                                  </span>
                                  <span>Posted {formatRelativeTime(item.created_at)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action buttons matching screenshot */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => { setSelectedItem(item); setActiveSubnav('browse'); }}
                                className="px-3.5 py-1.5 rounded-lg border border-black/15 text-xs font-semibold text-charcoal hover:bg-black/5 transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              {item.status !== 'sold' ? (
                                <button
                                  onClick={() => handleMarkAsSold(item.id)}
                                  className="px-3.5 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  Mark as Sold
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-400 cursor-not-allowed"
                                >
                                  Mark as Sold
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* VIEW 4: MY PURCHASES (Matching 6) Marketplace.jpeg bottom-right) */}
          {activeSubnav === 'purchases' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div>
                <h2 className="font-display text-4xl font-black text-charcoal tracking-tight">
                  My Purchases
                </h2>
                <p className="text-sm text-charcoal-muted mt-1">
                  View the items you have bought and their status.
                </p>
              </div>

              {/* Status Tab Pills */}
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'All', count: mockPurchases.length },
                  { id: 'active', label: 'Active', count: mockPurchases.filter(p => p.status === 'active').length },
                  { id: 'completed', label: 'Completed', count: mockPurchases.filter(p => p.status === 'completed').length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setPurchasesTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      purchasesTab === tab.id
                        ? 'bg-[#155137] text-white shadow-2xs'
                        : 'bg-black/5 hover:bg-black/10 text-charcoal'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${purchasesTab === tab.id ? 'bg-white/20' : 'bg-black/5'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Purchases Rows */}
              <div className="space-y-4">
                {filteredPurchases.map(purchase => (
                  <div
                    key={purchase.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={purchase.photo}
                        alt={purchase.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-gray-100 shrink-0"
                      />
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm sm:text-base text-charcoal">
                          {purchase.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#155137]">
                            {formatPrice(purchase.price)}
                          </span>
                          {purchase.status === 'active' ? (
                            <span className="bg-[#E8F0FE] text-[#1967D2] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              Active
                            </span>
                          ) : (
                            <span className="bg-[#E6F4EA] text-[#137333] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-charcoal-muted pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {purchase.location}
                          </span>
                          <span>Bought on {purchase.date}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Purchase Details:\nItem: ${purchase.title}\nPrice: ₹${purchase.price}\nLocation: ${purchase.location}\nDate: ${purchase.date}`)}
                      className="px-4 py-2 rounded-xl border border-black/15 text-xs font-semibold text-charcoal hover:bg-black/5 transition-colors self-end sm:self-center"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL: SHARE CONTACT MODAL ================= */}
      {shareContactModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-charcoal">
                  Share Your Contact
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Direct peer exchange for "{selectedItem.title}"
                </p>
              </div>
              <button
                onClick={() => setShareContactModal(false)}
                className="p-1 rounded-full hover:bg-black/5 text-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-black/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Your Name:</span>
                <span className="font-semibold text-charcoal">Nilotpal (Student)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Phone Number:</span>
                <span className="font-semibold text-charcoal">+91 98765 43210</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Meeting Location:</span>
                <span className="font-semibold text-forest">{selectedItem.meeting_location}</span>
              </div>
            </div>

            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              By confirming, the seller will receive your phone number to coordinate item inspection and handover. No payment is processed through this app.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShareContactModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-black/15 font-semibold text-xs text-charcoal hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setContactShared(true);
                  setShareContactModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#155137] hover:bg-[#103E2A] text-white font-semibold text-xs shadow-sm transition-all"
              >
                Confirm &amp; Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: POST AN ITEM ================= */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/10 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl text-charcoal">
                  Post an Item for Sale
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  List items for fellow students and faculty on campus.
                </p>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              {postError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{postError}</span>
                </div>
              )}

              {postSuccess && (
                <div className="bg-[#E6F4EA] border border-[#34A853]/30 text-[#137333] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-[#137333]" />
                  <span>✓ Listing successfully published to JainSpace Marketplace!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering Mathematics Volume 2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
                  >
                    <option value="books">Books &amp; Study Material</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture &amp; Room</option>
                    <option value="clothing">Clothing &amp; Accessories</option>
                    <option value="sports">Sports &amp; Fitness</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 450"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-sm focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Condition
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
                  >
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Meeting Location
                  </label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
                  >
                    <option value="Academic Block">Academic Block</option>
                    <option value="Hostel Block A">Hostel Block A</option>
                    <option value="Hostel Block B">Hostel Block B</option>
                    <option value="Hostel Block C">Hostel Block C</option>
                    <option value="Central Library">Central Library</option>
                    <option value="Sports Complex">Sports Complex</option>
                    <option value="Cafeteria">Cafeteria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detail the condition, inclusions, and why you are parting with it..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 font-semibold text-xs text-charcoal hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost || postSuccess}
                  className="flex-1 py-2.5 rounded-xl bg-[#155137] hover:bg-[#103E2A] disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingPost && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingPost ? 'Publishing...' : postSuccess ? 'Listing Published!' : 'Publish Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
