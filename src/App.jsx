import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { COURSES, REVIEWS, FAQ, FEATURES } from './data';

function AnimatedNumber({ value, suffix = '', duration = 2000 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
}

function FadeInSection({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px', amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: isInView ? 'auto' : 'transform, opacity' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FloatingOrb({ className, delay = 0 }) {
  return (
    <div
      className={`floating-orb absolute rounded-full blur-2xl pointer-events-none ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function useHorizontalScrollLock(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isLockedVertical = false;
    let isLockedHorizontal = false;
    const THRESHOLD = 8;

    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isLockedVertical = false;
      isLockedHorizontal = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      if (isLockedVertical || isLockedHorizontal) return;

      const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);

      if (deltaX < THRESHOLD && deltaY < THRESHOLD) return;

      if (deltaY > deltaX) {
        isLockedVertical = true;
      } else {
        isLockedHorizontal = true;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const atStart = scrollLeft <= 0;
        const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
        const movingLeft = e.touches[0].clientX < touchStartX;
        const movingRight = e.touches[0].clientX > touchStartX;

        if ((atStart && movingRight) || (atEnd && movingLeft)) {
          isLockedVertical = true;
          isLockedHorizontal = false;
        }
      }
    };

    const handleWheel = (e) => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const atStart = scrollLeft <= 0;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const horizontalDelta = e.deltaX || (Math.abs(e.deltaY) > 0 ? e.deltaY : 0);
        if (horizontalDelta === 0) return;

        if ((atStart && horizontalDelta < 0) || (atEnd && horizontalDelta > 0)) {
          return;
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [ref]);
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileOpen]);

  const links = [
    { label: 'Обо мне', href: '#about' },
    { label: 'Курсы', href: '#courses' },
    { label: 'Отзывы', href: '#reviews' },
    { label: 'Контакты', href: '#contact' }
  ];

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 py-3 sm:py-4 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0a0a]/90 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.05)]'
            : 'bg-[#0a0a0a]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={`${import.meta.env.BASE_URL}timoshin_logo.png`}
                alt="Денис Тимошин"
                className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-orange-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
              Денис <span className="text-[#ef5d2b]">Тимошин</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="relative text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
            <motion.button
              onClick={() => scrollTo('#contact')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="ml-4 relative bg-[#ef5d2b] text-white text-sm font-semibold px-6 py-2.5 rounded-full overflow-hidden group"
            >
              <span className="relative z-10">Узнать больше</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </motion.nav>

     <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-[#111111]/95 backdrop-blur-xl border-l border-white/10 z-50 p-8"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex flex-col gap-2 mt-20">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-xl font-semibold text-gray-200 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-all text-left"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => scrollTo('#contact')}
                className="bg-[#ef5d2b] text-white text-center font-semibold px-6 py-4 rounded-full mt-6 hover:bg-[#ff7a4a] transition-all"
              >
                Узнать больше
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#0a0a0a] overflow-hidden">
      <FloatingOrb className="w-[500px] h-[500px] bg-orange-500/10 top-20 right-0" delay={0} />
      <FloatingOrb className="w-[350px] h-[350px] bg-purple-500/8 bottom-20 left-0" delay={2} />
      <FloatingOrb className="w-[250px] h-[250px] bg-blue-500/5 top-1/2 left-1/3" delay={4} />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeInSection>
            <motion.div
              className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <span className="pulse-dot w-2 h-2 rounded-full bg-[#ef5d2b]" />
              <span className="text-sm font-medium text-orange-400">Курсы от тимлида Kokoc.tech</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-bold text-white tracking-tight mb-6 leading-tight lg:leading-[1.25]">
              <span className="block">Ломаете голову над</span>
              <span className="block">карьерой в IT? <span className="text-[#ef5d2b]">Я даю</span></span>
              <span className="block text-[#ef5d2b]">ключи</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
              Курсы, которые превращают растерянность в чёткую карьерную траекторию — от первого шага в IT до руководства командой и работы с нейросетями. Без воды. С результатом.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.a
                href="#courses"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#courses')?.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative bg-[#ef5d2b] text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full overflow-hidden inline-flex items-center gap-2 group"
              >
                <span className="relative z-10">Найти свой ключ</span>
                <svg
                  width="18" height="18" viewBox="0 0 18 18" fill="none"
                  className="relative z-10 arrow-bounce"
                >
                  <path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
              <motion.a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border border-white/10 text-gray-300 font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full hover:border-white/20 hover:bg-white/5 transition-all"
              >
                Об авторе
              </motion.a>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="relative max-w-sm mx-auto lg:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-[2rem] blur-2xl scale-95" />
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}timoshin_team_lead.png`}
                  alt="Денис Тимошин"
                  className="relative w-full rounded-3xl shadow-2xl shadow-black/50 object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-4 left-4 sm:-bottom-6 sm:-left-6 bg-[#161616]/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/20 p-3 sm:p-4 border border-white/10"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M7 10L9 12L13 8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Практические курсы</p>
                    <p className="text-xs text-gray-500">Без теории, без воды</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-16 sm:py-24 bg-[#0a0a0a] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeInSection>
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-sm font-semibold text-[#ef5d2b] uppercase tracking-widest">Преимущества</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3 mb-4">
              Что вы получите — и чего не будет
            </h2>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((feature, i) => (
            <FadeInSection key={i} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group p-6 rounded-2xl border transition-all duration-300 ${
                  feature.positive
                    ? 'bg-white/[0.02] border-white/5 hover:border-orange-500/20 hover:bg-white/[0.04]'
                    : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                      feature.positive
                        ? 'bg-orange-500/10 text-[#ef5d2b] group-hover:bg-orange-500/20'
                        : 'bg-white/5 text-gray-600'
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-[#0f0f0f] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <FadeInSection>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-sm font-semibold text-[#ef5d2b] uppercase tracking-widest">Об авторе</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3 mb-6">Денис Тимошин</h2>
              <p className="text-gray-400 leading-relaxed text-base sm:text-lg mb-4 sm:mb-6">
                Руковожу отделом QA в Kokoc.tech. Прошёл путь от стажёра до тимлида — вместо того чтобы нанимать дорогих сеньоров, построил систему, где новички быстро растут благодаря ИИ и структурированному обучению.
              </p>
              <p className="text-gray-400 leading-relaxed text-base sm:text-lg mb-8 sm:mb-10">
                Мои курсы — это готовые решения для тех, кто хочет расти в IT без выгорания, паники и иллюзий.
              </p>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: 8, suffix: '+', label: 'курсов' },
                  { value: 500, suffix: '+', label: 'студентов' },
                  { value: 5, suffix: '', label: 'рейтинг', isFloat: true }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.15 }}
                    className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                  >
                    <p className="text-2xl sm:text-3xl font-bold text-[#ef5d2b]">
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/15 to-purple-500/15 rounded-[2rem] blur-2xl" />
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}timoshin_autor.png`}
                    alt="Денис Тимошин"
                    className="relative w-full rounded-3xl shadow-xl shadow-black/5 object-cover aspect-square"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/30 to-transparent" />
                </motion.div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

function CourseCard({ course, index }) {
  return (
    <FadeInSection delay={index * 0.05} className="flex">
      <motion.a
        href={course.link}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative flex flex-col w-full bg-[#141414] rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(239,93,43,0.1), transparent 70%)`
        }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/0 group-hover:via-orange-500/50 to-transparent transition-all duration-500" />

        <div className="relative p-5 sm:p-6 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-4">
            <span className="text-4xl">{course.icon}</span>
            <span className="text-xl sm:text-2xl font-bold text-white">{course.price}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-[#ef5d2b] transition-colors">{course.title}</h3>
          <p className="text-sm text-gray-500 mb-4 sm:mb-5">{course.subtitle}</p>
          <ul className="space-y-2 mb-5 sm:mb-6 flex-grow">
            {course.features.map((f, fi) => (
              <li key={fi} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef5d2b] flex-shrink-0 mt-1.5" />
                {f}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 text-[#ef5d2b] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Взять этот ключ</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </motion.a>
    </FadeInSection>
  );
}

function Courses() {
  return (
    <section id="courses" className="py-16 sm:py-24 bg-[#0a0a0a] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeInSection>
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-sm font-semibold text-[#ef5d2b] uppercase tracking-widest">Каталог</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3 mb-4">
              Ключи под каждый этап вашего пути
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Фиксированные цены. Конкретные задачи. Никаких скрытых платежей
            </p>
          </div>
        </FadeInSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {COURSES.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useHorizontalScrollLock(scrollRef);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll, { passive: true });
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-[#0f0f0f] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeInSection>
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <span className="text-sm font-semibold text-[#ef5d2b] uppercase tracking-widest">Отзывы</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3">Что говорят студенты</h2>
            </div>
            <div className="hidden sm:flex gap-3 shrink-0 ml-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll(-1)}
                disabled={!canScrollLeft}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'bg-[#ef5d2b] text-white hover:bg-[#ff7a4a] shadow-lg shadow-orange-500/25'
                    : 'bg-white/5 text-gray-700 cursor-not-allowed'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll(1)}
                disabled={!canScrollRight}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'bg-[#ef5d2b] text-white hover:bg-[#ff7a4a] shadow-lg shadow-orange-500/25'
                    : 'bg-white/5 text-gray-700 cursor-not-allowed'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>
          </div>
        </FadeInSection>

        <div
          ref={scrollRef}
          className="reviews-slider flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain'
          }}
        >
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="w-[280px] sm:w-[340px] shrink-0 flex"
            >
              <div className="bg-[#141414] rounded-2xl p-5 sm:p-6 border border-white/5 hover:border-white/10 transition-colors w-full">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white/5 shrink-0"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(review.name) + '&background=ef5d2b&color=fff&size=112';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm sm:text-base truncate">{review.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{review.role}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{review.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-16 sm:py-24 bg-[#0a0a0a] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <FadeInSection>
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-sm font-semibold text-[#ef5d2b] uppercase tracking-widest">FAQ</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3 mb-4">
              Выберите свой путь — не идеальный, а&nbsp;ваш
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Каждый путь — это набор практических инструментов для конкретной задачи.
            </p>
          </div>
        </FadeInSection>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <FadeInSection key={i} delay={i * 0.03}>
              <motion.div
                className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden"
                animate={{
                  borderColor: openIndex === i ? 'rgba(239,93,43,0.3)' : 'rgba(255,255,255,0.05)'
                }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-base sm:text-lg font-semibold text-white pr-4">{item.q}</span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8H12M8 4V12" stroke="#ef5d2b" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{item.a}</p>
                        <p className="mt-4 font-semibold text-[#ef5d2b] text-sm sm:text-base">Цена: {item.price}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#0f0f0f] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <FloatingOrb className="w-[350px] h-[350px] bg-orange-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={1} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <FadeInSection>
          <span className="text-sm font-semibold text-[#ef5d2b] uppercase tracking-widest">Контакты</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3 mb-4">Написать или позвонить</h2>
          <p className="text-base sm:text-xl text-gray-400 mb-3">
            Готов ответить на вопросы по курсам, помочь с выбором или обсудить корпоративное обучение
          </p>
          <motion.a
            href="tel:+79875706600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xl sm:text-2xl font-bold text-[#ef5d2b] hover:text-[#ff7a4a] transition-colors mb-8 sm:mb-10 inline-block"
          >
            +7 987 570 66 00
          </motion.a>

          <div className="flex justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
            {[
              {
                name: 'VK',
                href: 'https://vk.com/d.timoshinn',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.189 1.367 1.259 2.182 1.815.616.42 1.084.328 1.084.328l2.178-.03s1.14-.07.599-.964c-.044-.073-.314-.661-1.618-1.869-1.366-1.265-1.183-1.06.462-3.251.999-1.33 1.398-2.142 1.273-2.49-.12-.331-.857-.244-.857-.244l-2.45.015s-.182-.025-.316.056c-.131.079-.216.263-.216.263s-.387 1.028-.903 1.903c-1.089 1.85-1.524 1.948-1.702 1.834-.414-.265-.31-1.065-.31-1.634 0-1.777.27-2.517-.525-2.708-.264-.063-.458-.105-1.133-.112-.866-.009-1.599.003-2.014.207-.277.136-.49.439-.36.456.16.021.524.098.717.359.248.338.239 1.097.239 1.097s.142 2.09-.332 2.348c-.325.177-.77-.184-1.727-1.836-.49-.848-.861-1.79-.861-1.79s-.072-.176-.199-.27c-.155-.114-.372-.15-.372-.15l-2.328.015s-.35.01-.479.162c-.114.135-.009.414-.009.414s1.817 4.244 3.873 6.384c1.886 1.963 4.032 1.834 4.032 1.834h.971z"/>
                  </svg>
                )
              },
              {
                name: 'Rutube',
                href: 'https://rutube.ru/channel/78748261/',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.842 3H6.158C4.414 3 3 4.37 3 6.06v11.88C3 19.63 4.414 21 6.158 21h11.684C19.586 21 21 19.63 21 17.94V6.06C21 4.37 19.586 3 17.842 3zM9.5 15.5v-7l5.5 3.5-5.5 3.5z"/>
                  </svg>
                )
              },
              {
                name: 'Telegram',
                href: 'https://t.me/timoshin_denis',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-2.05 1.31-5.78 3.82-.54.37-1.03.55-1.47.54-.49-.01-1.42-.28-2.12-.5-.86-.28-1.54-.43-1.48-.91.03-.25.38-.51 1.05-.78 4.13-1.8 6.89-2.99 8.29-3.57 3.95-1.65 4.77-1.93 5.3-1.94.12 0 .38.03.55.17.14.12.18.28.2.45-.01.06.01.24 0 .38z"/>
                  </svg>
                )
              },
              {
                name: 'Max',
                href: 'https://max.ru/u/f9LHodD0cOLwsOy0FZ9gyOqzcqVdbhGzOtLpvrs3mIBzj6rFpT_d2b3boSg',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.6 14.2c-.3.4-.7.6-1.2.6-.4 0-.8-.1-1.1-.4l-2.3-2.2-2.3 2.2c-.3.3-.7.4-1.1.4-.5 0-.9-.2-1.2-.6-.3-.4-.3-.9 0-1.3l2.3-2.2-2.3-2.2c-.3-.4-.3-.9 0-1.3.3-.4.7-.6 1.2-.6.4 0 .8.1 1.1.4l2.3 2.2 2.3-2.2c.3-.3.7-.4 1.1-.4.5 0 .9.2 1.2.6.3.4.3.9 0 1.3l-2.3 2.2 2.3 2.2c.3.4.3.9 0 1.3z"/>
                  </svg>
                )
              }
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#ef5d2b] hover:text-white transition-all hover:shadow-lg hover:shadow-orange-500/25"
                aria-label={social.name}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 bg-[#0a0a0a] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}timoshin_logo.png`}
            alt="Денис Тимошин"
            className="w-8 h-8 object-contain"
          />
          <span className="text-sm text-gray-600">© 2026 Денис Тимошин</span>
        </div>
        <p className="text-sm text-gray-600">Курсы IT без воды</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="font-sans antialiased text-white bg-[#0a0a0a] overflow-x-hidden selection:bg-[#ef5d2b] selection:text-white">
      <style>{`

        body {
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
        ::selection {
          background: #ef5d2b;
          color: white;
        }

        .floating-orb {
          animation: floatOrb 10s ease-in-out infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(15px, -20px, 0) scale(1.05); }
          66% { transform: translate3d(-10px, -30px, 0) scale(1.1); }
        }

        .pulse-dot {
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }

        .arrow-bounce {
          animation: arrowBounce 1.5s ease-in-out infinite;
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }

        .reviews-slider::-webkit-scrollbar { display: none; }
        .reviews-slider { -ms-overflow-style: none; scrollbar-width: none; }

        @media (hover: none) {
          .group:hover .group-hover\\:opacity-100 { opacity: 0; }
        }
        body, html {
            margin: 0;
            padding: 0;
        }

        * {
            box-sizing: border-box;
        }
        @media (max-width: 768px) {
            .floating-orb { display: none !important; }
            .pulse-dot { animation: none !important; }
            .arrow-bounce { animation: none !important; }
}
        section[id] {
            scroll-margin-top: 65px;
}


      `}</style>
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Courses />
      <Reviews />
      <FAQSection />
      <Contact />
      <Footer />
    </div>
  );
}
