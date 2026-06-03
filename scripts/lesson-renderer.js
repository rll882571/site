// scripts/lesson-renderer.js
import { lesson1Data } from './lessons-data.js';

export function renderLesson1() {
    const mainElement = document.querySelector('.lesson-container');
    
    if (!mainElement) return;

    // Injeta a estrutura base do Grid das duas colunas
    mainElement.innerHTML = `
        <h1 class="lesson-title">LESSON 1</h1>
        <div class="lesson-grid">
            <section class="verb-column">
                <div class="verb-header">
                    <div class="img-placeholder main-img">
                        <img src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=150&auto=format&fit=crop" alt="To drink" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    </div>
                    <h2>To drink<br>Drank</h2>
                </div>
                <div class="practice-list" id="drink-list"></div>
            </section>

            <section class="verb-column">
                <div class="verb-header">
                    <div class="img-placeholder main-img">
                        <img src="https://images.unsplash.com/photo-1522198644747-d5bc295988d5?w=150&auto=format&fit=crop" alt="To speak" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    </div>
                    <h2>To speak<br>Spoke</h2>
                </div>
                <div class="practice-list" id="speak-list"></div>
            </section>
        </div>
    `;

    const drinkList = document.getElementById('drink-list');
    const speakList = document.getElementById('speak-list');

    // Mapeamento de links diretos e específicos para cada bebida (evita fotos repetidas)
    const drinkImages = {
        "water": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=80&auto=format&fit=crop",
        "milk": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80&auto=format&fit=crop",
        "coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&auto=format&fit=crop",
        "juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=80&auto=format&fit=crop",
        "soda": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=80&auto=format&fit=crop",
        "tea": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=80&auto=format&fit=crop",
        "cola": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=80&auto=format&fit=crop", // Coca/Cola
        "wine": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=80&auto=format&fit=crop",
        "beer": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=80&auto=format&fit=crop"
    };

    // Gera as linhas de TO DRINK com os links diretos corretos
    lesson1Data.drink.forEach(item => {
        const imgUrl = drinkImages[item.keyword] || "https://placehold.co/40x30?text=🥛";
        const row = document.createElement('div');
        row.className = 'practice-row';
        row.innerHTML = `
            <button class="play-btn">▶</button>
            <p class="practice-text">${item.text}</p>
            <div class="img-placeholder icon-img">
                <img src="${imgUrl}" alt="${item.keyword}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
            </div>
        `;
        drinkList.appendChild(row);
    });

    // Gera as linhas de TO SPEAK (Mantendo as bandeiras que já deram certo!)
    lesson1Data.speak.forEach(item => {
        const row = document.createElement('div');
        row.className = 'practice-row';
        row.innerHTML = `
            <button class="play-btn">▶</button>
            <p class="practice-text">${item.text}</p>
            <div class="img-placeholder icon-img">
                <img src="https://flagcdn.com/w40/${item.flag}.png" alt="${item.text}" style="width: 100%; height: 100%; object-fit: contain; border: 1px solid #ddd; border-radius: 2px;">
            </div>
        `;
        speakList.appendChild(row);
    });
}