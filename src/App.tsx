import React, { useState } from 'react';
import { 
  initialBriefSections, 
  initialRooms, 
  initialBookings, 
  initialSMSLogs, 
  initialSyncLogs, 
  defaultSEOState 
} from './data/briefData';
import { BriefSection, Room, Booking, SMSLog, SyncLog, SEOState } from './types';
import BriefViewer from './components/BriefViewer';
import PMSSimulator from './components/PMSSimulator';
import { 
  FileText, Settings, Sparkles, Building2, Globe, MessageSquare, 
  CalendarCheck, Compass, Heart, Github, ExternalLink, Mail, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeView, setActiveView] = useState<'brief' | 'pms'>('brief');
  
  // App-wide Shared States
  const [briefSections, setBriefSections] = useState<BriefSection[]>(initialBriefSections);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>(initialSMSLogs);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(initialSyncLogs);
  const [seoState, setSeoState] = useState<SEOState>(defaultSEOState);

  // Sync brief content dynamically if user updates rooms/prices in PMS!
  const handleUpdateRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    
    // Dynamically update the rooms content block in the brief section
    const updatedSections = briefSections.map(sec => {
      if (sec.id === 'structure') {
        const roomsText = updatedRooms.map((r, i) => 
          `   • ${r.name} (${r.type}) — ფასი: ₾${r.price}/ღამე. ტევადობა: ${r.capacity} სტუმარი.`
        ).join('\n');
        
        return {
          ...sec,
          content: `სასტუმროს საიტი აიგება თანამედროვე, მობილურზე ადაპტირებული (Responsive) დიზაინით, რომელიც ხაზს გაუსვამს საზანოს ბუნებას, კულინარიასა და სტუმართმოყვარეობას.

ძირითადი გვერდები:
1. მთავარი გვერდი (Home): შთამბეჭდავი ვიზუალური ჰერო-ბანერი, უპირატესობები, აქტიური ჯავშნის ვიჯეტი (Check-in/Check-out, სტუმრების რაოდენობა).
2. ნომრები (Rooms): თითოეული ნომრის დეტალური აღწერა, გალერეა, ფასები, ინდივიდუალური კეთილმოწყობა და „დაჯავშნე“ ღილაკი.
აქტიური ნომრები და მიმდინარე ტარიფები საიტიდან:
${roomsText}

3. საზანოს შესახებ (About Us): ისტორია, მდებარეობა, მიმდებარე ღირსშესანიშნაობები (ჩანჩქერები, მარნები).
4. გალერეა (Gallery): მაღალი ხარისხის ფოტო და ვიდეო მასალა.
5. კონტაქტი (Contact): ინტერაქციული რუკა (Google Maps), ტელეფონი, მეილი, სოც. მედიის ბმულები.

ჯავშნის ძრავა (Booking Engine):
მომხმარებელს შეეძლება პირდაპირ საიტიდან ნომრის შერჩევა, სასურველი თარიღების მონიშვნა, საკონტაქტო მონაცემების შევსება და ონლაინ დაჯავშნა.`
        };
      }
      return sec;
    });
    setBriefSections(updatedSections);
  };

  const handleResetBrief = () => {
    setBriefSections(initialBriefSections);
    setRooms(initialRooms);
    setBookings(initialBookings);
    setSmsLogs(initialSMSLogs);
    setSyncLogs(initialSyncLogs);
    setSeoState(defaultSEOState);
  };

  const handleUpdateBookings = (updated: Booking[]) => setBookings(updated);
  const handleUpdateSMSLogs = (updated: SMSLog[]) => setSmsLogs(updated);
  const handleUpdateSyncLogs = (updated: SyncLog[]) => setSyncLogs(updated);
  const handleUpdateSEO = (updated: SEOState) => {
    setSeoState(updated);
    // Dynamically sync brief's SEO section
    setBriefSections(prev => prev.map(sec => {
      if (sec.id === 'seo_gmb') {
        return {
          ...sec,
          content: `იმისათვის, რომ სასტუმრო მარტივად იძებნებოდეს Google-ში როგორც ქართულ, ისე ინგლისურ ენებზე, გატარდება შემდეგი სამუშაოები:

SEO ოპტიმიზაცია:
- მეტა ტეგების (Title, Description, OpenGraph) სწორად გაწერა თითოეული გვერდისთვის.
  • სათაური: ${updated.title}
  • აღწერა: ${updated.description}
  • საძიებო სიტყვები: ${updated.keywords}
- საძიებო სიტყვების ინტეგრაცია შიდა ტექსტებში (მაგ. „სასტუმრო თერჯოლაში“, „კოტეჯი საზანოში“, „Hotel in Sazano“, „Sazano resort booking“).
- ვებ-გვერდის სიჩქარისა და მობილური ვერსიის მაქსიმალური ოპტიმიზაცია.

Google Business Profile & Google Maps:
- Google Business-ის პროფილის ვერიფიკაცია და სრულყოფილი შევსება.
  • კომპანიის სახელი რუკაზე: ${updated.googleBusinessName}
  • შევსებული ლოკაცია: ${updated.googleBusinessLocation}
- ზუსტი გეოგრაფიული კოორდინატების მონიშვნა Google Maps-ზე, რათა სტუმრებმა მარტივად შეძლონ ნავიგაცია.
- მაღალი ხარისხის ფოტოების ატვირთვა და სტუმრების შეფასებების (Reviews) სტიმულირების სისტემა.`
        };
      }
      return sec;
    }));
  };

  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#33332d] flex flex-col font-sans">
      
      {/* Top Beautiful Header Panel representing Sazano, Imereti */}
      <header className="bg-[#5A5A40] text-white overflow-hidden relative shadow-md border-b border-[#8c8c73]/30">
        {/* Abstract organic SVG pattern representation for hills & rivers */}
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80")' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-sazano-gold rounded-full animate-ping" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-sazano-gold">სასტუმრო საზანო • ბრიფი და პლანერი</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                სასტუმრო საზანო <span className="text-sazano-gold font-serif italic font-normal">Hotel Sazano</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#efeee5]/95 max-w-2xl font-light leading-relaxed">
                ციფრული ინფრასტრუქტურის, ვებ-გვერდის, PMS სამართავი პანელის, Booking.com-ის, SMS შეტყობინებებისა და SEO ოპტიმიზაციის სრულყოფილი ბრიფი და ინტერაქციული სამუშაო გარემო.
              </p>
            </div>

            {/* Quick action switches between Brief & PMS */}
            <div className="flex bg-[#33332d]/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shrink-0 self-start md:self-auto shadow-inner">
              <button
                onClick={() => setActiveView('brief')}
                className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeView === 'brief'
                    ? 'bg-[#5A5A40] text-white shadow-sm border border-[#efeee5]/25'
                    : 'text-[#efeee5]/80 hover:text-white'
                }`}
                id="tab-brief-view"
              >
                <FileText className="w-4 h-4 text-sazano-gold" />
                ბრიფი (MS Word ფორმატი)
              </button>
              
              <button
                onClick={() => setActiveView('pms')}
                className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer relative ${
                  activeView === 'pms'
                    ? 'bg-[#8c8c73] text-white shadow-sm border border-[#efeee5]/25'
                    : 'text-[#efeee5]/80 hover:text-white'
                }`}
                id="tab-pms-view"
              >
                <Settings className="w-4 h-4 text-sazano-gold" />
                ადმინ დეშბორდი (PMS)
                {pendingBookingsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {pendingBookingsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#efeee5]/20">
            
            <div className="bg-[#efeee5]/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="p-2 bg-[#5A5A40]/45 rounded-lg text-sazano-gold shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-300 font-medium">სასურველი დომენები</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-white font-mono leading-tight break-words">
                  esh.ge, ethnosazanohotel.ge, ethnosazanohotel.com
                </p>
              </div>
            </div>

            <div className="bg-[#efeee5]/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="p-2 bg-[#8c8c73]/45 rounded-lg text-sazano-gold shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-300 font-medium">აქტიური ნომერი</p>
                <p className="text-xs sm:text-sm font-bold text-white">{rooms.length} კატეგორია</p>
              </div>
            </div>

            <div className="bg-[#efeee5]/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-sazano-gold shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-300 font-medium">ჯავშნები რეესტრში</p>
                <p className="text-xs sm:text-sm font-bold text-white">{bookings.length} ჯავშანი</p>
              </div>
            </div>

            <div className="bg-[#efeee5]/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-sazano-gold shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-300 font-medium">SMS გამგზავნი (ID)</p>
                <p className="text-xs sm:text-sm font-bold text-white font-mono">SAZANO</p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Explanatory introduction banner to guide the client */}
        <div className="mb-6 p-4 bg-[#efeee5] border border-[#8c8c73]/30 rounded-xl flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-sazano-gold shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#5A5A40]">საცდელი რეჟიმის ინსტრუქცია • სასტუმრო საზანო</h4>
            <p className="text-xs sm:text-sm text-[#33332d] leading-relaxed font-sans">
              თქვენს განკარგულებაშია ორი ურთიერთდაკავშირებული მოდული. <strong className="text-[#5A5A40]">„ბრიფი“</strong> ტაბში შეგიძლიათ ნახოთ და დაარედაქტიროთ ვებ-გვერდის ოფიციალური საპროექტო გეგმა, რომელიც იხსნება Word-ში. <strong className="text-[#5A5A40]">„ადმინ დეშბორდი“</strong> ტაბში კი რეალურად გამოსცადოთ, როგორ იმუშავებს სასტუმროს ოთახების, ფასების მართვა, Booking.com-ის სინქრონიზაცია და SMS შეტყობინებები!
            </p>
          </div>
        </div>

        {/* Display Active View Container */}
        <AnimatePresence mode="wait">
          {activeView === 'brief' ? (
            <motion.div
              key="brief-view-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <BriefViewer 
                sections={briefSections} 
                onUpdateSections={setBriefSections}
                onReset={handleResetBrief}
              />
            </motion.div>
          ) : (
            <motion.div
              key="pms-view-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <PMSSimulator
                rooms={rooms}
                bookings={bookings}
                smsLogs={smsLogs}
                syncLogs={syncLogs}
                seoState={seoState}
                onUpdateRooms={handleUpdateRooms}
                onUpdateBookings={handleUpdateBookings}
                onUpdateSMSLogs={setSmsLogs}
                onUpdateSyncLogs={setSyncLogs}
                onUpdateSEO={handleUpdateSEO}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Beautiful Georgia-inspired footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-gray-800 pb-8 mb-8">
            <div className="space-y-2">
              <h3 className="text-white text-lg font-bold flex items-center justify-center sm:justify-start gap-2">
                <Compass className="w-5 h-5 text-sazano-gold" />
                სასტუმრო საზანო ციფრული ეკოსისტემა
              </h3>
              <p className="text-xs text-gray-400">ვებ-საიტების და PMS სისტემების შემუშავება ქართული ტურიზმისთვის</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                უსაფრთხო ადმინისტრირება
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-sazano-gold" />
                info@ethnosazanohotel.ge
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 სასტუმრო საზანო. ყველა უფლება დაცულია.</p>
            <p className="flex items-center gap-1.5">
              დამზადებულია სიყვარულით საქართველოში
              <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
