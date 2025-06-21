<template>
  <div class="font-crimson bg-gradient-to-br from-sky-300 to-emerald-300 min-h-screen text-gray-700 leading-relaxed">
    <div class="max-w-6xl mx-auto px-5">
      
      <header class="text-center py-16 pb-10 relative overflow-hidden">
        
        <div class="absolute top-1/2 left-[-100px] transform -translate-y-1/2 text-[12rem] opacity-15 pointer-events-none z-10 animate-float-left md:block hidden"><ThumbsUp class="w-32 h-32" /></div>
        <div class="absolute top-1/2 right-[-100px] transform -translate-y-1/2 text-[12rem] opacity-15 pointer-events-none z-10 animate-float-right md:block hidden"><ThumbsUp class="w-32 h-32" /></div>
        
        <div class="relative z-20">
          <h1 class="font-crimson text-6xl md:text-7xl font-bold text-white mb-5 tracking-tight">My affirms</h1>
          <p class="font-crimson text-xl text-white/90 italic mb-8 font-normal">
            Affirmations that reveal, not just heal
          </p>
          <p class="font-crimson text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-7">
            Twoja osobista aplikacja do afirmacji. Stwórz, organizuj i odtwarzaj pozytywne afirmacje które 
            zmienią Twoje życie.
          </p>
          <div class="flex gap-5 justify-center flex-wrap mb-16">
            <button 
              @click="$router.push('/auth')"
              class="font-crimson px-8 py-4 border-0 text-base font-semibold cursor-pointer transition-all duration-300 no-underline inline-block bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:text-white rounded-lg shadow-lg"
            >
              Zacznij za darmo
            </button>
            <button 
              @click="scrollToDemo"
              class="font-crimson px-8 py-4 border-0 text-base font-semibold cursor-pointer transition-all duration-300 no-underline inline-block bg-transparent border-2 border-white/50 text-white hover:bg-white/15 hover:text-white rounded-lg"
            >
              Zobacz demo
            </button>
          </div>
        </div>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        <div class="bg-white/95 p-10 rounded-3xl shadow-lg transition-all duration-300 backdrop-blur-sm hover:-translate-y-2 hover:shadow-xl feature-card">
          <div class="w-15 h-15 bg-gradient-to-br from-cyan-600 to-cyan-400 rounded-2xl flex items-center justify-center mb-5 text-2xl">
            <Target class="w-6 h-6" />
          </div>
          <h3 class="font-crimson text-xl font-semibold text-gray-800 mb-4">
            Projekty afirmacji
          </h3>
          <p class="font-crimson text-gray-500 leading-relaxed">
            Organizuj swoje afirmacje w tematyczne projekty. Kariera, zdrowie, relacje - 
            wszystko w jednym miejscu.
          </p>
        </div>
        
        <div class="bg-white/95 p-10 rounded-3xl shadow-lg transition-all duration-300 backdrop-blur-sm hover:-translate-y-2 hover:shadow-xl feature-card">
          <div class="w-15 h-15 bg-gradient-to-br from-cyan-600 to-cyan-400 rounded-2xl flex items-center justify-center mb-5 text-2xl">
            <Music class="w-6 h-6" />
          </div>
          <h3 class="font-crimson text-xl font-semibold text-gray-800 mb-4">
            Odtwarzanie głosowe
          </h3>
          <p class="font-crimson text-gray-500 leading-relaxed">
            Słuchaj swoich afirmacji z naturalnym głosem. Idealne na poranną rutynę lub 
            medytację.
          </p>
        </div>
        
        <div class="bg-white/95 p-10 rounded-3xl shadow-lg transition-all duration-300 backdrop-blur-sm hover:-translate-y-2 hover:shadow-xl feature-card">
          <div class="w-15 h-15 bg-gradient-to-br from-cyan-600 to-cyan-400 rounded-2xl flex items-center justify-center mb-5 text-2xl">
            <BarChart3 class="w-6 h-6" />
          </div>
          <h3 class="font-crimson text-xl font-semibold text-gray-800 mb-4">
            Śledzenie postępów
          </h3>
          <p class="font-crimson text-gray-500 leading-relaxed">
            Monitoruj swoją praktykę afirmacji i buduj pozytywne nawyki dzień po dniu.
          </p>
        </div>
      </section>

      <section id="demo" class="bg-white/95 rounded-3xl p-16 mb-16 backdrop-blur-sm shadow-lg">
        <h2 class="font-crimson text-center text-4xl font-bold text-gray-800 mb-12">
          Jak to działa?
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div class="text-center">
            <div class="step-number w-15 h-15 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-400 text-white rounded-2xl flex items-center justify-center font-orbitron font-black text-xl mx-auto mb-5 shadow-lg relative overflow-hidden">
              1
            </div>
            <h3 class="font-crimson text-lg font-semibold text-gray-800 mb-3">
              Utwórz projekt
            </h3>
            <p class="font-crimson text-gray-500 leading-6">
              Zacznij od stworzenia projektu, np. "Pewność siebie"
            </p>
          </div>
          
          <div class="text-center">
            <div class="step-number w-15 h-15 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-400 text-white rounded-2xl flex items-center justify-center font-orbitron font-black text-xl mx-auto mb-5 shadow-lg relative overflow-hidden">
              2
            </div>
            <h3 class="font-crimson text-lg font-semibold text-gray-800 mb-3">
              Dodaj afirmacje
            </h3>
            <p class="font-crimson text-gray-500 leading-6">
              Wpisz pozytywne afirmacje które chcesz praktykować
            </p>
          </div>
          
          <div class="text-center">
            <div class="step-number w-15 h-15 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-400 text-white rounded-2xl flex items-center justify-center font-orbitron font-black text-xl mx-auto mb-5 shadow-lg relative overflow-hidden">
              3
            </div>
            <h3 class="font-crimson text-lg font-semibold text-gray-800 mb-3">
              Rozpocznij sesję
            </h3>
            <p class="font-crimson text-gray-500 leading-6">
              Kliknij play i słuchaj swoich afirmacji
            </p>
          </div>
        </div>

        <div class="bg-slate-50 rounded-2xl p-8 mt-10">
          <h4 class="font-crimson text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <Clipboard class="w-5 h-5" /> Pewność siebie
          </h4>
          <ul class="list-none p-0">
            <li class="font-crimson py-2 text-gray-600 flex items-center gap-3">
              <span class="text-emerald-600 font-bold"><Check class="w-4 h-4" /></span>
              Jestem pewny swojej wartości
            </li>
            <li class="font-crimson py-2 text-gray-600 flex items-center gap-3">
              <span class="text-emerald-600 font-bold"><Check class="w-4 h-4" /></span>
              Mam prawo do sukcesu
            </li>
            <li class="font-crimson py-2 text-gray-600 flex items-center gap-3">
              <span class="text-emerald-600 font-bold"><Check class="w-4 h-4" /></span>
              Każdego dnia staję się silniejszy
            </li>
          </ul>
        </div>

        <div class="text-center mt-10">
          <button class="font-crimson px-10 py-5 text-lg bg-transparent text-gray-800 border-0 font-semibold cursor-pointer transition-all duration-300 hover:bg-cyan-600/10 hover:text-purple-500 rounded-lg btn-large">
            <Play class="w-4 h-4" /> Rozpocznij sesję
          </button>
        </div>
      </section>

      <footer class="text-center py-10 text-white/80">
        <p class="font-crimson">
          &copy; 2024 My affirms. Stwórz pozytywne zmiany w swoim życiu.
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { Target, Music, BarChart3, ThumbsUp, Clipboard, Play, Check } from 'lucide-vue-next'

