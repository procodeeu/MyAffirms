<template>
  <div class="min-h-screen bg-brand-bg">
    
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-white mb-4 font-crimson">
          My affirms
        </h1>
        <p class="text-2xl text-white mb-8 max-w-2xl mx-auto font-crimson italic opacity-95">
          Affirmations that reveal, not just heal
        </p>
        <p class="text-lg text-white mb-8 max-w-2xl mx-auto opacity-90">
          Twoja osobista aplikacja do afirmacji. Stwórz, organizuj i odtwarzaj pozytywne afirmacje które zmienią Twoje życie.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            @click="$router.push('/auth')"
            class="bg-white hover:bg-gray-100 text-brand-bg px-8 py-3 rounded-lg font-medium text-lg shadow-lg"
          >
            Zacznij za darmo
          </button>
          <button 
            @click="scrollToDemo"
            class="border-2 border-white text-white hover:bg-white hover:text-brand-bg px-8 py-3 rounded-lg font-medium text-lg transition-all"
          >
            Zobacz demo
          </button>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="bg-white rounded-lg p-6 shadow-md">
          <div class="text-blue-600 text-3xl mb-4"><Target class="w-6 h-6" /></div>
          <h3 class="text-xl font-semibold mb-3">Projekty afirmacji</h3>
          <p class="text-gray-600">Organizuj swoje afirmacje w tematyczne projekty. Kariera, zdrowie, relacje - wszystko w jednym miejscu.</p>
        </div>
        
        <div class="bg-white rounded-lg p-6 shadow-md">
          <div class="text-blue-600 text-3xl mb-4"><Music class="w-6 h-6" /></div>
          <h3 class="text-xl font-semibold mb-3">Odtwarzanie głosowe</h3>
          <p class="text-gray-600">Słuchaj swoich afirmacji z naturalnym głosem. Idealne na poranną rutynę lub medytację.</p>
        </div>
        
        <div class="bg-white rounded-lg p-6 shadow-md">
          <div class="text-blue-600 text-3xl mb-4"><BarChart3 class="w-6 h-6" /></div>
          <h3 class="text-xl font-semibold mb-3">Śledzenie postępów</h3>
          <p class="text-gray-600">Monitoruj swoją praktykę afirmacji i buduj pozytywne nawyki dzień po dniu.</p>
        </div>
      </div>

      <div id="demo" class="bg-white rounded-lg shadow-lg p-8 mb-16">
        <h2 class="text-3xl font-bold text-center mb-8">Jak to działa?</h2>
        
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 class="font-semibold">Utwórz projekt</h4>
                  <p class="text-gray-600">Zacznij od stworzenia projektu, np. "Pewność siebie"</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 class="font-semibold">Dodaj afirmacje</h4>
                  <p class="text-gray-600">Wpisz pozytywne afirmacje które chcesz praktykować</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 class="font-semibold">Rozpocznij sesję</h4>
                  <p class="text-gray-600">Kliknij play i słuchaj swoich afirmacji</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="bg-white rounded-lg p-4 mb-4 border">
              <h5 class="font-medium mb-2"><Folder class="w-16 h-16" /> Pewność siebie</h5>
              <div class="space-y-2 text-sm text-gray-600">
                <p><Check class="w-4 h-4" /> Jestem pewny swojej wartości</p>
                <p><Check class="w-4 h-4" /> Mam prawo do sukcesu</p>
                <p><Check class="w-4 h-4" /> Każdego dnia staję się silniejszy</p>
              </div>
            </div>
            <button class="w-full bg-blue-600 text-white py-2 rounded font-medium">
              <Play class="w-4 h-4" /> Rozpocznij sesję
            </button>
          </div>
        </div>
      </div>

      <div class="text-center bg-white text-brand-bg rounded-lg p-12 shadow-lg">
        <h2 class="text-3xl font-bold mb-4">Gotowy na zmianę?</h2>
        <p class="text-xl mb-6 opacity-80">
          Dołącz do tysięcy osób które już zmieniły swoje życie z My affirms
        </p>
        <button 
          @click="$router.push('/auth')"
          class="bg-brand-bg text-white hover:bg-opacity-90 px-8 py-3 rounded-lg font-medium text-lg shadow-lg"
        >
          Rozpocznij teraz - za darmo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Target, Music, BarChart3, Folder, Play, Check } from 'lucide-vue-next'

const scrollToDemo = () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })
}

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