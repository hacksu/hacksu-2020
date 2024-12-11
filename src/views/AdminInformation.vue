<template>
    <div class="admin-info-page">
        <div class="page-header">
            <h1>Admin Information</h1>
            <p class="subtitle">Manage HacKSU's information cards and content</p>
        </div>

        <div class="info-grid">
            <div class="info-card" v-for="(info, j) in infoToDisplay" :key="info.id">
                <div class="info-form">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" v-model="info.title" class="form-input" 
                            placeholder="Enter title..." />
                    </div>

                    <div class="form-group">
                        <label>Content (Markdown)</label>
                        <textarea v-model="info.content" class="form-textarea" 
                            placeholder="Write content using Markdown..."></textarea>
                    </div>

                    <div class="form-group">
                        <label>Order</label>
                        <input type="number" v-model="info.order" class="form-input" 
                            placeholder="Display order (e.g., 1, 2, 3...)" />
                    </div>

                    <div class="button-group">
                        <button class="btn btn-primary" @click="update(info, j)">
                            {{j === 0 ? "Add New Card" : "Save Changes"}}
                            <span v-if="confirmation.has(j)" class="confirmation-icon">✓</span>
                        </button>
                        <button class="btn btn-danger" v-if="j !== 0" @click="remove(info, j)">
                            Delete Card
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from "vue";
import { remult } from "remult";
import { Information } from "../../db/entities.js";

const info = ref([]);
const confirmation = ref(new Set());
const repo = remult.repo(Information);
const newInfo = reactive(repo.create({ order: 0 }));

const infoToDisplay = computed(() => [newInfo, ...info.value.sort((a, b) => a.order - b.order)]);

let unsubscribe;
onMounted(async () => {
    try {
        unsubscribe = repo.liveQuery({
            orderBy: { order: "asc" }
        }).subscribe(info => {
            info.value = info.applyChanges(info.value);
            console.log('Information cards loaded:', info.value);
        });
    } catch (error) {
        console.error('Error loading information:', error);
    }
});

onUnmounted(() => {
    if (unsubscribe) {
        unsubscribe();
    }
});

const update = async (info, j) => {
    try {
        if (!info.title.trim()) {
            alert("Title is required");
            return;
        }

        let update;
        if (j === 0) {
            update = await repo.insert(newInfo);
        } else {
            update = await repo.update(info.id, info);
        }
        
        confirmation.value.add(j);
        setTimeout(() => confirmation.value.delete(j), 3000);
        
        if (j === 0) {
            Object.assign(newInfo, repo.create({ order: 0 }));
        }
    } catch (error) {
        console.error('Error updating information:', error);
        alert("Error updating information: " + error.message);
    }
};

const remove = async (info, j) => {
    if (confirm(`Are you sure you want to delete the card "${info.title}"? This action cannot be undone.`)) {
        try {
            await repo.delete(info);
        } catch (error) {
            console.error('Error deleting information:', error);
            alert("Error deleting information: " + error.message);
        }
    }
};
</script>

<style scoped lang="scss">
.admin-info-page {
    padding: 2rem;
    background-color: #f5f5f5;
    min-height: 100vh;
    color: #2c3e50;
}

.page-header {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding-top: 80px;
    text-align: center;

    h1 {
        color: #2c3e50;
        font-size: 2.5rem;
        margin: 0 0 0.5rem;
    }

    .subtitle {
        color: #666;
        font-size: 1.1rem;
        margin: 0;
    }
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.info-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-2px);
    }
}

.info-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        color: #2c3e50;
        font-weight: 500;
    }
}

.form-input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
    color: #2c3e50;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
    }

    &::placeholder {
        color: #999;
    }
}

.form-textarea {
    @extend .form-input;
    min-height: 200px;
    resize: vertical;
    font-family: inherit;
    line-height: 1.5;
}

.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
        opacity: 0.9;
    }
}

.btn-primary {
    background-color: #3498db;
    color: white;
    flex: 2;

    &:hover {
        background-color: #2980b9;
    }
}

.btn-danger {
    background-color: #e74c3c;
    color: white;
    flex: 1;

    &:hover {
        background-color: #c0392b;
    }
}

.confirmation-icon {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}
</style>