const scrollToDemo = () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  
  const cards = document.querySelectorAll('.feature-card')
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)'
    })
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)'
    })
  })

  document.querySelectorAll('.btn-large, button').forEach(button => {
    button.addEventListener('click', function(e) {
      
      const ripple = document.createElement('span')
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `
      
      this.style.position = 'relative'
      this.style.overflow = 'hidden'
      this.appendChild(ripple)
      
      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })
})

useHead({
  title: 'My affirms - Twoja aplikacja do afirmacji',
  meta: [
    { 
      name: 'description', 
      content: 'Stwórz, organizuj i odtwarzaj pozytywne afirmacje. Zmień swoje życie z My affirms - darmowej aplikacji do praktyki afirmacji.' 
    }
  ]
})
</script>

<style scoped>
@keyframes floatLeft {
  0%, 100% { transform: translateY(-50%) rotate(-5deg); }
  50% { transform: translateY(-60%) rotate(5deg); }
}

@keyframes floatRight {
  0%, 100% { transform: translateY(-50%) rotate(5deg); }
  50% { transform: translateY(-60%) rotate(-5deg); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
}

@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-float-left {
  animation: floatLeft 6s ease-in-out infinite;
}

.animate-float-right {
  animation: floatRight 6s ease-in-out infinite reverse;
}

.step-number::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s ease-in-out infinite;
}

.w-15 {
  width: 3.75rem;
}

.h-15 {
  height: 3.75rem;
}
</style>