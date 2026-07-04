import React, { useState, useEffect } from 'react';
import { Room, Booking, SMSLog, SyncLog, SEOState, DomainCheckResult } from '../types';
import { 
  Bed, DollarSign, Calendar, MessageSquare, RefreshCw, Globe, 
  Search, Mail, Smartphone, Facebook, Eye, Plus, Trash, Check, X,
  ExternalLink, MapPin, Star, Settings, Award, ShieldAlert, Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PMSSimulatorProps {
  rooms: Room[];
  bookings: Booking[];
  smsLogs: SMSLog[];
  syncLogs: SyncLog[];
  seoState: SEOState;
  onUpdateRooms: (rooms: Room[]) => void;
  onUpdateBookings: (bookings: Booking[]) => void;
  onUpdateSMSLogs: (logs: SMSLog[]) => void;
  onUpdateSyncLogs: (logs: SyncLog[]) => void;
  onUpdateSEO: (seo: SEOState) => void;
}

export default function PMSSimulator({
  rooms,
  bookings,
  smsLogs,
  syncLogs,
  seoState,
  onUpdateRooms,
  onUpdateBookings,
  onUpdateSMSLogs,
  onUpdateSyncLogs,
  onUpdateSEO
}: PMSSimulatorProps) {
  // Navigation tabs within Simulator
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'ota' | 'sms' | 'seo' | 'domain'>('rooms');

  // Interactive Room States
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('Standard Double');
  const [newRoomPrice, setNewRoomPrice] = useState(150);
  const [newRoomCapacity, setNewRoomCapacity] = useState(2);

  // SMS Settings
  const [smsTemplate, setSmsTemplate] = useState('გამარჯობა {სახელი}, სასტუმრო საზანო გიდასტურებთ ჯავშანს ნომერზე [{ოთახი}] პერიოდში {თარიღი}. ველოდებით თქვენს სტუმრობას!');
  const [selectedSMSProvider, setSelectedSMSProvider] = useState<'smsoffice' | 'magti' | 'silknet'>('smsoffice');

  // Domain search
  const [domainSearchQuery, setDomainSearchQuery] = useState('ethnosazanohotel');
  const [domainResults, setDomainResults] = useState<DomainCheckResult[]>([]);
  const [isSearchingDomain, setIsSearchingDomain] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'Idle' | 'Syncing' | 'Success'>('Idle');

  // SEO states
  const [seoTitle, setSeoTitle] = useState(seoState.title);
  const [seoDesc, setSeoDesc] = useState(seoState.description);
  const [seoKeywords, setSeoKeywords] = useState(seoState.keywords);

  // Google Business state
  const [gBusinessName, setGBusinessName] = useState(seoState.googleBusinessName);
  const [gBusinessLocation, setGBusinessLocation] = useState(seoState.googleBusinessLocation);
  const [gBusinessRating, setGBusinessRating] = useState(seoState.googleBusinessRating);
  const [gBusinessReviews, setGBusinessReviews] = useState(seoState.googleBusinessReviews);

  // Trigger simulated Booking events
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Run initial domain search on mount
  useEffect(() => {
    handleDomainSearch();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Room Control functions
  const handlePriceChange = (roomId: string, price: number) => {
    const updated = rooms.map(r => r.id === roomId ? { ...r, price: Math.max(0, price) } : r);
    onUpdateRooms(updated);
    addSyncLog('Direct', `ფასი განახლდა ოთახისთვის: ${rooms.find(r => r.id === roomId)?.name} (ახალი ფასი: ₾${price})`, 'Outbound');
  };

  const handleStatusChange = (roomId: string, status: 'Available' | 'Occupied' | 'Maintenance') => {
    const updated = rooms.map(r => r.id === roomId ? { ...r, status } : r);
    onUpdateRooms(updated);
    addSyncLog('Direct', `ოთახის სტატუსი შეიცვალა: ${rooms.find(r => r.id === roomId)?.name} -> ${status}`, 'Outbound');
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName) return;

    const newRoom: Room = {
      id: 'r_' + Date.now(),
      name: newRoomName,
      type: newRoomType,
      price: Number(newRoomPrice),
      capacity: Number(newRoomCapacity),
      status: 'Available',
      amenities: ['კონდიციონერი', 'Wi-Fi', 'საკაბელო ტელევიზია', 'ჰიგიენური საშუალებები', 'საუზმე შედის'],
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'
    };

    onUpdateRooms([...rooms, newRoom]);
    setIsAddingRoom(false);
    setNewRoomName('');
    addSyncLog('Direct', `ახალი ოთახი დაემატა: ${newRoom.name}`, 'Outbound');
    triggerToast(`ოთახი "${newRoom.name}" წარმატებით დაემატა!`);
  };

  const handleDeleteRoom = (id: string) => {
    const roomName = rooms.find(r => r.id === id)?.name || '';
    if (window.confirm(`დარწმუნებული ხართ, რომ გსურთ ოთახის წაშლა: ${roomName}?`)) {
      onUpdateRooms(rooms.filter(r => r.id !== id));
      addSyncLog('Direct', `ოთახი წაიშალა: ${roomName}`, 'Outbound');
      triggerToast(`ოთახი "${roomName}" წაიშალა.`);
    }
  };

  // 2. Booking controls
  const handleBookingStatus = (bookingId: string, status: 'Approved' | 'Declined') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const updated = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
    onUpdateBookings(updated);

    if (status === 'Approved') {
      // Auto generate and log SMS notification
      const customMessage = smsTemplate
        .replace('{სახელი}', booking.guestName)
        .replace('{ოთახი}', booking.roomName)
        .replace('{თარიღი}', `${booking.checkIn} - ${booking.checkOut}`);

      const newSms: SMSLog = {
        id: 's_' + Date.now(),
        recipient: booking.guestPhone,
        message: customMessage,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Delivered'
      };

      onUpdateSMSLogs([newSms, ...smsLogs]);
      addSyncLog('Direct', `ჯავშანი დადასტურდა და SMS გაიგზავნა სტუმართან: ${booking.guestName}`, 'Outbound');
      triggerToast(`ჯავშანი დადასტურდა! SMS გაიგზავნა ნომერზე: ${booking.guestPhone}`);
    } else {
      addSyncLog('Direct', `ჯავშანი უარყოფილია: ${booking.guestName}`, 'Outbound');
      triggerToast(`ჯავშანი გაუქმდა.`);
    }
  };

  // Simulate incoming Booking request
  const simulateIncomingBooking = () => {
    const names = ['მარიამ კობახიძე', 'ირაკლი გელაშვილი', 'ლაშა ჯანელიძე', 'ეკატერინე თევზაძე', 'დავით ჩხეიძე'];
    const phones = ['+995 595 11 22 33', '+995 551 44 55 66', '+995 599 88 77 99', '+995 577 33 22 11', '+995 555 90 90 90'];
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)] || { name: 'საზანო შატო ლუქსი', price: 180 };
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomPhone = phones[Math.floor(Math.random() * phones.length)];
    const days = Math.floor(Math.random() * 4) + 1;
    
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 10) + 1);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + days);

    const checkInStr = checkInDate.toISOString().substring(0, 10);
    const checkOutStr = checkOutDate.toISOString().substring(0, 10);

    const newBooking: Booking = {
      id: 'b_' + Date.now(),
      guestName: randomName,
      guestPhone: randomPhone,
      roomName: randomRoom.name,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      totalPrice: randomRoom.price * days,
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onUpdateBookings([newBooking, ...bookings]);
    addSyncLog('Direct', `ახალი პირდაპირი ჯავშნის მოთხოვნა საიტიდან: ${randomName} (${randomRoom.name})`, 'Inbound');
    triggerToast(`შემოვიდა ახალი ჯავშნის მოთხოვნა! სტუმარი: ${randomName}`);
  };

  // Helper to add sync log
  const addSyncLog = (platform: SyncLog['platform'], event: string, type: SyncLog['type']) => {
    const newLog: SyncLog = {
      id: 'sy_' + Date.now(),
      platform,
      event,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type
    };
    onUpdateSyncLogs([newLog, ...syncLogs]);
  };

  // 3. OTA Sync Simulator
  const handleFullSync = () => {
    setIsSyncing(true);
    setSyncStatus('Syncing');
    addSyncLog('Booking.com', 'ორმხრივი სინქრონიზაციის პროცესი დაიწყო...', 'Outbound');
    
    setTimeout(() => {
      // Change occupied/available statuses or prices
      addSyncLog('Booking.com', 'ფასები და ხელმისაწვდომობა წარმატებით ექსპორტირდა iCal/XML-ით', 'Outbound');
      addSyncLog('Airbnb', 'ახალი კალენდარული მონაცემები წარმატებით იმპორტირდა', 'Inbound');
      setIsSyncing(false);
      setSyncStatus('Success');
      triggerToast('სინქრონიზაცია Booking.com-თან და Airbnb-სთან წარმატებით განხორციელდა!');
    }, 1500);
  };

  // 4. Domain check simulator
  const handleDomainSearch = () => {
    if (!domainSearchQuery) return;
    setIsSearchingDomain(true);
    
    setTimeout(() => {
      const q = domainSearchQuery.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
      const results: DomainCheckResult[] = [];
      
      if (q === 'ethnosazanohotel') {
        results.push(
          {
            domainName: 'ethnosazanohotel.ge',
            isAvailable: true,
            price: 50,
            provider: 'Registration.ge',
            suffix: '.ge'
          },
          {
            domainName: 'ethnosazanohotel.com',
            isAvailable: true,
            price: 50,
            provider: 'Proservice.ge',
            suffix: '.com'
          },
          {
            domainName: 'hotelethnosazanohotel.ge',
            isAvailable: true,
            price: 50,
            provider: 'Registration.ge',
            suffix: '.ge'
          },
          {
            domainName: 'ethnosazanohotelresort.ge',
            isAvailable: true,
            price: 50,
            provider: 'Registration.ge',
            suffix: '.ge'
          }
        );
      } else if (q === 'esh') {
        results.push(
          {
            domainName: 'esh.ge',
            isAvailable: true,
            price: 50,
            provider: 'Registration.ge',
            suffix: '.ge'
          },
          {
            domainName: 'esh.com',
            isAvailable: true,
            price: 50,
            provider: 'Proservice.ge',
            suffix: '.com'
          },
          {
            domainName: 'hotelesh.ge',
            isAvailable: true,
            price: 50,
            provider: 'Registration.ge',
            suffix: '.ge'
          },
          {
            domainName: 'eshresort.ge',
            isAvailable: true,
            price: 50,
            provider: 'Registration.ge',
            suffix: '.ge'
          }
        );
      } else {
        results.push(
          {
            domainName: `${q}.ge`,
            isAvailable: !['sazano', 'hotel', 'resort'].includes(q),
            price: 50,
            provider: 'Registration.ge',
            suffix: '.ge'
          },
          {
            domainName: `hotel${q}.ge`,
            isAvailable: true,
            price: 50,
            provider: 'Registration.ge',
            suffix: '.ge'
          },
          {
            domainName: `${q}resort.ge`,
            isAvailable: true,
            price: 50,
            provider: 'Registration.ge',
            suffix: '.ge'
          },
          {
            domainName: `${q}.com`,
            isAvailable: true,
            price: 50,
            provider: 'Proservice.ge',
            suffix: '.com'
          }
        );
      }
      setDomainResults(results);
      setIsSearchingDomain(false);
    }, 800);
  };

  // 5. Update SEO and Google Business States
  const saveSEOSettings = () => {
    onUpdateSEO({
      title: seoTitle,
      description: seoDesc,
      keywords: seoKeywords,
      googleBusinessName: gBusinessName,
      googleBusinessRating: gBusinessRating,
      googleBusinessReviews: gBusinessReviews,
      googleBusinessLocation: gBusinessLocation
    });
    triggerToast('SEO და Google Business პარამეტრები წარმატებით განახლდა!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-sazano-wine text-white border border-sazano-wine/40 px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 z-40 fixed top-6 right-6"
          >
            <Sparkles className="w-4 h-4 text-sazano-gold animate-bounce" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Admin Dashboard Wrapper */}
      <div className="bg-[#fcfbf9] rounded-xl border border-[#8c8c73]/20 shadow-xs overflow-hidden">
        {/* Dashboard Header Bar */}
        <div className="bg-[#5A5A40] text-white p-4 sm:p-6 border-b border-[#8c8c73]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#8c8c73]/50 rounded-lg text-sazano-gold">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Hotel Sazano PMS</h1>
                <span className="text-[10px] bg-sazano-gold/20 text-sazano-gold border border-sazano-gold/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  v1.2-SIM
                </span>
              </div>
              <p className="text-xs text-[#efeee5]">სასტუმროს მართვისა და ინტეგრაციების ინტერაქციული სიმულატორი</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={simulateIncomingBooking}
              className="px-3.5 py-1.5 bg-sazano-gold hover:bg-[#b08b49] text-gray-900 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              id="simulate-booking-btn"
            >
              <Plus className="w-4 h-4" />
              ჯავშნის სიმულაცია
            </button>

            <button
              onClick={handleFullSync}
              disabled={isSyncing}
              className={`px-3.5 py-1.5 bg-[#8c8c73] hover:bg-[#72725e] text-white rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-[#efeee5]/25 cursor-pointer ${
                isSyncing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              id="sync-channels-btn"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'სინქრონიზაცია...' : 'არხების სინქრონიზაცია'}
            </button>
          </div>
        </div>

        {/* Dashboard Inner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          {/* Simulator Sidebar Navigation */}
          <div className="lg:col-span-3 bg-[#efeee5]/30 border-r border-[#8c8c73]/20 p-4 space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2.5">მართვის მოდულები</p>
            
            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'rooms'
                  ? 'bg-sazano-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bed className="w-4 h-4" />
                <span>ოთახები & ფასები</span>
              </div>
              <span className="text-xs font-mono font-bold bg-gray-200/50 text-gray-700 px-1.5 py-0.5 rounded group-hover:bg-gray-200">
                {rooms.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-sazano-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>ჯავშნების რეესტრი</span>
              </div>
              <span className="text-xs font-mono font-bold bg-[#bfddcc] text-sazano-green px-1.5 py-0.5 rounded">
                {bookings.filter(b => b.status === 'Pending').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ota')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'ota'
                  ? 'bg-sazano-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4" />
                <span>Booking.com სინქრონი</span>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            <button
              onClick={() => setActiveTab('sms')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'sms'
                  ? 'bg-sazano-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>SMS ცენტრი (ქართული)</span>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-bold">
                API Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'seo'
                  ? 'bg-sazano-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4" />
                <span>SEO და Google ბიზნესი</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-600">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>4.9</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('domain')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'domain'
                  ? 'bg-sazano-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4" />
                <span>დომენი და მეილები</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">.ge</span>
            </button>

            <div className="pt-6 mt-6 border-t border-gray-200 px-3">
              <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold">
                  <Award className="w-4 h-4 text-sazano-gold" />
                  <span>საზანო შატო რეზორტი</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  ეს პანელი სიმულაციას უკეთებს რეალურ PMS მართვის სისტემას, რომელიც აიგება თქვენი სასტუმროსთვის.
                </p>
              </div>
            </div>
          </div>

          {/* Simulator Main Display Area */}
          <div className="lg:col-span-9 p-6">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: ROOMS & PRICES */}
              {activeTab === 'rooms' && (
                <motion.div
                  key="rooms-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">ოთახების და ფასების კონტროლი</h2>
                      <p className="text-xs text-gray-500">შეცვალეთ ფასები, მართეთ ხელმისაწვდომობის სტატუსები რეალურ დროში</p>
                    </div>
                    <button
                      onClick={() => setIsAddingRoom(!isAddingRoom)}
                      className="px-3 py-1.5 bg-sazano-green text-white rounded-lg text-xs font-semibold hover:bg-[#1a3324] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ოთახის დამატება
                    </button>
                  </div>

                  {/* Add Room Modal/Form */}
                  {isAddingRoom && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 overflow-hidden"
                      onSubmit={handleAddRoom}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">ახალი ნომრის დამატება</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 font-medium">დასახელება</label>
                          <input
                            type="text"
                            required
                            placeholder="მაგ. შატო კოტეჯი #2"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded px-2.5 py-2 outline-none focus:border-sazano-green"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 font-medium">ტიპი</label>
                          <select
                            value={newRoomType}
                            onChange={(e) => setNewRoomType(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-2 bg-white outline-none focus:border-sazano-green"
                          >
                            <option value="Standard Double">Standard Double</option>
                            <option value="Luxury Suite">Luxury Suite</option>
                            <option value="Family Cottage">Family Cottage</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 font-medium">ფასი (₾ / ღამე)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={newRoomPrice}
                            onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-2 outline-none focus:border-sazano-green"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 font-medium">სტუმრები</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={newRoomCapacity}
                            onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-2 outline-none focus:border-sazano-green"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 text-xs pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingRoom(false)}
                          className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        >
                          გაუქმება
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-sazano-green text-white rounded font-semibold hover:bg-opacity-90"
                        >
                          დამატება
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Rooms Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-xs hover:border-gray-300 transition-all flex flex-col group"
                      >
                        <div className="h-40 bg-gray-100 relative">
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                            <div>
                              <span className="text-[10px] bg-sazano-gold text-gray-950 font-bold px-2 py-0.5 rounded-full mb-1 inline-block">
                                {room.type}
                              </span>
                              <h3 className="text-white text-sm font-bold leading-tight">{room.name}</h3>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="absolute top-2 right-2 p-1.5 bg-white/95 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                            title="ოთახის წაშლა"
                            id={`delete-room-${room.id}`}
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            {/* Price control slider/inputs */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-medium">ფასი (ღამეში):</span>
                                <span className="font-bold text-gray-900 text-sm">₾ {room.price}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                                <input
                                  type="range"
                                  min={50}
                                  max={500}
                                  step={5}
                                  value={room.price}
                                  onChange={(e) => handlePriceChange(room.id, Number(e.target.value))}
                                  className="w-full accent-sazano-green cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Status dropdown */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 font-medium">სტატუსი:</span>
                              <select
                                value={room.status}
                                onChange={(e) => handleStatusChange(room.id, e.target.value as any)}
                                className={`text-xs border rounded-md px-2 py-1 font-semibold ${
                                  room.status === 'Available'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : room.status === 'Occupied'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                } bg-white outline-none`}
                              >
                                <option value="Available">თავისუფალი</option>
                                <option value="Occupied">დაკავებული</option>
                                <option value="Maintenance">რემონტი / დასუფთავება</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                            <span>ტევადობა: {room.capacity} სტუმარი</span>
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Check className="w-3 h-3" />
                              სინქრონიზებულია
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: BOOKINGS REGISTRY */}
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">ჯავშნების რეესტრი</h2>
                      <p className="text-xs text-gray-500">საიტიდან და პარტნიორი საიტებიდან შემოსული ყველა ჯავშანი</p>
                    </div>
                    <div className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>ჯავშნის დადასტურებისას მომხმარებელს გაეგზავნება ავტომატური SMS</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="p-4">სტუმარი & ტელეფონი</th>
                            <th className="p-4">ნომერი</th>
                            <th className="p-4">პერიოდი</th>
                            <th className="p-4">ფასი</th>
                            <th className="p-4">სტატუსი</th>
                            <th className="p-4 text-right">მოქმედება</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-4">
                                <div className="font-semibold text-gray-900">{booking.guestName}</div>
                                <div className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                                  <Smartphone className="w-3 h-3 text-gray-400" />
                                  {booking.guestPhone}
                                </div>
                              </td>
                              <td className="p-4 text-gray-700 font-medium">{booking.roomName}</td>
                              <td className="p-4">
                                <div className="text-xs text-gray-900 font-medium">
                                  {booking.checkIn} — {booking.checkOut}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">შექმნილია: {booking.createdAt}</div>
                              </td>
                              <td className="p-4 font-bold text-sazano-wine">₾ {booking.totalPrice}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  booking.status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : booking.status === 'Declined'
                                    ? 'bg-red-50 text-red-700 border border-red-100'
                                    : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                                }`}>
                                  {booking.status === 'Approved' ? 'დადასტურებული' : booking.status === 'Declined' ? 'უარყოფილი' : 'მოდერაციაში'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {booking.status === 'Pending' ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleBookingStatus(booking.id, 'Approved')}
                                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                                      title="ჯავშნის დადასტურება"
                                      id={`approve-booking-${booking.id}`}
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleBookingStatus(booking.id, 'Declined')}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                                      title="ჯავშნის გაუქმება"
                                      id={`decline-booking-${booking.id}`}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">დასრულებულია</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: BOOKING.COM & CHANNEL SYNC */}
              {activeTab === 'ota' && (
                <motion.div
                  key="ota-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Booking.com და არხების მართვა (OTA Sync)</h2>
                    <p className="text-xs text-gray-500">დააკავშირეთ სასტუმროს საიტი Booking.com, Airbnb და Expedia პლატფორმებთან</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Channel cards */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between shadow-xs">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-blue-900">Booking.com</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                            ჩართულია
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">ორმხრივი სინქრონიზაცია ფასებისა და თავისუფალი ოთახების iCal-ითა და API-თ.</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                        <span>ბოლო სინქრონიზაცია: 5 წთ წინ</span>
                        <span className="text-blue-600 font-semibold cursor-pointer hover:underline flex items-center gap-0.5">
                          გახსნა <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between shadow-xs">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-rose-600">Airbnb</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                            ჩართულია
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">კალენდრების სინქრონიზაცია. კოტეჯების გაქირავების ავტომატური კავშირი.</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                        <span>ბოლო სინქრონიზაცია: 5 წთ წინ</span>
                        <span className="text-rose-600 font-semibold cursor-pointer hover:underline flex items-center gap-0.5">
                          გახსნა <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200/80 flex flex-col justify-between shadow-xs relative">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-amber-600">Expedia</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-full font-bold">
                            გამორთულია
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">საერთაშორისო ჯავშნების პლატფორმა. საჭიროებს Channel Manager API-ს.</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                        <span>კავშირი არ არის</span>
                        <span className="text-gray-500 font-semibold hover:text-gray-900 transition-colors cursor-pointer hover:underline">
                          დაკავშირება
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Synchronization Logs */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">სინქრონიზაციის ლოგები</h3>
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 max-h-[180px] overflow-y-auto space-y-2.5 font-mono text-[11px]">
                      {syncLogs.map((log) => (
                        <div key={log.id} className="flex items-start justify-between gap-3 border-b border-gray-200/60 pb-1.5 last:border-b-0 last:pb-0">
                          <div className="flex items-start gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              log.platform === 'Booking.com' ? 'bg-blue-100 text-blue-800' :
                              log.platform === 'Airbnb' ? 'bg-rose-100 text-rose-800' : 'bg-gray-200 text-gray-800'
                            }`}>
                              {log.platform}
                            </span>
                            <span className="text-gray-700">{log.event}</span>
                          </div>
                          <span className="text-gray-400 shrink-0">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: SMS CENTER */}
              {activeTab === 'sms' && (
                <motion.div
                  key="sms-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">ქართულ SMS სერვისებთან ინტეგრაცია</h2>
                      <p className="text-xs text-gray-500">დააყენეთ SMS ტექსტის შაბლონები და მართეთ შეტყობინებების ისტორია</p>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 border border-emerald-100 rounded-full font-bold">
                      SMS ბალანსი: 500 SMS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Settings Form */}
                    <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">SMS პარამეტრები</h3>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-600 font-semibold">SMS პროვაიდერი</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['smsoffice', 'magti', 'silknet'] as const).map((prov) => (
                            <button
                              key={prov}
                              type="button"
                              onClick={() => setSelectedSMSProvider(prov)}
                              className={`py-2 text-center text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                                selectedSMSProvider === prov
                                  ? 'bg-sazano-wine text-white border-sazano-wine'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {prov === 'smsoffice' ? 'SMS Office' : prov === 'magti' ? 'Magti SMS' : 'Silknet API'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-gray-600 font-semibold">ჯავშნის დადასტურების SMS შაბლონი</label>
                          <span className="text-[10px] text-gray-400">ცვლადები: {"{სახელი}"}, {"{ოთახი}"}, {"{თარიღი}"}</span>
                        </div>
                        <textarea
                          rows={4}
                          value={smsTemplate}
                          onChange={(e) => setSmsTemplate(e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-sazano-wine focus:border-sazano-wine font-sans"
                        />
                      </div>

                      <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-800 space-y-1">
                        <p className="font-semibold flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-sazano-gold" />
                          ბრენდირებული გამგზავნი (Sender ID)
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          თქვენს სტუმრებს შეტყობინება მიუვათ არა ჩვეულებრივი ნომრიდან, არამედ სათაურით <strong className="text-sazano-wine">SAZANO</strong>, რაც ზრდის ნდობასა და პრესტიჟს.
                        </p>
                      </div>
                    </div>

                    {/* Live SMS History */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">გაგზავნილი შეტყობინებების ისტორია</h3>
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                        {smsLogs.map((log) => (
                          <div key={log.id} className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs flex items-start gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                              <Check className="w-4 h-4" />
                            </div>
                            <div className="space-y-1 w-full">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-800">{log.recipient}</span>
                                <span className="text-gray-400 font-mono text-[10px]">{log.timestamp}</span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed font-sans">{log.message}</p>
                              <div className="flex justify-end pt-1">
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100">
                                  მიწოდებულია
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: SEO & GOOGLE MY BUSINESS */}
              {activeTab === 'seo' && (
                <motion.div
                  key="seo-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">SEO და Google Business-ის ოპტიმიზატორი</h2>
                      <p className="text-xs text-gray-500">გაზარდეთ სასტუმროს ხილვადობა Google-ის საძიებო სისტემასა და Google Maps-ზე</p>
                    </div>
                    <button
                      onClick={saveSEOSettings}
                      className="px-4 py-1.5 bg-sazano-wine text-white text-xs font-semibold rounded-lg hover:bg-[#4d161c] transition-colors cursor-pointer"
                      id="save-seo-btn"
                    >
                      პარამეტრების შენახვა
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SEO Edit Controls */}
                    <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">საძიებო ოპტიმიზაციის პარამეტრები</h3>
                      
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 font-semibold">Meta Title (სათაური საძიებო სისტემისთვის)</label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded px-2.5 py-2 outline-none focus:border-sazano-green bg-white font-sans font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 font-semibold">Meta Description (აღწერა)</label>
                        <textarea
                          rows={3}
                          value={seoDesc}
                          onChange={(e) => setSeoDesc(e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded p-2.5 outline-none focus:border-sazano-green bg-white font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 font-semibold">SEO Keywords (საძიებო ტეგები)</label>
                        <input
                          type="text"
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded px-2.5 py-2 outline-none focus:border-sazano-green bg-white font-sans"
                        />
                      </div>

                      <div className="border-t border-gray-200 pt-4 space-y-3">
                        <h4 className="text-xs font-bold text-gray-700">Google Business Profile მონაცემები</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] text-gray-500 font-medium">კომპანიის სახელი</label>
                            <input
                              type="text"
                              value={gBusinessName}
                              onChange={(e) => setGBusinessName(e.target.value)}
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-gray-500 font-medium">მდებარეობა რუკაზე</label>
                            <input
                              type="text"
                              value={gBusinessLocation}
                              onChange={(e) => setGBusinessLocation(e.target.value)}
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Google Visual Previews */}
                    <div className="space-y-6">
                      {/* Google Search Result Preview */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                          <Eye className="w-4 h-4 text-blue-600" />
                          გუგლის ძიების შედეგის პრევიუ
                        </h3>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
                          <div className="text-xs text-[#202124] flex items-center gap-1 font-sans">
                            <span>https://sazano.ge</span>
                            <span className="text-[9px] text-gray-400">▼</span>
                          </div>
                          <h4 className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight">
                            {seoTitle}
                          </h4>
                          <p className="text-xs text-[#4d5156] leading-relaxed font-sans">
                            {seoDesc}
                          </p>
                        </div>
                      </div>

                      {/* Google Maps Business Card Preview */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-red-500" />
                          გუგლის რუკის პროფილის პრევიუ (Google Business Card)
                        </h3>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex gap-3.5 items-start">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            <img
                              src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=200&q=80"
                              alt="Google Business"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <h4 className="text-sm font-bold text-gray-900 leading-snug">{gBusinessName}</h4>
                            
                            <div className="flex items-center gap-1 text-xs">
                              <span className="font-bold text-amber-500">{gBusinessRating}</span>
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </div>
                              <span className="text-gray-400">({gBusinessReviews} შეფასება)</span>
                            </div>

                            <p className="text-[11px] text-gray-500 font-sans">სასტუმრო • {gBusinessLocation}</p>
                            
                            <div className="flex gap-2 pt-1 text-[10px] font-bold text-blue-600">
                              <span className="bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 cursor-pointer">ვებ-საიტი</span>
                              <span className="bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 cursor-pointer">მარშრუტი</span>
                              <span className="bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 cursor-pointer">დარეკვა</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: DOMAIN & BUSINESS EMAILS */}
              {activeTab === 'domain' && (
                <motion.div
                  key="domain-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">დომენის რეგისტრაცია და ბიზნეს მეილები</h2>
                    <p className="text-xs text-gray-500">მოიძიეთ თავისუფალი ქართული .ge დომენი და გამართეთ პროფესიონალური მეილები</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Domain Checker Tool */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">დომენის ძებნა ქართულ პროვაიდერებში</h3>
                        
                        {/* Suggested Quick Selectors */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-400 font-medium">სასურველი:</span>
                          {['esh', 'ethnosazanohotel'].map((d) => (
                            <button
                              key={d}
                              onClick={() => {
                                setDomainSearchQuery(d);
                                // Trigger search for clicked domain
                                setIsSearchingDomain(true);
                                setTimeout(() => {
                                  const results: DomainCheckResult[] = [];
                                  if (d === 'ethnosazanohotel') {
                                    results.push(
                                      { domainName: 'ethnosazanohotel.ge', isAvailable: true, price: 50, provider: 'Registration.ge', suffix: '.ge' },
                                      { domainName: 'ethnosazanohotel.com', isAvailable: true, price: 50, provider: 'Proservice.ge', suffix: '.com' },
                                      { domainName: 'hotelethnosazanohotel.ge', isAvailable: true, price: 50, provider: 'Registration.ge', suffix: '.ge' },
                                      { domainName: 'ethnosazanohotelresort.ge', isAvailable: true, price: 50, provider: 'Registration.ge', suffix: '.ge' }
                                    );
                                  } else {
                                    results.push(
                                      { domainName: 'esh.ge', isAvailable: true, price: 50, provider: 'Registration.ge', suffix: '.ge' },
                                      { domainName: 'esh.com', isAvailable: true, price: 50, provider: 'Proservice.ge', suffix: '.com' },
                                      { domainName: 'hotelesh.ge', isAvailable: true, price: 50, provider: 'Registration.ge', suffix: '.ge' },
                                      { domainName: 'eshresort.ge', isAvailable: true, price: 50, provider: 'Registration.ge', suffix: '.ge' }
                                    );
                                  }
                                  setDomainResults(results);
                                  setIsSearchingDomain(false);
                                }, 400);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                                domainSearchQuery === d
                                  ? 'bg-[#5A5A40] text-white border-[#5A5A40] font-bold'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="მაგ. ethnosazanohotel"
                            value={domainSearchQuery}
                            onChange={(e) => setDomainSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDomainSearch()}
                            className="w-full text-xs border border-gray-300 rounded-lg pl-8 pr-16 py-2.5 outline-none focus:border-sazano-green"
                          />
                          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                          <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold font-mono">.ge</span>
                        </div>
                        <button
                          onClick={handleDomainSearch}
                          disabled={isSearchingDomain}
                          className="px-4 py-2 bg-sazano-wine hover:bg-[#4b181e] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {isSearchingDomain ? 'ვეძებთ...' : 'შემოწმება'}
                        </button>
                      </div>

                      {/* Search Results */}
                      <div className="space-y-2.5 pt-2">
                        {domainResults.map((res, i) => (
                          <div key={i} className="flex justify-between items-center border border-gray-100 rounded-lg p-3 hover:bg-gray-50/60 transition-colors">
                            <div>
                              <span className="text-sm font-bold text-gray-900">{res.domainName}</span>
                              <p className="text-[10px] text-gray-400">{res.provider} • წლიური საფასური</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-sazano-green">₾ {res.price}</span>
                              {res.isAvailable ? (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold">
                                  თავისუფალია
                                </span>
                              ) : (
                                <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded font-bold">
                                  დაკავებულია
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Corporate Mail Integration Guide */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">კორპორატიული ფოსტის გამართვის გზამკვლევი</h3>
                      
                      <div className="space-y-3.5">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-amber-50 text-sazano-wine rounded-lg flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-800">შეიძინეთ დომენი (.ge)</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              დაარეგისტრირეთ დომენი სასურველ პროვაიდერთან, მაგალითად <strong className="text-gray-700">ethnosazanohotel.ge</strong> ან <strong className="text-gray-700">esh.ge</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-amber-50 text-sazano-wine rounded-lg flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-800">აირჩიეთ ფოსტის ჰოსტინგი</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              რეკომენდებულია <strong className="text-gray-700">Google Workspace</strong> (Gmail-ის ბიზნეს ვერსია) ან <strong className="text-gray-700">Zoho Mail</strong> (აქვს უფასო ტარიფები მცირე გუნდებისთვის).
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-amber-50 text-sazano-wine rounded-lg flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-800">DNS ჩანაწერების გასწორება (MX Records)</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              დომენის მართვის პანელში ამატებთ MX ჩანაწერებს (მაგ. Zoho-სთვის: <code className="bg-white px-1 py-0.5 border border-gray-200 rounded text-red-600">mx.zoho.com</code>) მეილების მისაღებად.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-amber-50 text-sazano-wine rounded-lg flex items-center justify-center shrink-0 font-bold text-xs">4</div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-800">დაცვის სტანდარტები (SPF, DKIM, DMARC)</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              ჩანაწერების გასწორება უზრუნველყოფს, რომ თქვენი გაგზავნილი შეტყობინებები არ მოხვდეს ადრესატის სპამში.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
