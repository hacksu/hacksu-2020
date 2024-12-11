<template>
    <div class="fall-fest-page">
        <div class="hero-section">
            <div class="hero-content">
                <h1>IBM Fall Fest</h1>
                <p class="subtitle">Join us for an exciting celebration of technology and innovation!</p>
            </div>
            <div class="hero-wave">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path fill="#ffffff" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,128C672,128,768,160,864,176C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
        </div>

        <div class="content-section">
            <div class="info-grid">
                <InformationCard 
                    v-for="(information, j) in informations" 
                    :key="information.id"
                    :information="information"
                    class="info-card"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { remult } from 'remult';
import { Information } from "../../db/entities.js";
import InformationCard from "../components/InformationCard.vue";

const informations = ref([]);
const repo = remult.repo(Information);

onMounted(async () => {
    try {
        const items = await repo.find();
        informations.value = items.sort((a, b) => a.order - b.order);
        console.log('Information loaded:', informations.value);
    } catch (error) {
        console.error('Error loading information:', error);
    }
});
</script>

<style scoped lang="scss">
.fall-fest-page {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.hero-section {
    background: linear-gradient(135deg, #4683FF 0%, #35c982 100%);
    min-height: 60vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 2rem;
    color: white;

    .hero-content {
        max-width: 800px;
        margin: 0 auto;
        z-index: 1;

        h1 {
            font-size: 4rem;
            margin: 0 0 1rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);

            @media (max-width: 768px) {
                font-size: 3rem;
            }
        }

        .subtitle {
            font-size: 1.5rem;
            margin: 0;
            opacity: 0.9;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);

            @media (max-width: 768px) {
                font-size: 1.25rem;
            }
        }
    }

    .hero-wave {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        line-height: 0;
        transform: rotate(180deg);

        svg {
            position: relative;
            display: block;
            width: 100%;
            height: 150px;

            @media (max-width: 768px) {
                height: 100px;
            }
        }
    }
}

.content-section {
    background-color: white;
    padding: 4rem 2rem;

    @media (max-width: 768px) {
        padding: 2rem 1rem;
    }
}

.info-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.info-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    // Override some InformationCard styles for better integration
    :deep(.information-container) {
        margin: 0;
        background: linear-gradient(135deg, #9b4cbb 0%, #ad52cb 100%);

        &:first-of-type {
            margin-top: 0;
        }
    }

    :deep(.information) {
        padding: 1.5rem;
    }

    :deep(.information-title) {
        h2 {
            font-size: 1.75rem;
            font-weight: 600;
        }
    }

    :deep(.event-text) {
        font-size: 1.1rem;
        line-height: 1.6;
    }
}
</style>
