// scripts/lesson-renderer.js
import { lesson1Data } from './lessons-data.js';

export function renderLesson1() {
    const mainElement = document.querySelector('.lesson-container');
    
    if (!mainElement) return;

    // Injeta a estrutura base do Grid das duas colunas
    // Atualizado: Imagens principais agora apontam para seus arquivos locais ("women_drinking_water.png" e "speaking.png")
    mainElement.innerHTML = `
        <h1 class="lesson-title">LESSON 1</h1>
        <div class="lesson-grid">
            <section class="verb-column">
                <div class="verb-header">
                    <div class="img-placeholder main-img">
                        <img src="images/women_drinking_water.png" alt="To drink" style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%;">
                    </div>
                    <h2>To drink<br>Drank</h2>
                </div>
                <div class="practice-list" id="drink-list"></div>
            </section>

            <section class="verb-column">
                <div class="verb-header">
                    <div class="img-placeholder main-img">
                        <img src="images/speaking.png" alt="To speak" style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%;">
                    </div>
                    <h2>To speak<br>Spoke</h2>
                </div>
                <div class="practice-list" id="speak-list"></div>
            </section>
        </div>
    `;

    const drinkList = document.getElementById('drink-list');
    const speakList = document.getElementById('speak-list');

    // Mapeamento de links para a sua pasta local de imagens (Mapeado conforme o print)
    const drinkImages = {
        "water": "images/water.png",
        "milk": "images/milk.png",
        "coffee": "images/coffee.png",
        "juice": "images/juice.png",
        "soda": "images/soda.png",
        "tea": "images/tea.png",
        "cola": "images/soda.png", // Usando a imagem de soda disponível
        "wine": "images/wine.png",
        "beer": "images/beer.png"
    };

    // Mapeamento das bandeiras locais para o bloco TO SPEAK
    const flagImages = {
        "us": "images/download (1).png", // Imagem da bandeira dos EUA no seu print
        "en": "images/download (1).png",
        "fr": "images/french.png",
        "de": "images/german.png",
        "it": "images/italian.png",
        "pt": "images/portuguese.png",
        "es": "images/spanish.png"
    };

    // Gera as linhas de TO DRINK com as imagens locais padronizadas
    lesson1Data.drink.forEach(item => {
        const imgUrl = drinkImages[item.keyword] || "images/download.png"; // fallback para o ícone de download caso falte algo
        const row = document.createElement('div');
        row.className = 'practice-row';
        row.innerHTML = `
            <button class="play-btn">▶</button>
            <p class="practice-text">${item.text}</p>
            <div class="img-placeholder icon-img" style="width: 50px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <img src="${imgUrl}" alt="${item.keyword}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;">
            </div>
        `;
        drinkList.appendChild(row);
    });

    // Gera as linhas de TO SPEAK com as bandeiras locais padronizadas
    lesson1Data.speak.forEach(item => {
        // Busca a bandeira mapeada ou usa a dos EUA como padrão caso venha um código não mapeado
        const imgUrl = flagImages[item.flag] || "images/download (1).png"; 
        const row = document.createElement('div');
        row.className = 'practice-row';
        row.innerHTML = `
            <button class="play-btn">▶</button>
            <p class="practice-text">${item.text}</p>
            <div class="img-placeholder icon-img" style="width: 50px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <img src="${imgUrl}" alt="${item.text}" style="width: 100%; height: 100%; object-fit: contain; border: 1px solid #ddd; border-radius: 2px;">
            </div>
        `;
        speakList.appendChild(row);
    });
}